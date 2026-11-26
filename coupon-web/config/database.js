const net = require("net");
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Node ≥ 20 essaie IPv6 et IPv4 en parallèle et n'accorde par défaut que
// 250 ms à chaque adresse. Avec ~300 ms de latence vers Neon, environ 1
// connexion sur 3 échouait en ETIMEDOUT. On laisse 2 s par tentative.
if (typeof net.setDefaultAutoSelectFamilyAttemptTimeout === "function") {
  net.setDefaultAutoSelectFamilyAttemptTimeout(2000);
}

if (!process.env.DATABASE_URL) {
  throw new Error(" DATABASE_URL is not defined");
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false
});

module.exports = sequelize;
