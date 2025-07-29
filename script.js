
const sheetId = "1y_EVqNg-reS3xV-Kn6cmTou7u_6kuyqykNdgdzXEMkE";
const apiKey = "AIzaSyD1zkB93JoLUrNX7nN2qEcavFRE-P1r9Eg";
const range = "Rank!BF5:AI20";
let barChart, donutChart;

window.onload = () => {
  loadSheetData();
};

function loadSheetData(){
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  axios.get(url)
    .then(res => {
      const rows = res.data.values || [];
      if (!rows.length) return alert("डेटा उपलब्ध नाही.");
      processData(rows);
    })
    .catch(err => {
      console.error("Error:", err);
      alert("डेटा लोड करण्यात अडचण.");
    });
}

function processData(rows){
  const schemes = rows[0];
  const values = rows.slice(1).map(r => r.map(x => parseFloat(x) || 0));
  const totals = values.map((row, i) => ({
    taluka: "तालुका " + (i + 1),
    values: row,
    total: row.reduce((a,b) => a+b, 0)
  }));
  const sorted = [...totals].sort((a,b) => b.total - a.total);

  renderBarChart(sorted, schemes);
  renderDonutChart(sorted.slice(0, 5));
  renderKPI(sorted);
  renderTable(sorted, schemes);
}

function renderBarChart(data, schemes){
  const ctx = document.getElementById("barChart").getContext("2d");
  barChart?.destroy();
  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(d => d.taluka),
      datasets: [{
        label: "एकूण गुण",
        data: data.map(d => d.total),
        backgroundColor: "#60a5fa"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

function renderDonutChart(data){
  const ctx = document.getElementById("donutChart").getContext("2d");
  donutChart?.destroy();
  donutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data.map(d => d.taluka),
      datasets: [{
        data: data.map(d => d.total),
        backgroundColor: ["#4ade80","#facc15","#f87171","#60a5fa","#c084fc"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "right" } }
    }
  });
}

function renderKPI(data){
  const top = data[0], mid = data[Math.floor(data.length/2)], bot = data.at(-1);
  document.getElementById("kpiWrapper").innerHTML = `
    <div class="kpi">🏆 टॉप तालुका<br>${top.taluka}<br>${top.total}</div>
    <div class="kpi">⚖️ मध्यम तालुका<br>${mid.taluka}<br>${mid.total}</div>
    <div class="kpi">🚨 तळातला तालुका<br>${bot.taluka}<br>${bot.total}</div>
  `;
}

function renderTable(data, schemes){
  const thRow = `<tr><th>रँक</th><th>तालुका</th><th>एकूण गुण</th>${
    schemes.map(s => `<th>${s}</th>`).join("")
  }</tr>`;
  const trRows = data.map((d, i) => `
    <tr>
      <td>${i+1}</td><td>${d.taluka}</td><td>${d.total}</td>${
        d.values.map(v => `<td>${v}</td>`).join("")
      }
    </tr>
  `).join("");
  document.querySelector("#rankingTable thead").innerHTML = thRow;
  document.querySelector("#rankingTable tbody").innerHTML = trRows;
}
