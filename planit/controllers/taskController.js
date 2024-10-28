const db = require("../config/db");

exports.getTasks = (req, res) => {
  const userId = req.user.user_id;

  const query = "SELECT * FROM tasks WHERE task_user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Błąd pobierania zadań:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else {
      res.json({ tasks: results, user: req.user });
    }
  });
};
