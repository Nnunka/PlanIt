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
  console.log("Received Task ID:", taskId);

  const query = "SELECT * FROM tasks WHERE task_id = ?";

  db.query(query, [taskId], (err, results) => {
    if (err) {
      console.error("Error fetching task details:", err);
      res.status(500).json({ error: "Server error" });
    } else if (results.length === 0) {
      res.status(404).json({ error: "Task not found" });
    } else {
      res.json(results[0]); // Return the first result as the task details
    }
  });
};
