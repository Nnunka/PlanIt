const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.redirect("/"); // Przekierowanie na stronę logowania

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Błąd weryfikacji tokenu:", err);
      return res.redirect("/"); // Przekierowanie na stronę logowania
    }

    req.user = { user_id: user.id, login: user.login };
    next();
  });
}

function generateAccessToken(user) {
  // Generowanie tokenu JWT z czasem wygaśnięcia 1 godziny
  return jwt.sign({ id: user.user_id, login: user.user_login }, JWT_SECRET, {
    expiresIn: "1h",
  });
}

module.exports = { authenticateToken, generateAccessToken };
