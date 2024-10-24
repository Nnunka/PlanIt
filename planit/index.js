const express = require("express");
const app = express();
const path = require("path");
const db = require("./config/db");

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
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
      return res.json({ success: true, message: "Login successful" });
    } else {
      return res.json({ success: false, message: "Invalid login or password" });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
