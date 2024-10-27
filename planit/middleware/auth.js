const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/"); //przekierowanie na stronę logowania
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Błąd weryfikacji tokenu:", err);
      return res.redirect("/"); //przekierowanie na stronę logowania
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
