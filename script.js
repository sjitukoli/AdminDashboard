const API_KEY = "AIzaSyD1zkB93JoLUrNX7nN2qEcavFRE-P1r9Eg";
const SHEET_ID = "1y_EVqNg-reS3xV-Kn6cmTou7u_6kuyqykNdgdzXEMkE";
const RANGE = "Rank!BF5:AI20";

let data = [], schemes = [], selectedSchemes = new Set(), selectedTalukas = new Set();

window.onload = () => {
  fetchSheetData();
};

async function fetchSheetData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  const values = json.values;
  if (!values || values.length < 2) return;
  schemes = values[0];
  data = values.slice(1).map((row, i) => {
    const values = row.map(x => parseFloat(x) || 0);
    const total = values.reduce((a, b) => a + b, 0);
    return {
      taluka: `तालुका ${i + 1}`,
      values,
      total
    };
  });

  setupFilters();
  updateDashboard();
}

function setupFilters() {
  const schemeSelect = document.getElementById("schemeSelect");
  schemeSelect.innerHTML = schemes.map(s => `<option value="${s}" selected>${s}</option>`).join("");
  schemeSelect.addEventListener("change", () => {
    selectedSchemes.clear();
    Array.from(schemeSelect.selectedOptions).forEach(opt => selectedSchemes.add(opt.value));
    updateDashboard();
  });
  selectedSchemes = new Set(schemes);

  const talukaDiv = document.getElementById("talukaButtons");
  talukaDiv.innerHTML = data.map(d => `
    <button onclick="toggleTaluka(this, '${d.taluka}')">${d.taluka}</button>
  `).join("");
}

function toggleTaluka(btn, taluka) {
  if (selectedTalukas.has(taluka)) {
    selectedTalukas.delete(taluka);
    btn.classList.remove("active");
  } else {
    selectedTalukas.add(taluka);
    btn.classList.add("active");
  }
  updateDashboard();
}

function updateDashboard() {
  const filtered = data.filter(d => selectedTalukas.size === 0 || selectedTalukas.has(d.taluka));
  renderKPI(filtered);
  renderBarChart(filtered);
  renderDonutChart(filtered);
  renderTable(filtered);
}

function renderKPI(arr) {
  const sorted = [...arr].sort((a, b) => b.total - a.total);
  let html = '';
  if (sorted[0]) html += `<div class="kpi top">🥇 ${sorted[0].taluka}<br/>${sorted[0].total.toFixed(1)}</div>`;
  if (sorted.length > 2) {
    const mid = sorted[Math.floor(sorted.length / 2)];
    html += `<div class="kpi mid">⚖️ ${mid.taluka}<br/>${mid.total.toFixed(1)}</div>`;
  }
  if (sorted.at(-1)) html += `<div class="kpi bot">🔻 ${sorted.at(-1).taluka}<br/>${sorted.at(-1).total.toFixed(1)}</div>`;
  document.getElementById("kpiWrapper").innerHTML = html;
}

function renderBarChart(arr) {
  const ctx = document.getElementById("barChart").getContext("2d");
  window.barChart?.destroy();
  window.barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: arr.map(d => d.taluka),
      datasets: [{
        label: "Total",
        data: arr.map(d => d.total),
        backgroundColor: "#6366f1"
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

function renderDonutChart(arr) {
  const topSchemes = schemes.map((s, i) => {
    const total = arr.map(d => d.values[i] || 0).reduce((a, b) => a + b, 0);
    return { scheme: s, total };
  }).sort((a, b) => b.total - a.total).slice(0, 5);

  const ctx = document.getElementById("donutChart").getContext("2d");
  window.donutChart?.destroy();
  window.donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: topSchemes.map(s => s.scheme),
      datasets: [{
        data: topSchemes.map(s => s.total),
        backgroundColor: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"]
      }]
    },
    options: { responsive: true, plugins: { legend: { position: 'right' } } }
  });
}

function renderTable(arr) {
  const tbody = document.querySelector("#rankingTable tbody");
  const thead = document.querySelector("#rankingTable thead");
  const sorted = [...arr].sort((a, b) => b.total - a.total).map((d, i) => ({ ...d, rank: i + 1 }));

  thead.innerHTML = `<tr><th>रँक</th><th>तालुका</th><th>एकूण</th></tr>`;
  tbody.innerHTML = sorted.map((d, i) => `
    <tr class="${i < 5 ? 'top5' : i >= arr.length - 5 ? 'bot5' : 'mid5'}">
      <td>${d.rank}</td>
      <td>${d.taluka}</td>
      <td>${d.total.toFixed(1)}</td>
    </tr>
  `).join("");
}
