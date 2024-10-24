const express = require("express");
const path = require("path");

const app = express();

const db = require("./config/db");

// Ustawienie EJS jako silnika widoków
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

// Trasa główna renderująca widok EJS
app.get("/", (req, res) => {
  res.render("index", { title: "Hello World!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
