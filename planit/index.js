require("dotenv").config();
require("./middleware/emailScheduler");
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();

const pages = require("./routes/pages"); //scieżka do tras

app.use("/node_modules", express.static("node_modules"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//trasy
app.use(pages);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
