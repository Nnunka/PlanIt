// Obsługa formularza aktualizacji danych użytkownika
const userInfoForm = document.getElementById("user-info-form");
userInfoForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(userInfoForm);

  try {
    const response = await fetch("/user/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: formData.get("user_name"),
        user_surname: formData.get("user_surname"),
        user_login: formData.get("user_login"),
        user_email: formData.get("user_email"),
      }),
    });

    const data = await response.json();

    if (data.success) {
      showNotification("success", data.message);
    } else {
      showNotification("error", data.message);
    }
  } catch (error) {
    console.error("Błąd aktualizacji danych użytkownika:", error);
    showNotification("error", "Wystąpił błąd. Spróbuj ponownie.");
  }
});

// Usunięcie konta użytkownika po potwierdzeniu (modal)
function deleteUser() {
  const deleteUserConfirmationModal = new bootstrap.Modal(
    document.getElementById("deleteUserConfirmationModal")
  );
  deleteUserConfirmationModal.show();

  document.getElementById("confirmDeleteUser").onclick = async function () {
    try {
      const response = await fetch("/user/delete", {
        method: "POST",
      });

      if (response.ok) {
        console.log("Konto użytkownika zostało usunięte.");
        deleteUserConfirmationModal.hide();
        window.location.href = "/"; // Przekierowanie na stronę logowania
      } else {
        console.error("Błąd usuwania konta użytkownika.");
        alert("Nie udało się usunąć konta. Spróbuj ponownie.");
      }
    } catch (error) {
      console.error("Błąd podczas usuwania konta:", error);
      alert("Wystąpił błąd. Spróbuj ponownie.");
    }
  };
}

// Funkcja do wyświetlania powiadomień
function showNotification(type, message) {
  const notification = document.createElement("div");
  notification.className = `alert alert-${
    type === "success" ? "success" : "danger"
  }`;
  notification.textContent = message;

  const container = document.getElementById("notification-container");
  container.innerHTML = ""; // Wyczyszczenie poprzednich powiadomień
  container.appendChild(notification);

  // Usunięcie powiadomienia po 3 sekundach
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
