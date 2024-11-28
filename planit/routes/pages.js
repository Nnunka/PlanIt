const express = require("express");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
const authController = require("../controllers/authController");
const taskController = require("../controllers/taskController");
const subtaskController = require("../controllers/subtaskController");
const userController = require("../controllers/userController");
const fileController = require("../controllers/fileController");
const upload = require("../middleware/multer");

// Fetch files for a task
router.get("/tasks/:taskId/files", fileController.getFilesForTask);

// Upload a file
router.post(
  "/tasks/:taskId/files",
  upload.single("file"),
  fileController.uploadFile
);

// Delete a file
router.delete("/files/:fileId", fileController.deleteFile);

router.get("/files/:fileId/download", fileController.downloadFile);

///// AUTHENTICATION ROUTES /////

// Trasa do logowania (renderowanie strony logowania)
router.get("/", (req, res) => {
  res.render("login");
});

// Obsługa formularza logowania
router.post("/login", authController.login);

// Trasa do rejestracji (renderowanie strony rejestracji)
router.get("/register", (req, res) => {
  res.render("register");
});

// Obsługa formularza rejestracji
router.post("/register", authController.register);

// Trasa do wylogowania użytkownika
router.get("/logout", authController.logout);

// Trasa na stronę główną aplikacji
router.get("/main", authenticateToken, (req, res) => {
  res.render("main", { user: req.user });
});

///// USER MANAGEMENT ROUTES /////

// Wyświetlanie panelu użytkownika
router.get("/user", authenticateToken, userController.renderUserPanel);

// Aktualizacja danych użytkownika
router.post("/user/update", authenticateToken, userController.updateUser);

// Usuwanie konta użytkownika
router.post("/user/delete", authenticateToken, userController.deleteUser);

////// TASK ROUTES /////

// Pobieranie listy wszystkich zadań użytkownika
router.get("/tasks", authenticateToken, taskController.getTaskName);

// Pobieranie szczegółów zadania (GET) oraz edycja zadania (PUT)
router.get(
  "/task/:taskId",
  taskController.getTaskDetails,
  taskController.updateTask // Pobiera szczegóły konkretnego zadania
);

// Aktualizuje zadanie
router.put("/task/:taskId", taskController.updateTask);

// Dodawanie nowego zadania
router.post("/task", authenticateToken, taskController.addTask);

// Usuwanie istniejącego zadania
router.delete("/task/:taskId", authenticateToken, taskController.deleteTask);

// Pobieranie grup zadań przypisanych do użytkownika
router.get("/tasks/groups", authenticateToken, taskController.getTaskGroups);

// Aktualizacja statusu zadania (oznaczenie jako zakończone/niezakończone)
router.put(
  "/task/:taskId/status",
  authenticateToken,
  taskController.updateTaskStatus
);

// Pobieranie zadań na podstawie grupy
router.get(
  "/tasks/group/:group",
  authenticateToken,
  taskController.getTasksByGroup
);

// Pobieranie zadań przypadających na dzisiejszy dzień
router.get("/tasks/today", authenticateToken, taskController.getTodayTasks);

router.get(
  "/tasks/upcomingDeadlines",
  authenticateToken,
  taskController.getUpcomingDeadlines
);

// SUBTASK ROUTES

// Pobieranie podzadań dla konkretnego zadania
router.get(
  "/tasks/:taskId/subtasks",
  authenticateToken,
  subtaskController.getSubtasks
);

// Dodawanie nowego podzadania do zadania
router.post(
  "/tasks/:taskId/subtasks",
  authenticateToken,
  subtaskController.addSubtask
);

// Aktualizacja statusu podzadania (oznaczenie jako ukończone)
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

// Pobieranie procentowego postępu realizacji podzadań dla zadania
router.get(
  "/tasks/:taskId/progress",
  authenticateToken,
  taskController.getSubtaskProgress
);

// Zmiana priorytetu zadania (wysoki/normalny)
router.put(
  "/tasks/:taskId/priority",
  authenticateToken,
  taskController.toggleTaskPriority
);

module.exports = router;
