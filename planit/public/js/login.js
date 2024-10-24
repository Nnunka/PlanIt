async function handleLogin(event) {
  event.preventDefault();

  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login, password }),
  });

  const result = await response.json(); // odpowiedź z serwera

  const messageElement = document.getElementById("message");
  if (result.success) {
    messageElement.innerText = result.message;
    messageElement.style.color = "green";
  } else {
    messageElement.innerText = result.message;
    messageElement.style.color = "red";
  }
}
