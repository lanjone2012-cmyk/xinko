const rows = document.querySelector("#leadRows");
const note = document.querySelector("#leadNote");
const exportButton = document.querySelector("#exportCsv");
const clearButton = document.querySelector("#clearLeads");

function readLeads() {
  try {
    return JSON.parse(localStorage.getItem("xinko-inquiries") || "[]");
  } catch {
    return [];
  }
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeCell(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
    return entities[char];
  });
}

function renderLeads() {
  const leads = readLeads();
  rows.innerHTML = leads
    .map(
      (lead) => `
        <tr>
          <td>${escapeCell(formatDate(lead.createdAt))}</td>
          <td>${escapeCell(lead.product)}</td>
          <td>${escapeCell(lead.scenario)}</td>
          <td>${escapeCell(lead.budget)}</td>
          <td>${escapeCell(lead.contact)}</td>
          <td>${escapeCell(lead.followUpChannel)}</td>
          <td>${escapeCell(lead.needs || lead.deviceCount || "")}</td>
        </tr>
      `,
    )
    .join("");
  note.textContent = leads.length ? `当前共有 ${leads.length} 条本机线索。` : "当前还没有本机线索。";
}

function toCsv(leads) {
  const headers = [
    "createdAt",
    "product",
    "scenario",
    "budget",
    "contact",
    "followUpChannel",
    "deviceCount",
    "needs",
  ];
  const lines = [headers.join(",")];
  leads.forEach((lead) => {
    lines.push(headers.map((key) => `"${String(lead[key] ?? "").replaceAll('"', '""')}"`).join(","));
  });
  return lines.join("\n");
}

exportButton?.addEventListener("click", () => {
  const leads = readLeads();
  const blob = new Blob([toCsv(leads)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `xinko-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
});

clearButton?.addEventListener("click", () => {
  if (!confirm("确认清空本机保存的询盘线索？")) return;
  localStorage.removeItem("xinko-inquiries");
  renderLeads();
});

renderLeads();
