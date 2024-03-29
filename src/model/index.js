const dbConfig = require("../db_details/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user_model.js")(sequelize, Sequelize);
db.books = require("./books_model.js")(sequelize, Sequelize);
db.images = require("./image_model.js")(sequelize, Sequelize);

db.users.associate(db.books);
db.books.associate(db.images);

module.exports = db;