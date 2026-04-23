const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "familia_segura_secret";

// Middleware que verifica se o token JWT é válido
// Roda antes de qualquer rota protegida
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  // Verifica se o header Authorization existe e começa com "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não informado" });
  }

  // Extrai o token do header (remove o "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // Verifica se o token é válido e não expirou
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload; // salva os dados do usuário na requisição
    next(); // passa para o próximo middleware ou controller
  } catch (erro) {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}

module.exports = autenticar;