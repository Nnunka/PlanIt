document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/main"; //przekierowanie po udanym logowaniu
      } else {
        document.getElementById("error-message").innerText = data.error;
      }
    } catch (error) {
      console.error("Błąd:", error);
      document.getElementById("error-message").innerText = "Wystąpił błąd.";
    }
  });
