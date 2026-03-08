console.log("script loaded");
let currentDate = new Date();

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

function logout() {

  localStorage.removeItem("token");

  window.location.href = "login.html";

}

async function saveEntry() {

  const entryText = document.getElementById("entry").value;

  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:3001/entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      date: getDateString(),
      content: entryText
    })
  });

  const data = await response.json();

  console.log("Saved:", data);

}


function displayDate() {

  const formatted = currentDate.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  document.getElementById("date").textContent = formatted;

}

function previousDay() {

  currentDate.setDate(currentDate.getDate() - 1);

  displayDate();
  loadEntry();

}

function nextDay() {

  currentDate.setDate(currentDate.getDate() + 1);

  displayDate();
  loadEntry();

}

function getDateString() {
  return currentDate.toISOString().split("T")[0];
}

async function loadEntry() {

  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:3001/entries?date=${getDateString()}`,
    {
      headers: {
        "Authorization": "Bearer " + token
      }
    }
  );

  const data = await response.json();

  document.getElementById("entry").value = data?.content || "";

}

displayDate();
loadEntry();