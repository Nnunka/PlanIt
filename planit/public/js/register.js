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

      const successMessage = document.getElementById("success-message");
      const errorMessage = document.getElementById("error-message");

      if (response.ok) {
        successMessage.innerText = data.message;
        successMessage.style.display = "block";
        errorMessage.style.display = "none";
      } else {
        errorMessage.innerText = data.error;
        errorMessage.style.display = "block";
        successMessage.style.display = "none";
      }
    } catch (error) {
      console.error("Błąd:", error);
      errorMessage.innerText = "Wystąpił błąd serwera.";
      successMessage.style.display = "none";
    }
  });
