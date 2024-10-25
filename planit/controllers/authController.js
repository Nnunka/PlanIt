const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = (req, res) => {
  const { login, password, email, name, surname } = req.body;

  if (!login || !password || !email || !name || !surname) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane." });
  }

  const checkUserQuery = "SELECT * FROM users WHERE user_login = ?";
  db.query(checkUserQuery, [login], (err, results) => {
    if (err) {
      console.error("Błąd podczas sprawdzania użytkownika:", err);
      return res.status(500).json({ error: "Wystąpił błąd serwera." });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Ten login jest już zajęty." });
    } else {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error("Błąd podczas hashowania hasła:", err);
          return res.status(500).json({ error: "Wystąpił błąd serwera." });
        }

        const query =
          "INSERT INTO users (user_login, user_password, user_email, user_name, user_surname) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [login, hash, email, name, surname], (err, results) => {
          if (err) {
            console.error("Błąd podczas rejestracji użytkownika:", err);
            return res.status(500).json({ error: "Wystąpił błąd serwera." });
          }
          res
            .status(200)
            .json({ success: true, message: "Rejestracja udana." });
        });
      });
    }
  });
};

exports.login = (req, res) => {
  const { login, password } = req.body;
  const query = "SELECT * FROM users WHERE user_login = ?";

  db.query(query, [login], (err, results) => {
    if (err) {
      console.error("Błąd podczas logowania:", err);
      return res.status(500).json({ error: "Wystąpił błąd serwera." });
    }

    if (results.length > 0) {
      const user = results[0];

      bcrypt.compare(password, user.user_password, (err, isMatch) => {
        if (err) {
          console.error("Błąd podczas porównywania haseł:", err);
          return res.status(500).json({ error: "Wystąpił błąd serwera." });
        }

        if (isMatch) {
          const token = jwt.sign(
            { id: user.user_id, login: user.user_login },
            JWT_SECRET,
            { expiresIn: "1h" }
          );

          res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 3600000,
          });

          res.status(200).json({ success: true, message: "Logowanie udane." });
        } else {
          res.status(400).json({ error: "Nieprawidłowy login lub hasło." });
        }
      });
    } else {
      res.status(400).json({ error: "Nieprawidłowy login lub hasło." });
    }
  });
};

exports.logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Wylogowano pomyślnie." });
  } catch (error) {
    console.error("Błąd podczas wylogowywania:", error);
    res.status(500).json({ error: "Wystąpił błąd podczas wylogowywania." });
  }
};
