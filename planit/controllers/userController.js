const db = require("../config/db");
const bcrypt = require("bcryptjs");

// Wyświetlanie panelu użytkownika
exports.renderUserPanel = (req, res) => {
  const userId = req.user.user_id;

  const query = "SELECT * FROM users WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Błąd pobierania danych użytkownika:", err);
      return res.status(500).send("Błąd serwera");
    }
    if (results.length === 0) {
      return res.status(404).send("Użytkownik nie znaleziony.");
    }
    res.render("user", { user: results[0] });
  });
};

// Aktualizacja danych użytkownika
exports.updateUser = (req, res) => {
  const userId = req.user.user_id; // Pobranie ID użytkownika z tokena
  const { user_name, user_surname, user_login, user_email } = req.body;

  if (!user_name || !user_surname || !user_login || !user_email) {
    return res
      .status(400)
      .json({ success: false, message: "Wszystkie pola są wymagane." });
  }

  const query = `
        UPDATE users 
        SET user_name = ?, user_surname = ?, user_login = ?, user_email = ? 
        WHERE user_id = ?
      `;

  db.query(
    query,
    [user_name, user_surname, user_login, user_email, userId],
    (err, result) => {
      if (err) {
        console.error("Błąd aktualizacji danych użytkownika:", err);
        return res
          .status(500)
          .json({ success: false, message: "Błąd serwera. Spróbuj ponownie." });
      }

      res.status(200).json({
        success: true,
        message: "Dane zostały zaktualizowane pomyślnie.",
      });
    }
  );
};

// Usuwanie konta użytkownika
exports.deleteUser = (req, res) => {
  const userId = req.user.user_id;

  const query = "DELETE FROM users WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Błąd usuwania konta użytkownika:", err);
      return res.status(500).send("Błąd serwera");
    }
    res.redirect("/"); // Po usunięciu konta wyloguj użytkownika
  });
};
