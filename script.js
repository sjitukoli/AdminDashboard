const sheetId = "1y_EVqNg-reS3xV-Kn6cmTou7u_6kuyqykNdgdzXEMkE";
const apiKey = "AIzaSyD1zkB93JoLUrNX7nN2qEcavFRE-P1r9Eg";
const sheetName = "Rank";
const range = `${sheetName}!BF5:AI5`;

function loadSheetData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  axios.get(url)
    .then(response => {
      const row = response.data.values?.[0] || [];
      const data = row.map(x => parseFloat(x) || 0);
      renderDonutChart(data);
    })
    .catch(error => {
      alert("डेटा लोड होत नाही: API Key / Sheet ID तपासा");
    });
}

function renderDonutChart(dataRow) {
  const ctx = document.getElementById("donutChart").getContext("2d");
  const labels = dataRow.map((_, i) => `Scheme ${i + 1}`);

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: dataRow,
        backgroundColor: [
          "#42a5f5", "#66bb6a", "#ffa726", "#ec407a", "#ab47bc",
          "#26c6da", "#ffca28", "#8d6e63", "#789262", "#ef5350",
          "#7e57c2", "#29b6f6"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'right' } }
    }
  });
}
