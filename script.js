const form = document.querySelector("#inquiryForm");
const note = document.querySelector("#formNote");
const inquiryEndpoint = window.XINKO_INQUIRY_ENDPOINT || "";

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
