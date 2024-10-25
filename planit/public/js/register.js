document
  .getElementById("register-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password, email, name, surname }),
      });

      const data = await response.json();

      if (response.ok) {
        // Rejestracja udana, wyświetl komunikat sukcesu
        document.getElementById("success-message").innerText = data.message;
        document.getElementById("error-message").innerText = "";
        // Możesz również przekierować użytkownika na stronę logowania po kilku sekundach
      } else {
        // Wyświetl komunikat o błędzie
        document.getElementById("error-message").innerText = data.error;
        document.getElementById("success-message").innerText = "";
      }
    } catch (error) {
      console.error("Błąd:", error);
      document.getElementById("error-message").innerText = "Wystąpił błąd.";
      document.getElementById("success-message").innerText = "";
    }
  });
