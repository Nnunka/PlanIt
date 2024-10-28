const express = require("express");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
const authController = require("../controllers/authController");

//trasa do logowania
router.get("/", (req, res) => {
  res.render("login");
});

//obsługa formularza logowania
router.post("/login", authController.login);

// trasa do rejestracji
router.get("/register", (req, res) => {
  res.render("register");
});

//obsługa formularza rejestracji
router.post("/register", authController.register);

//trasa do wylogowania
router.get("/logout", authController.logout);

//trasa na stronę główna
router.get("/main", authenticateToken, (req, res) => {
  res.render("main", { user: req.user });
});

module.exports = router;
