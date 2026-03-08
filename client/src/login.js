async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://localhost:3001/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location.href = "index.html"; // redirect to journal page
  } else {
    alert("Login failed");
  }
}