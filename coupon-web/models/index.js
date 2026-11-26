const sequelize = require('../config/database');
const Coupon = require('./Coupon');
const User = require('./User');
const Payment = require('./Payment');

async function ensureUserRoleColumn() {
  const table = await sequelize.getQueryInterface().describeTable('users');
  if (table.role) {
    return;
  }

  await sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE "enum_users_role" AS ENUM ('admin', 'user');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await sequelize.query(`
    ALTER TABLE "users"
    ADD COLUMN "role" "enum_users_role" NOT NULL DEFAULT 'user'
  `);
  console.log(' Column users.role added (existing accounts set to user).');
}

async function ensureDefaultAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    console.log(' ADMIN_USERNAME / ADMIN_PASSWORD absents : aucun admin créé.');
    return;
  }

  const adminCount = await User.count({ where: { role: 'admin' } });
  if (adminCount > 0) {
    return;
  }

  const existing = await User.findOne({ where: { username } });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(` Existing account "${username}" promoted to admin.`);
    return;
  }

  await User.create({ username, password, role: 'admin' });
  console.log(` Default admin "${username}" created.`);
}

// app.js et bin/www appellent tous deux syncDatabase au démarrage : on
// partage la même exécution pour éviter deux sync concurrents (création
// des types ENUM en double, admin créé deux fois).
let syncPromise = null;

const syncDatabase = () => {
  if (!syncPromise) {
    syncPromise = runSync().catch((error) => {
      syncPromise = null;
      throw error;
    });
  }
  return syncPromise;
};

const runSync = async () => {
  try {
    await sequelize.authenticate();
    console.log(' Database connection established successfully.');

    await sequelize.sync();
    await ensureUserRoleColumn();
    await ensureDefaultAdmin();
    console.log(' Database synchronized successfully.');
  } catch (error) {
    console.error(' Unable to connect to the database or sync models:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Coupon,
  User,
  Payment,
  syncDatabase
}; 