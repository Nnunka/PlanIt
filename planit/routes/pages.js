const express = require("express");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
const authController = require("../controllers/authController");
const taskController = require("../controllers/taskController");
const subtaskController = require("../controllers/subtaskController");

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

router.get(
  "/tasks/upcomingDeadlines",
  authenticateToken,
  taskController.getUpcomingDeadlines
);

///subtaski
// Pobieranie podzadań dla konkretnego zadania
router.get(
  "/tasks/:taskId/subtasks",
  authenticateToken,
  subtaskController.getSubtasks
);

// Dodawanie nowego podzadania
router.post(
  "/tasks/:taskId/subtasks",
  authenticateToken,
  subtaskController.addSubtask
);

// Aktualizacja podzadania (np. oznaczanie jako ukończone)
router.put(
  "/subtasks/:subtaskId",
  authenticateToken,
  subtaskController.updateSubtaskStatus
);

// Usuwanie podzadania
router.delete(
  "/subtasks/:subtaskId",
  authenticateToken,
  subtaskController.deleteSubtask
);

//która oblicza procent ukończenia podzadań dla danego zadania. taskController
router.get(
  "/tasks/:taskId/progress",
  authenticateToken,
  taskController.getSubtaskProgress
);

router.put(
  "/tasks/:taskId/priority",
  authenticateToken,
  taskController.toggleTaskPriority
);

module.exports = router;
