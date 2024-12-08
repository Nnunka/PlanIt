const db = require("../config/db");

exports.getCalendarEvents = (req, res) => {
  const userId = req.user.user_id;

  const query = `
    SELECT 
      task_id AS id, 
      task_name AS title, 
      CONCAT(DATE(task_end_date), 'T', task_end_time) AS start,
      task_priority AS priority,
      task_end_time AS time
    FROM tasks
    WHERE task_user_id = ? AND task_end_date IS NOT NULL;
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching calendar events:", err);
      return res.status(500).json({ error: "Server error" });
    }
    res.status(200).json(results);
  });
};
