const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./config/db");

const app = express();

app.use(express.json());

// Ustawienie EJS jako silnika widoków
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// Trasa głowna do logowania
app.get("/", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { login, password } = req.body; // Odbieramy 'login' zamiast 'username'

  // Logowanie danych, aby upewnić się, że są poprawnie odbierane
  console.log("Login:", login);
  console.log("Password:", password);

  if (!login || !password) {
    return res
      .status(400)
      .json({ message: "Login and password are required." });
  }

  // Zmienione zapytanie SQL zgodnie z nazwami kolumn w bazie danych
  const query =
    "SELECT * FROM users WHERE user_login = ? AND user_password = ?";
  db.execute(query, [login, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error." });
    }

    if (results.length > 0) {
      return res.json({ success: true, message: "Login successful" });
    } else {
      return res.json({ success: false, message: "Invalid login or password" });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
