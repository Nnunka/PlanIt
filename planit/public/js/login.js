// Funkcja obsługująca wysyłanie danych formularza
async function handleLogin(event) {
  event.preventDefault(); // Zatrzymanie domyślnego działania formularza

  // Zbieranie danych z formularza
  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;

  // Sprawdzenie w konsoli przeglądarki, czy dane są poprawne
  console.log("Sending Login:", login);
  console.log("Sending Password:", password);

  // Wysłanie danych do serwera za pomocą Fetch API
  const response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login, password }), // Wysyłamy dane w formacie JSON
  });

  const result = await response.json(); // Odbieramy odpowiedź z serwera

  // Wyświetlenie odpowiedniego komunikatu na stronie
  const messageElement = document.getElementById("message");
  if (result.success) {
    messageElement.innerText = result.message;
    messageElement.style.color = "green";
  } else {
    messageElement.innerText = result.message;
    messageElement.style.color = "red";
  }
}
