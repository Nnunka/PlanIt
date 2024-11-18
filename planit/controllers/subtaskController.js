const db = require("../config/db");

// Pobieranie podzadań dla zadania
exports.getSubtasks = (req, res) => {
  const taskId = req.params.taskId;

  const query = "SELECT * FROM subtasks WHERE task_id = ?";
  db.query(query, [taskId], (err, results) => {
    if (err) {
      console.error("Błąd pobierania podzadań:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else {
      res.json({ subtasks: results });
    }
  });
};

// Dodawanie nowego podzadania
exports.addSubtask = (req, res) => {
  const { subtask_name } = req.body;
  const taskId = req.params.taskId;

  if (!subtask_name) {
    return res.status(400).json({ error: "Brak nazwy podzadania." });
  }

  const query =
    "INSERT INTO subtasks (task_id, subtask_name, subtask_completed) VALUES (?, ?, 0)";
  db.query(query, [taskId, subtask_name], (err, result) => {
    if (err) {
      console.error("Błąd dodawania podzadania:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else {
      res
        .status(201)
        .json({
          message: "Podzadanie dodane pomyślnie",
          subtaskId: result.insertId,
        });
    }
  });
};

// Aktualizacja statusu podzadania
exports.updateSubtaskStatus = (req, res) => {
  const subtaskId = req.params.subtaskId;
  const { subtask_completed } = req.body;

  const query =
    "UPDATE subtasks SET subtask_completed = ? WHERE subtask_id = ?";
  db.query(query, [subtask_completed, subtaskId], (err, result) => {
    if (err) {
      console.error("Błąd aktualizacji podzadania:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else {
      res.status(200).json({ message: "Status podzadania zaktualizowany" });
    }
  });
};

// Usuwanie podzadania
exports.deleteSubtask = (req, res) => {
  const subtaskId = req.params.subtaskId;

  const query = "DELETE FROM subtasks WHERE subtask_id = ?";
  db.query(query, [subtaskId], (err, result) => {
    if (err) {
      console.error("Błąd usuwania podzadania:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: "Podzadanie nie zostało znalezione" });
    } else {
      res.status(200).json({ message: "Podzadanie usunięte pomyślnie" });
    }
  });
};
