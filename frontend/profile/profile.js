// 🌐 Load Citizen Profile
async function loadCitizenProfile() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const citizenId = user?.id;

    if (!citizenId) {
      alert("Please log in again.");
      window.location.href = "login.html";
      return;
    }

    const res = await fetch(`http://localhost:5001/api/citizen-profile/byUser/${citizenId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch profile");

    console.log("✅ Profile Data:", data);

    // Header updates
    document.getElementById("citizenName").innerText = data.citizen.name;
    document.getElementById("location").innerText = data.citizen.location || "Active Citizen";
    document.getElementById("profileImage").src = data.citizen.profilePic;

    // Civic Points
    const currentPoints = data.citizen.civicPoints || 0;
    const nextLevel = Math.ceil(currentPoints / 1000) * 1000 || 1000;
    document.getElementById("civicPoints").innerText = `Civic Points: ${currentPoints}`;
    document.getElementById("nextLevel").innerText = `Next Level: ${nextLevel}`;
    document.getElementById("progressBar").style.width = `${(currentPoints / nextLevel) * 100}%`;

    // Contribution Summary
    const statCards = document.querySelectorAll(".grid.grid-cols-2.md\\:grid-cols-4 > div .text-3xl");
    statCards[0].innerText = data.summary.totalReports || 0;
    statCards[1].innerText = data.summary.resolvedCount || 0;
    statCards[2].innerText = `${data.summary.resolutionRate || 0}%`;
    statCards[3].innerText = `#${data.rank || data.citizen.rank || 0}`;

    // Rank title
    let rankTitle = "🌱 New Contributor";
    if (data.rank === 1) rankTitle = "👑 Civic Legend";
    else if (data.rank <= 10) rankTitle = "🏅 City Leader";
    else if (data.rank <= 50) rankTitle = "🚧 Active Citizen";
    document.getElementById("rankTitle").innerText = rankTitle;

    // Badges
    const badgesGrid = document.getElementById("badgesGrid");
    badgesGrid.innerHTML = "";
    data.badges.forEach(badge => {
      badgesGrid.innerHTML += `
        <div class="bg-white p-3 rounded-xl text-center shadow hover:scale-105 transition">
          <div class="text-3xl">${badge.split(" ")[0]}</div>
          <p class="text-xs font-semibold mt-2">${badge}</p>
        </div>`;
    });

    // Issues
    const issueList = document.getElementById("issues-list");
    issueList.innerHTML = "";
    data.issues.forEach(issue => {
      issueList.innerHTML += `
        <div class="bg-white p-4 rounded-xl flex items-start space-x-4 shadow">
          <img class="w-20 h-20 rounded-lg object-cover" src="${issue.imageUrls?.[0] || 'https://placehold.co/100x100'}" alt="">
          <div>
            <p class="font-bold">${issue.description}</p>
            <p class="text-sm text-gray-600">${issue.issueType}</p>
            <span class="text-xs bg-blue-500 text-white px-2 py-1 rounded">${issue.status}</span>
          </div>
        </div>`;
    });
  } catch (err) {
    console.error("❌ Failed to load profile:", err);
  }
}

// 📸 Profile Photo Upload
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("profilePicInput");
  if (!fileInput) return;

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const citizenId = user?.id;
    if (!citizenId) return alert("Please log in again.");

    const formData = new FormData();
    formData.append("profilePic", file);

    const uploadLabel = document.querySelector("label[for='profilePicInput']");
    const profileImage = document.getElementById("profileImage");

    uploadLabel.textContent = "⏳ Uploading...";
    profileImage.style.filter = "blur(2px) brightness(0.8)";

    try {
      const res = await fetch(`http://localhost:5001/api/profile/upload/${citizenId}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        profileImage.src = data.profilePic;
        alert("✅ Profile photo updated!");
      } else {
        alert("❌ Upload failed: " + data.error);
      }
    } catch (err) {
      alert("Server error while uploading.");
    } finally {
      uploadLabel.textContent = "📸 Change Photo";
      profileImage.style.filter = "none";
    }
  });
});

loadCitizenProfile();
