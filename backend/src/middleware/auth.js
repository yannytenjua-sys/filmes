const jwt = require("jsonwebtoken");
const config = require("../config");
const { User } = require("../models");

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Acesso negado. Nenhum token fornecido." });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res
        .status(401)
        .json({ error: "Token inválido ou conta desativada." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado." });
    }
    return res.status(401).json({ error: "Token inválido." });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      const token = header.split(" ")[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = await User.findByPk(decoded.id);
    }
  } catch (_) {}
  next();
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Acesso de administrador necessário." });
  }
  next();
};

module.exports = { authenticate, optionalAuth, adminOnly };