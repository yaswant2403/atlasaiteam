/******************************************************************************
 * Module dependencies for our database.
 *****************************************************************************/
const { Sequelize } = require('sequelize');
const mysql = require("mysql2");

// for logging
const bunyan = require('bunyan');
var logger = bunyan.createLogger({
  name: 'Spotlight Generator Application'
});

// Set up mySQL Database with our DB Config Details
const sequelize = new Sequelize(process.env.DATABASE, 'user', process.env.PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
  /**
   * FOR PRODUCTION
   * pool: {
   *   max: 5,
   *   min: 1,
   *   idle: 20000
   * }
   */
  logging: msg => logger.debug(msg)
});
// Checking if sequelize is able to connect to our DB
try {
  (async () => {
    await sequelize.authenticate();
    console.log('Connection has been established!')
  })();
} catch (error) {
  console.error('Unable to connect!', error);
}

module.exports = sequelize;
