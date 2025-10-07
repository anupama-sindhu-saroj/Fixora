// -------------------------------------
// 🌐 Load Citizen Profile (Dynamic Data)
// -------------------------------------
async function loadCitizenProfile() {
  try {
    // ⚠️ Replace this with logged-in citizen ID
    const user = JSON.parse(localStorage.getItem("user"));
    const citizenId = user?.id;

    if (!citizenId) {
    console.error("⚠️ No user ID found in localStorage.");
    alert("Please log in again.");
    window.location.href = "login.html";
    return;
    }


    const res = await fetch(`http://localhost:5001/api/citizen-profile/byUser/${citizenId}`);
    const data = await res.json();

    if (!res.ok || !data.citizen) {
      console.error("❌ Invalid response:", data);
      alert("Failed to load profile. Please try again.");
      return;
    }

    // 💁 Update Profile Header
    document.querySelector("h2.text-xl").innerText = `Good Evening, ${data.citizen.name}`;
    document.querySelector("h1.text-3xl").innerText = data.citizen.name;
    document.querySelector(".text-blue-600").innerText = data.citizen.location || "Active Citizen";
    document.querySelector("img[alt^='Profile picture']").src = data.citizen.profilePic;

    // 🧮 Update Stats
    const cards = document.querySelectorAll(".grid.grid-cols-2.md\\:grid-cols-4 .text-3xl");
    cards[0].innerText = data.summary.totalReports;
    cards[1].innerText = data.summary.resolvedCount;
    cards[2].innerText = `${data.summary.resolutionRate}%`;
    cards[3].innerText = `#${data.citizen.rank || 12}`;

    // 🏅 Render Badges
    const badgesGrid = document.querySelector(".grid.grid-cols-3.sm\\:grid-cols-4.md\\:grid-cols-6");
    badgesGrid.innerHTML = "";
    data.badges.forEach(badge => {
      badgesGrid.innerHTML += `
        <div class="bg-white border p-3 rounded-xl flex flex-col items-center text-center hover:scale-110 hover:shadow-lg transition-all duration-200">
          <div class="text-4xl">${badge.split(" ")[0]}</div>
          <p class="text-xs font-semibold mt-2 text-gray-800">${badge}</p>
        </div>`;
    });

    // 🧾 Render Reported Issues
    const issueList = document.getElementById("issues-list");
    issueList.innerHTML = "";
    data.issues.forEach(issue => {
      issueList.innerHTML += `
        <div class="issue-card bg-white border p-4 rounded-xl flex items-start space-x-4 transition-all duration-300 card-lift" data-status="${issue.status.toLowerCase()}">
          <img class="w-20 h-20 rounded-lg object-cover" src="${issue.imageUrls?.[0] || 'https://placehold.co/100x100'}" alt="${issue.issueType}">
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-bold text-gray-900">${issue.description}</p>
                <p class="text-sm text-gray-600">${issue.issueType}</p>
              </div>
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${
                issue.status === "Resolved"
                  ? "bg-green-500 text-white"
                  : issue.status === "Under Review" || issue.status === "In Progress"
                  ? "bg-yellow-500 text-white"
                  : "bg-blue-500 text-white"
              }">${issue.status.toUpperCase()}</span>
            </div>
            <p class="text-sm text-gray-500 mt-2">Reported on: ${new Date(issue.createdAt).toLocaleDateString()}</p>
          </div>
        </div>`;
    });
  } catch (err) {
    console.error("❌ Failed to load citizen profile:", err);
  }
}

loadCitizenProfile();
