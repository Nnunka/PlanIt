const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST, //localhost
  user: process.env.DB_USER, //root
  password: process.env.DB_PASSWORD, //4925
  database: process.env.DB_NAME, //planit
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  } else {
    console.log("Connected to the MySQL database");
  }
});

module.exports = connection;
