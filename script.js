const form = document.querySelector("#inquiryForm");
const note = document.querySelector("#formNote");
const inquiryEndpoint = window.XINKO_INQUIRY_ENDPOINT || "";

const materialOptions = `
  <option value="">请选择型号</option>
  <optgroup label="欧标铝型材">
    <option>2020 欧标铝型材</option>
    <option>2040 欧标铝型材</option>
    <option>3030 欧标铝型材</option>
    <option>3060 欧标铝型材</option>
    <option>4040 欧标铝型材</option>
    <option>4080 欧标铝型材</option>
    <option>4545 欧标铝型材</option>
  </optgroup>
  <optgroup label="板材">
    <option>1.5 mm 铝板</option>
    <option>2.0 mm 铝板</option>
    <option>3.0 mm 铝板</option>
    <option>亚克力板</option>
    <option>木质桌板</option>
  </optgroup>
  <optgroup label="其他">
    <option>需要建议</option>
    <option>其他定制型号</option>
  </optgroup>
`;

function createMaterialRow() {
  const row = document.createElement("div");
  row.className = "material-row";
  row.innerHTML = `
    <select data-material-type aria-label="材料类型">
      <option value="">材料类型</option>
      <option>铝型材</option>
      <option>铝板</option>
      <option>桌板</option>
      <option>连接件</option>
      <option>其他材料</option>
    </select>
    <select data-material-model aria-label="材料型号">${materialOptions}</select>
    <input data-material-length type="number" min="0" step="1" placeholder="长度 mm" aria-label="长度 mm" />
    <input data-material-quantity type="number" min="1" step="1" placeholder="数量" aria-label="数量" />
    <button class="material-remove" type="button" aria-label="删除材料">×</button>
  `;
  row.querySelector(".material-remove").addEventListener("click", () => {
    if (document.querySelectorAll(".material-row").length > 1) row.remove();
  });
  return row;
}

function initMaterialBuilder() {
  if (!form) return;
  const accessories = form.querySelector(".option-fieldset");
  if (!accessories) return;
  const builder = document.createElement("fieldset");
  builder.className = "wide option-fieldset material-builder";
  builder.innerHTML = `
    <legend>材料明细清单</legend>
    <p class="field-help">逐行选择材料型号，并填写所需长度和数量。暂不确定时可选择“需要建议”。</p>
    <div class="material-list"></div>
    <button class="material-add" type="button">+ 添加材料</button>
  `;
  const list = builder.querySelector(".material-list");
  list.append(createMaterialRow());
  builder.querySelector(".material-add").addEventListener("click", () => list.append(createMaterialRow()));
  accessories.before(builder);
}

function readMaterials() {
  return [...document.querySelectorAll(".material-row")]
    .map((row) => {
      const type = row.querySelector("[data-material-type]").value;
      const model = row.querySelector("[data-material-model]").value;
      const length = row.querySelector("[data-material-length]").value;
      const quantity = row.querySelector("[data-material-quantity]").value;
      if (!type && !model && !length && !quantity) return "";
      return [type, model, length ? `${length} mm` : "", quantity ? `${quantity} 件` : ""]
        .filter(Boolean)
        .join(" / ");
    })
    .filter(Boolean)
    .join("；");
}

function readInquiries() {
  try {
    return JSON.parse(localStorage.getItem("xinko-inquiries") || "[]");
  } catch {
    return [];
  }
}

function saveInquiry(inquiry) {
  const inquiries = readInquiries();
  inquiries.push(inquiry);
  localStorage.setItem("xinko-inquiries", JSON.stringify(inquiries));
  return inquiries.length;
}

async function sendInquiry(inquiry) {
  if (!inquiryEndpoint) return { ok: true, mode: "local" };
  const response = await fetch(inquiryEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inquiry),
  });
  if (!response.ok) throw new Error("Inquiry endpoint failed");
  return response.json().catch(() => ({ ok: true, mode: "remote" }));
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.accessories = formData.getAll("accessories").join("、");
  data.materialList = readMaterials();
  const inquiry = {
    ...data,
    createdAt: new Date().toISOString(),
    sourcePage: window.location.pathname.split("/").pop() || "index.html",
  };
  const count = saveInquiry(inquiry);
  note.textContent = "正在提交需求...";

  try {
    await sendInquiry(inquiry);
    form.reset();
    note.textContent = inquiryEndpoint
      ? `已收到第 ${count} 条定制需求，并已同步到飞书。`
      : `已收到第 ${count} 条定制需求。当前版本会先保存在本机浏览器，正式上线时可接入飞书。`;
    window.setTimeout(() => {
      window.location.href = `./thanks.html?lead=${count}`;
    }, 700);
  } catch {
    note.textContent = "已保存到本机线索台账，但同步飞书失败。请检查接口配置后重试。";
  }
});

initMaterialBuilder();
