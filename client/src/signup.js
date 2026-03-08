async function signup() {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://localhost:3001/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  });

  const data = await response.json();

  if (data.userId) {

    alert("Account created. Please login.");

    window.location.href = "login.html";

  } else {

    alert("Signup failed");

  }

}