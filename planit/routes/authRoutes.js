const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/auth");

//logowanie
router.get("/", (req, res) => {
  res.render("login");
});

router.post("/login", authController.login);

//rejestracja
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", authController.register);

//strona główna
router.get("/main", authenticateToken, (req, res) => {
  res.render("main", { user: req.user });
});

//trasa do wylogowania
router.get("/logout", authController.logout);

module.exports = router;
