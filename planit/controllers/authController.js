const db = require("../config/db");
const { hashPassword, verifyPassword } = require("../middleware/hashPassword");
const { generateAccessToken } = require("../middleware/auth");

// Rejestracja użytkownika
exports.register = async (req, res) => {
  const { login, password, email, name, surname } = req.body;

  if (!login || !password || !email || !name || !surname) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane." });
  }

  try {
    // Sprawdzenie, czy login jest już zajęty
    const [loginResults] = await db
      .promise()
      .query("SELECT user_login FROM users WHERE user_login = ?", [login]);

    if (loginResults.length > 0) {
      return res.status(400).json({ error: "Ten login jest już zajęty." });
    }

    // Sprawdzenie, czy e-mail jest już zajęty
    const [emailResults] = await db
      .promise()
      .query("SELECT user_email FROM users WHERE user_email = ?", [email]);

    if (emailResults.length > 0) {
      return res
        .status(400)
        .json({ error: "Ten adres e-mail jest już zajęty." });
    }

    // Hashowanie hasła za pomocą funkcji z hashPassword.js
    const hashedPassword = await hashPassword(password);

    // Wstawienie użytkownika do bazy danych
    await db
      .promise()
      .query(
        "INSERT INTO users (user_login, user_password, user_email, user_name, user_surname) VALUES (?, ?, ?, ?, ?)",
        [login, hashedPassword, email, name, surname]
      );

    console.log("Zarejestrowano nowego użytkownika:", login);
    res.status(201).json({ success: true, message: "Rejestracja udana." });
  } catch (error) {
    console.error("Błąd podczas rejestracji użytkownika:", error);
    res.status(500).json({
      error: "Wystąpił błąd serwera podczas rejestracji użytkownika.",
    });
  }
};

// Logowanie użytkownika
exports.login = async (req, res) => {
  const { login, password } = req.body;

  try {
    // Sprawdzenie, czy użytkownik istnieje
    const [results] = await db
      .promise()
      .query("SELECT * FROM users WHERE user_login = ?", [login]);

    if (results.length === 0) {
      return res.status(400).json({ error: "Nieprawidłowy login lub hasło." });
    }

    const user = results[0];

    // Porównanie hasła użytkownika z zahashowanym hasłem w bazie danych za pomocą verifyPassword
    const isMatch = await verifyPassword(password, user.user_password);

    if (!isMatch) {
      return res.status(400).json({ error: "Nieprawidłowy login lub hasło." });
    }

    // Generowanie tokenu JWT za pomocą funkcji z authUtils.js
    const token = generateAccessToken(user);

    // Ustawienie ciasteczka z tokenem
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 godzina
    });

    console.log("Zalogowano użytkownika:", login);
    res.status(200).json({ success: true, message: "Logowanie udane." });
  } catch (error) {
    console.error("Błąd podczas logowania:", error);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
};

// Wylogowanie użytkownika
exports.logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Wylogowano pomyślnie." });
  } catch (error) {
    console.error("Błąd podczas wylogowywania:", error);
    res.status(500).json({ error: "Wystąpił błąd podczas wylogowywania." });
  }
};
