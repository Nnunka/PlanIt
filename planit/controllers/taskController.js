const db = require("../config/db");

exports.getTaskName = (req, res) => {
  const userId = req.user.user_id;

  const query = "SELECT task_id, task_name FROM tasks WHERE task_user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Błąd pobierania zadań:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else {
      res.json({ tasks: results, user: req.user });
    }
  });
};

exports.getTaskDetails = (req, res) => {
  const taskId = req.params.taskId;

  const query = "SELECT * FROM tasks WHERE task_id = ?";
  db.query(query, [taskId], (err, results) => {
    if (err) {
      console.error("Error fetching task details:", err);
      res.status(500).json({ error: "Server error" });
    } else if (results.length === 0) {
      res.status(404).json({ error: "Task not found" });
    } else {
      console.log("Task ID:", req.params.taskId);
      res.json(results[0]);
    }
  });
};

exports.updateTask = (req, res) => {
  const taskId = req.params.taskId;
  const { task_name, task_more, task_group, task_end_time, task_end_date } =
    req.body;

  const query =
    "UPDATE tasks SET task_name = ?, task_more = ?, task_group = ?, task_end_time = ?, task_end_date = ? WHERE task_id = ?";
  db.query(
    query,
    [task_name, task_more, task_group, task_end_time, task_end_date, taskId],
    (err, result) => {
      if (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ error: "Server error" });
      } else {
        res.status(200).json({ message: "Task updated successfully" });
        console.log(
          "Zadanie zaktualizowano:",
          req.body,
          "Task ID:",
          req.params.taskId
        );
      }
    }
  );
};

exports.addTask = (req, res) => {
  const { task_name } = req.body;
  const task_user_id = req.user.user_id; // Pobiera ID zalogowanego użytkownika

  if (!task_name || !task_user_id) {
    return res
      .status(400)
      .json({ error: "Brak nazwy zadania lub ID użytkownika." });
  }

  const query = "INSERT INTO tasks (task_name, task_user_id) VALUES (?, ?)";
  db.query(query, [task_name, task_user_id], (err, result) => {
    if (err) {
      console.error("Błąd dodawania zadania:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else {
      res.status(201).json({ message: "Zadanie dodane pomyślnie" });
      console.log(
        "Dodano nowe zadanie:",
        req.body,
        "User ID:",
        req.user.user_id
      );
    }
  });
};

exports.deleteTask = (req, res) => {
  const taskId = req.params.taskId;

  const query = "DELETE FROM tasks WHERE task_id = ?";
  db.query(query, [taskId], (err, result) => {
    if (err) {
      console.error("Błąd usuwania zadania:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: "Zadanie nie zostało znalezione" });
    } else {
      console.log("Zadanie usunięte:", taskId);
      res.status(200).json({ message: "Zadanie usunięte pomyślnie" });
    }
  });
};
