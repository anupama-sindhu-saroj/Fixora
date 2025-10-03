// Initialize Lucide icons
lucide.createIcons();

// Form submission
document.getElementById("reportForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const issueType = document.getElementById("issueType").value;
  const description = document.getElementById("description").value;
  const location = document.getElementById("location").value;

  console.log("--- Report Submission Data ---");
  console.log("Issue Type:", issueType);
  console.log("Description:", description);
  console.log("Location:", location);
  console.log("Status: Simulated submission success.");

  alert("Report submitted successfully!");
  this.reset();
});
