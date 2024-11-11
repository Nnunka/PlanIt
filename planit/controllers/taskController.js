const db = require("../config/db");

exports.getTaskName = (req, res) => {
  const userId = req.user.user_id;

  const query =
    "SELECT task_id, task_name, task_completed FROM tasks WHERE task_user_id = ?";
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

exports.getTaskGroups = (req, res) => {
  const query =
    "SELECT DISTINCT task_group FROM tasks WHERE task_group IS NOT NULL";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Błąd pobierania grup zadań:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else {
      const groups = results.map((row) => row.task_group);
      res.json(groups);
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
  const { task_name, task_group } = req.body; // Pobieranie task_group
  const task_user_id = req.user.user_id;

  if (!task_name || !task_user_id) {
    return res
      .status(400)
      .json({ error: "Brak nazwy zadania lub ID użytkownika." });
  }

  // Jeśli task_group jest puste, przypisujemy NULL
  const query =
    "INSERT INTO tasks (task_name, task_user_id, task_group) VALUES (?, ?, ?)";
  db.query(
    query,
    [task_name, task_user_id, task_group || null],
    (err, result) => {
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
    }
  );
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

exports.updateTaskStatus = (req, res) => {
  const taskId = req.params.taskId;
  const { task_completed } = req.body;

  const query = "UPDATE tasks SET task_completed = ? WHERE task_id = ?";
  db.query(query, [task_completed, taskId], (err, result) => {
    if (err) {
      console.error("Error updating task status:", err);
      res.status(500).json({ error: "Server error" });
    } else {
      res.status(200).json({ message: "Task status updated successfully" });
    }
  });
};

exports.getTasksByGroup = (req, res) => {
  const userId = req.user.user_id;
  const group = req.params.group;

  const query =
    "SELECT task_id, task_name, task_completed FROM tasks WHERE task_user_id = ? AND task_group = ?";
  db.query(query, [userId, group], (err, results) => {
    if (err) {
      console.error("Błąd pobierania zadań po grupie:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else {
      res.json({ tasks: results });
    }
  });
};

exports.getTodayTasks = (req, res) => {
  const userId = req.user.user_id;
  const todayDate = new Date().toISOString().split("T")[0]; // Pobiera dzisiejszą datę w formacie YYYY-MM-DD

  const query = `
    SELECT task_id, task_name, task_completed, task_end_date
    FROM tasks
    WHERE task_user_id = ? AND task_end_date = ? AND task_completed = 0
  `;
  db.query(query, [userId, todayDate], (err, results) => {
    if (err) {
      console.error("Błąd pobierania zadań na dziś:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else {
      // Konwersja formatu daty na `dd.mm.yyyy`
      const formattedResults = results.map((task) => {
        if (task.task_end_date && task.task_end_date instanceof Date) {
          const dateString = task.task_end_date.toISOString().split("T")[0];
          const [year, month, day] = dateString.split("-");
          task.task_end_date = `${day}.${month}.${year}`; // Zmiana formatu daty na `dd.mm.yyyy`
        }
        return task;
      });
      res.json({ tasks: formattedResults });
    }
  });
};

exports.getUpcomingDeadlines = (req, res) => {
  const userId = req.user.user_id;
  // Pobiera zadania, które mają termin dzisiaj lub w najbliższym czasie (np. w ciągu 24 godzin)
  const query = `
    SELECT tasks.task_id, tasks.task_name, tasks.task_end_date, users.email
    FROM tasks
    JOIN users ON tasks.task_user_id = users.user_id
    WHERE tasks.task_user_id = ? AND tasks.task_completed = 0 
      AND tasks.task_end_date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Błąd pobierania zadań z nadchodzącym terminem:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else {
      res.json({ deadlines: results });
    }
  });
};
