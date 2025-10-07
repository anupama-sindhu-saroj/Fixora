// -------------------------------
// 🌐 Fetch Analytics Data Function
// -------------------------------
async function loadAnalytics() {
  const dateRange = document.getElementById("date-filter").value;
  const location = document.getElementById("location-filter").value;
  const status = document.getElementById("status-filter").value;

  try {
    const res = await fetch(`http://localhost:5001/api/analytics?dateRange=${dateRange}&location=${location}&status=${status}`);
    const data = await res.json();

    // 🧾 Update KPIs
    document.querySelector(".kpi-card.fast p").innerText = `${data.avgResolveTime || 0} hrs`;
    document.querySelector(".kpi-card.slow p").innerText = `${data.pending || 0} pending`;
    document.querySelector(".kpi-card.compare p").innerText = `${data.resolved || 0} resolved`;
    document.querySelector(".kpi-card.reopen p").innerText = `${data.underReview || 0} under review`;

    // 👥 Citizen Stats
    document.querySelector(".citizen-card:nth-child(1) strong").innerText = data.activeUsers || 0;
    document.querySelector(".citizen-card:nth-child(2) strong").innerText = `${data.avgRating || 0} / 5`;
    document.querySelector(".citizen-card:nth-child(3) strong").innerText = data.topReporter || "N/A";

    // 💡 AI Insight
    const insight = document.querySelector(".ai-insight");
    insight.innerHTML = `💡 ${
      data.insightMessage ||
      "Analytics generated successfully based on current issue trends."
    }`;

    // 🎯 Chart Data: Categories
    updateCharts(data);
  } catch (err) {
    console.error("❌ Analytics fetch failed:", err);
  }
}

// -------------------------------
// 📊 Dynamic Chart Rendering
// -------------------------------
let pieChart, lineChart, barChart;

function updateCharts(data) {
  const categories = Object.keys(data.categoryCount || {});
  const categoryValues = Object.values(data.categoryCount || {});

  // Destroy existing charts before re-rendering (avoids duplicate canvas)
  if (pieChart) pieChart.destroy();
  if (lineChart) lineChart.destroy();
  if (barChart) barChart.destroy();

  // 🥧 Issues by Category
  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: categories.length ? categories : ["No Data"],
      datasets: [{
        data: categoryValues.length ? categoryValues : [1],
        backgroundColor: ["#4a3ce0", "#008080", "#28a745", "#e67e22", "#999"]
      }]
    }
  });

  // 📈 Weekly Trend (simulate or use backend)
  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: data.weeklyLabels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Issues Reported",
        data: data.weeklyCounts || [0, 0, 0, 0, 0, 0, 0],
        borderColor: "#4a3ce0",
        backgroundColor: "rgba(74,60,224,0.2)",
        fill: true,
        tension: 0.3
      }]
    }
  });

  // 🏢 Department Performance
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: data.departmentNames || ["Road Dept", "Lighting", "Waste Mgmt", "Water Dept"],
      datasets: [{
        label: "Avg Resolution Time (days)",
        data: data.departmentPerformance || [0, 0, 0, 0],
        backgroundColor: ["#008080", "#4a3ce0", "#28a745", "#e67e22"]
      }]
    }
  });
}

// -------------------------------
// 📆 Custom Date Range Toggle
// -------------------------------
document.getElementById("date-filter").addEventListener("change", function () {
  const customRange = document.querySelector(".custom-range");
  if (this.value === "custom") {
    customRange.style.display = "flex";
  } else {
    customRange.style.display = "none";
    loadAnalytics();
  }
});

document.getElementById("location-filter").addEventListener("change", loadAnalytics);
document.getElementById("status-filter").addEventListener("change", loadAnalytics);

// -------------------------------
// 🧩 Load Fixora Logo Dynamically
// -------------------------------
fetch("http://localhost:5001/api/files?type=logo")
  .then(res => res.json())
  .then(data => {
    if (data.length > 0) {
      const logoUrl = data[0].url;
      const img = document.createElement("img");
      img.src = logoUrl;
      img.alt = "Fixora Logo";
      img.height = 60;
      const container = document.getElementById("logo-container");
      container.innerHTML = "";
      container.appendChild(img);
    } else {
      console.log("⚠️ No logo found in DB. Please upload with type=logo.");
    }
  })
  .catch(err => console.error("Logo fetch error:", err));

// -------------------------------
// 🚀 Initial Load
// -------------------------------
loadAnalytics();
