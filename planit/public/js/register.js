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
        document.getElementById("success-message").innerText = data.message;
      } else {
        document.getElementById("error-message").innerText = data.error;
      }
    } catch (error) {
      console.error("Błąd:", error);
      document.getElementById("error-message").innerText = "Wystąpił błąd.";
      document.getElementById("success-message").innerText = "";
    }
  });
