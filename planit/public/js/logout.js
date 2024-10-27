document
  .getElementById("logout-button")
  .addEventListener("click", async function () {
    try {
      const response = await fetch("/logout", {
        method: "GET",
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/"; //wylogowano pomyślnie, przekieruj na stronę logowania
      } else {
        alert(data.error || "Wystąpił błąd podczas wylogowywania.");
      }
    } catch (error) {
      console.error("Błąd:", error);
      alert("Wystąpił błąd podczas wylogowywania.");
    }
  });
