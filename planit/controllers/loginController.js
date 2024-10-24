const db = require("../config/db");

exports.login = (req, res) => {
  const { login, password } = req.body;

  console.log("Odebrane dane:", req.body);

  if (!login || !password) {
    return res.json({ message: "Login and password are required." });
  }

  const query = `SELECT * FROM users WHERE user_login = ? AND user_password = ?`;
  db.execute(query, [login, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error." });
    }

    if (results.length > 0) {
      const user = results[0];
      console.log("Zalogowany użytkownik:", user);

      return res.json({ success: true, message: "Login successful" });
    } else {
      return res.json({ success: false, message: "Invalid login or password" });
    }
  });
};
