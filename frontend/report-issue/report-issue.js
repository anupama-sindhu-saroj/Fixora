// Initialize Lucide icons
lucide.createIcons();

<<<<<<< HEAD
// ===== FILE PREVIEW =====
const fileInput = document.getElementById("fileInput");
const previewContainer = document.querySelector(".upload-section .flex.space-x-3");

fileInput.addEventListener("change", () => {
  previewContainer.innerHTML = ""; // Clear old previews

  Array.from(fileInput.files).forEach(file => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = file.name;
      img.classList.add(
        "w-32",
        "h-32",
        "rounded-lg",
        "object-cover",
        "border",
        "border-gray-200",
        "shadow-md"
      );
      previewContainer.appendChild(img);
    };

    reader.readAsDataURL(file);
  });
});

// ===== FORM SUBMISSION =====
document.getElementById("reportForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const issueType = document.getElementById("issueType").value.trim();
  const description = document.getElementById("description").value.trim();
  const location = document.getElementById("location").value.trim();
=======
// Form submission
document.getElementById("reportForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const issueType = document.getElementById("issueType").value;
  const description = document.getElementById("description").value;
  const location = document.getElementById("location").value;
>>>>>>> 5458181e8fcf8a0eb83dc9c40187d6181a2daf10

  console.log("--- Report Submission Data ---");
  console.log("Issue Type:", issueType);
  console.log("Description:", description);
  console.log("Location:", location);
<<<<<<< HEAD

  const token = localStorage.getItem("token");

  if (!token) {
    alert("⚠ You must be logged in to report an issue.");
    window.location.href = "login.html";
    return;
  }

  if (!issueType || !description || !location) {
    alert("⚠ Please fill in all required fields.");
    return;
  }

  let imageUrls = [];
  if (fileInput.files.length > 0) {
    const formData = new FormData();
    Array.from(fileInput.files).forEach(file => formData.append("files", file));

    try {
      const uploadResponse = await fetch("http://localhost:5001/api/uploadMultiple", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (uploadResponse.ok) {
        imageUrls = uploadData.urls || [];
        console.log("✅ Uploaded file URLs:", imageUrls);
      } else {
        console.error("Error uploading files:", uploadData.error);
        alert("⚠ File upload failed.");
        return;
      }
    } catch (err) {
      console.error("Network error uploading files:", err);
      alert("⚠ Network error during file upload.");
      return;
    }
  }

  // Submit the issue
  try {
    const response = await fetch("http://localhost:5001/api/issues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ issueType, description, location, imageUrls })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Full response from server:", data);

      // 🎉 SHOW CONFIRMATION
      const confirmationHTML = `
        <div style="padding:20px; border:2px solid #008080; border-radius:10px; background:#f0fdf4;">
          <h2 style="color:#008080;">✅ Report Submitted Successfully!</h2>
          <p><strong>Issue Type:</strong> ${data.issue.issueType}</p>
          <p><strong>Description:</strong> ${data.issue.description}</p>
          <p><strong>Location:</strong> ${data.issue.location}</p>
          ${imageUrls.length > 0 ? `<p><strong>Uploaded Images:</strong></p>` : ""}
          <div style="display:flex; gap:10px;">
            ${imageUrls.map(url => `<img src="${url}" style="width:100px; height:100px; object-fit:cover; border-radius:5px;" />`).join("")}
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", confirmationHTML);

      this.reset();
      previewContainer.innerHTML = "";

    } else {
      console.error("Error submitting report:", data.error);
      alert("❌ Error: " + data.error);
    }
  } catch (err) {
    console.error("Network error:", err);
    alert("⚠ Network error. Please try again later.");
  }
=======
  console.log("Status: Simulated submission success.");

  alert("Report submitted successfully!");
  this.reset();
>>>>>>> 5458181e8fcf8a0eb83dc9c40187d6181a2daf10
});
