const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");

//renderowanie strony logowania - STRONA STARTOWA
router.get("/", (req, res) => {
  res.render("login");
});

//obsługa logowania użytkownika
router.post("/login", loginController.login);

module.exports = router;
