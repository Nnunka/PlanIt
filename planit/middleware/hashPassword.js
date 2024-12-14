const bcrypt = require("bcryptjs");

// Funkcja do hashowania hasła
async function hashPassword(password) {
  const saltRounds = 10; // Liczba rund soli (im wyższa, tym większe bezpieczeństwo, ale wolniejsze hashowanie)
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
}

// Funkcja do porównywania hasła użytkownika z zahashowanym hasłem w bazie danych
async function verifyPassword(inputPassword, hashedPassword) {
  return await bcrypt.compare(inputPassword, hashedPassword);
}

module.exports = { hashPassword, verifyPassword };
