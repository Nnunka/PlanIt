// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/auth");

// Trasa GET dla strony logowania
router.get("/", (req, res) => {
  res.render("login");
});

// Trasa GET dla strony rejestracji
router.get("/register", (req, res) => {
  res.render("register");
});

// Trasa POST do obsługi rejestracji
router.post("/register", authController.register);

// Trasa POST do obsługi logowania
router.post("/login", authController.login);

// Trasa dla strony głównej aplikacji
router.get("/main", authenticateToken, (req, res) => {
  res.render("main", { user: req.user });
});

// Trasa do wylogowania
router.get("/logout", authController.logout);

module.exports = router;
