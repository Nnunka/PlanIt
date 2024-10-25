require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const db = require("./config/db");

const app = express();

// Konfiguracja JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware do weryfikacji tokenu JWT
function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/"); //przekierownie na stronę logowania
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Błąd weryfikacji tokenu:", err);
      return res.redirect("/"); //przekierownie na stronę logowania
    }

    req.user = user;
    next();
  });
}

// Trasa GET dla strony rejestracji
app.get("/register", (req, res) => {
  res.render("register");
});

// Trasa POST do obsługi rejestracji
// Trasa POST do obsługi rejestracji
app.post("/register", (req, res) => {
  const { login, password, email, name, surname } = req.body;

  // Sprawdź, czy wszystkie pola są wypełnione
  if (!login || !password || !email || !name || !surname) {
    return res.send("Wszystkie pola są wymagane.");
  }

  // Sprawdź, czy login już istnieje
  const checkUserQuery = "SELECT * FROM users WHERE user_login = ?";
  db.query(checkUserQuery, [login], (err, results) => {
    if (err) {
      console.error("Błąd podczas sprawdzania użytkownika:", err);
      return res.send("Wystąpił błąd serwera.");
    }

    if (results.length > 0) {
      return res.send("Ten login jest już zajęty.");
    } else {
      // Hashuj hasło
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error("Błąd podczas hashowania hasła:", err);
          return res.send("Wystąpił błąd serwera.");
        }

        const query =
          "INSERT INTO users (user_login, user_password, user_email, user_name, user_surname) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [login, hash, email, name, surname], (err, results) => {
          if (err) {
            console.error("Błąd podczas rejestracji użytkownika:", err);
            return res.send("Wystąpił błąd serwera.");
          }
          res.redirect("/"); //przekierownie na stronę logowania
        });
      });
    }
  });
});

// Trasa GET dla strony logowania
app.get("/", (req, res) => {
  res.render("login");
});

// Trasa POST do obsługi logowania
app.post("/login", (req, res) => {
  const { login, password } = req.body;
  const query = "SELECT * FROM users WHERE user_login = ?";

  db.query(query, [login], (err, results) => {
    if (err) {
      console.error("Błąd podczas logowania:", err);
      return res.send("Wystąpił błąd serwera.");
    }

    if (results.length > 0) {
      const user = results[0];

      console.log("Wprowadzone hasło:", password);
      console.log("Hasło z bazy danych (hash):", user.user_password);

      // Porównaj hasło
      bcrypt.compare(password, user.user_password, (err, isMatch) => {
        if (err) {
          console.error("Błąd podczas porównywania haseł:", err);
          return res.send("Wystąpił błąd serwera.");
        }

        if (isMatch) {
          // Generuj token JWT i zaloguj użytkownika
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

          res.redirect("/main");
        } else {
          res.send("Nieprawidłowy login lub hasło.");
        }
      });
    } else {
      res.send("Nieprawidłowy login lub hasło.");
    }
  });
});

// Trasa dla strony głównej aplikacji
app.get("/main", authenticateToken, (req, res) => {
  res.render("main", { user: req.user });
});

// Trasa do wylogowania
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// Uruchomienie serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
