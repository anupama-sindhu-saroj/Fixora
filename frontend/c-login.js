document.getElementById("loginForm").addEventListener("submit",async function(e){
    e.preventDefault();
    const emailOrUsername = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!emailOrUsername || !password) {
    return alert("Please enter both email/username and password.");
  }
 
  try {
    const response = await fetch("http://127.0.0.1:5001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ emailOrUsername, password })
    });

    const data = await response.json();

    if (response.ok) {
        
        localStorage.setItem("username", data.username);  
        localStorage.setItem("name", data.name);  
        window.location.href = "home.html";
      } else {
 
        alert("Login failed: " + (data.message || "INVALID CREDENTIALS"));
        console.error("Server response:", data);
      }

  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong while logging in.");
  }
}) 