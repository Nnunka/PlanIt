const db = require("../config/db");
const cron = require("node-cron");
const nodemailer = require("nodemailer");

// Konfiguracja Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Funkcja do wysyłania e-maila
const sendDeadlineReminder = (recipientEmail, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(`Błąd przy wysyłaniu e-maila: ${error}`);
    } else {
      console.log(`E-mail wysłany: ${info.response}`);
    }
  });
};

// Funkcja do sprawdzania zbliżających się terminów i wysyłania przypomnień
const checkAndSendReminders = () => {
  const query = `
    SELECT tasks.task_id, tasks.task_name, tasks.task_end_date, tasks.task_end_time, users.user_email
    FROM tasks
    JOIN users ON tasks.task_user_id = users.user_id
    WHERE tasks.task_completed = 0 
      AND tasks.task_end_date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Błąd pobierania zadań z nadchodzącym terminem:", err);
      return;
    }

    results.forEach((task) => {
      const formattedDate = new Date(task.task_end_date).toLocaleDateString(
        "pl-PL"
      );
      let formattedTime = "";

      // Sprawdza, czy `task_end_time` jest ustawione i formatuje je
      if (task.task_end_time) {
        const [hours, minutes] = task.task_end_time.split(":");
        formattedTime = ` o godzinie ${hours}:${minutes}`;
      }

      const subject = `Przypomnienie: termin zadania "${task.task_name}" zbliża się`;
      const message = `Zadanie "${task.task_name}" ma termin: ${formattedDate}${formattedTime}. Upewnij się, że zostanie wykonane na czas!`;

      sendDeadlineReminder(task.user_email, subject, message);
    });
  });
};

// Ustawienie cron na 6:00 rano każdego dnia
cron.schedule("0 6 * * *", () => {
  console.log("Uruchamiam przypomnienia o 6:00 rano");
  checkAndSendReminders();
});
