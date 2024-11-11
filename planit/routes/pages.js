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

//scieżka do grupy zadania
router.get("/tasks/groups", taskController.getTaskGroups);

//dodanie zadania jako zakończone
router.put(
  "/task/:taskId/status",
  authenticateToken,
  taskController.updateTaskStatus
);

//trasa do pobierania zadań na podstawie grupy
router.get(
  "/tasks/group/:group",
  authenticateToken,
  taskController.getTasksByGroup
);

//trasa do pobierania tasków 'na dziś'
router.get("/tasks/today", authenticateToken, taskController.getTodayTasks);

module.exports = router;
