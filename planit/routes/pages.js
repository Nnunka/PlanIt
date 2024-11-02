const express = require("express");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
const authController = require("../controllers/authController");
const taskController = require("../controllers/taskController");

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

/////

//trasa do pobierania listy zadań z bazy
router.get("/tasks", authenticateToken, taskController.getTaskName);

router.get(
  "/task/:taskId",
  taskController.getTaskDetails, //trasa do pobierania szczegółów zadań
  taskController.updateTask //trasa do edycji zadań
);

//edycja zadań
router.put("/task/:taskId", taskController.updateTask);

//dodawanie zadań
router.post("/task", authenticateToken, taskController.addTask);

//usuwanie zadań
router.delete("/task/:taskId", authenticateToken, taskController.deleteTask);

module.exports = router;
