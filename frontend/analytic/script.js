// Custom Date Range Toggle
document.getElementById("date-filter").addEventListener("change", function () {
  const customRange = document.querySelector(".custom-range");
  if (this.value === "custom") {
    customRange.style.display = "flex";
  } else {
    customRange.style.display = "none";
  }
});

// Charts
const pieChart = new Chart(document.getElementById("pieChart"), {
  type: "pie",
  data: {
    labels: ["Roads", "Lighting", "Waste", "Water", "Other"],
    datasets: [{
      data: [45, 25, 15, 10, 5],
      backgroundColor: ["#4a3ce0", "#008080", "#28a745", "#e67e22", "#999"]
    }]
  }
});

const lineChart = new Chart(document.getElementById("lineChart"), {
  type: "line",
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: "Issues",
      data: [12, 19, 7, 15, 22, 30, 18],
      borderColor: "#4a3ce0",
      backgroundColor: "rgba(74,60,224,0.2)",
      fill: true,
      tension: 0.3
    }]
  }
});

const barChart = new Chart(document.getElementById("barChart"), {
  type: "bar",
  data: {
    labels: ["Road Dept", "Lighting", "Waste Mgmt", "Water Dept"],
    datasets: [{
      label: "Avg Resolution Time (days)",
      data: [3, 5, 2, 7],
      backgroundColor: ["#008080", "#4a3ce0", "#28a745", "#e67e22"]
    }]
  }
});
// Load Fixora logo dynamically
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
