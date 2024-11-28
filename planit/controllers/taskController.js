const db = require("../config/db");

exports.getTaskName = (req, res) => {
  const userId = req.user.user_id;
  const todayDate = new Date().toISOString().split("T")[0]; // Dzisiejsza data w formacie YYYY-MM-DD

  const query = `
    SELECT 
      t.task_id, 
      t.task_name, 
      t.task_completed, 
      t.task_priority, 
      t.task_group,
      t.task_end_date IS NOT NULL AS has_date, 
      t.task_end_time IS NOT NULL AS has_time,
      (SELECT COUNT(*) FROM files f WHERE f.file_task_id = t.task_id) > 0 AS has_files
    FROM tasks t
    WHERE t.task_user_id = ?
      AND (t.task_end_date IS NULL OR t.task_end_date != ?) -- Wyklucz zadania z dzisiejszą datą
    ORDER BY 
      t.task_completed ASC, -- Niewykonane zadania (0) pojawią się przed wykonanymi (1)
      CASE t.task_priority 
        WHEN 'high' THEN 1 
        ELSE 2 
      END,
      t.task_end_date ASC, -- Zadania z wcześniejszymi datami wyżej
      t.task_name ASC -- Sortowanie alfabetyczne w przypadku braku daty i priorytetu
  `;

  db.query(query, [userId, todayDate], (err, results) => {
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
  const userId = req.user.user_id; // Pobieranie ID obecnie zalogowanego użytkownika

  const query = `
    SELECT DISTINCT task_group 
    FROM tasks 
    WHERE task_user_id = ? AND task_group IS NOT NULL
  `;

  db.query(query, [userId], (err, results) => {
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

  const query = `
    SELECT task_id, task_name, task_completed, task_priority
    FROM tasks
    WHERE task_user_id = ? AND task_group = ?
    ORDER BY 
      CASE task_priority 
        WHEN 'high' THEN 1 
        ELSE 2 
      END, 
      task_end_date ASC
  `;
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
    SELECT 
      t.task_id,
      t.task_name,
      t.task_completed,
      t.task_priority,
      t.task_group,
      t.task_end_date IS NOT NULL AS has_date,
      t.task_end_time IS NOT NULL AS has_time,
      EXISTS (SELECT 1 FROM files f WHERE f.file_task_id = t.task_id) AS has_files
    FROM tasks t
    WHERE t.task_user_id = ? 
      AND DATE(t.task_end_date) = CURDATE()
    ORDER BY 
      t.task_completed ASC, -- Niewykonane zadania wyżej
      CASE t.task_priority
        WHEN 'high' THEN 1 
        ELSE 2 
      END,
      t.task_end_date ASC, -- Zadania z wcześniejszymi datami wyżej
      t.task_name ASC -- Sortowanie alfabetyczne w przypadku braku daty i priorytetu
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

//oblicza procent ukończenia podzadań dla danego zadania.
exports.getSubtaskProgress = (req, res) => {
  const taskId = req.params.taskId;

  const query = `
      SELECT 
        (SELECT COUNT(*) FROM subtasks WHERE task_id = ?) AS total_subtasks,
        (SELECT COUNT(*) FROM subtasks WHERE task_id = ? AND subtask_completed = 1) AS completed_subtasks
    `;

  db.query(query, [taskId, taskId], (err, results) => {
    if (err) {
      console.error("Błąd obliczania postępu podzadań:", err);
      res.status(500).json({ error: "Błąd serwera" });
    } else {
      const total = results[0].total_subtasks;
      const completed = results[0].completed_subtasks;
      const progress = total > 0 ? (completed / total) * 100 : 0;
      res.json({ total, completed, progress });
    }
  });
};

exports.toggleTaskPriority = (req, res) => {
  const taskId = req.params.taskId;

  // Pobierz obecny priorytet zadania
  const querySelect = "SELECT task_priority FROM tasks WHERE task_id = ?";
  db.query(querySelect, [taskId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Błąd podczas pobierania priorytetu zadania:", err);
      return res.status(500).json({ error: "Błąd serwera" });
    }

    const currentPriority = results[0].task_priority;
    const newPriority = currentPriority === "high" ? "normal" : "high";

    // Aktualizacja priorytetu
    const queryUpdate = "UPDATE tasks SET task_priority = ? WHERE task_id = ?";
    db.query(queryUpdate, [newPriority, taskId], (updateErr) => {
      if (updateErr) {
        console.error("Błąd aktualizacji priorytetu zadania:", updateErr);
        return res.status(500).json({ error: "Błąd serwera" });
      }

      res
        .status(200)
        .json({ message: "Priorytet zaktualizowany", newPriority });
    });
  });
};
