const { Sequelize, DataTypes } = require('sequelize');
const mysql = require("mysql2");

// for logging
const bunyan = require('bunyan');
var logger = bunyan.createLogger({
  name: 'Spotlight Generator Application'
});

const sequelize = new Sequelize(process.env.DATABASE, 'user', process.env.PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
  logging: msg => logger.debug(msg)
});

try {
  (async () => {
    await sequelize.authenticate();
    console.log('Connection has been established!')
  })();
} catch (error) {
  console.error('Unable to connect!', error);
}

// Created User schema where oid and email will be added when the user is logged in
const User = sequelize.define('User', {
  'oid': {
    type: DataTypes.STRING
  },
  'netID': {
    type: DataTypes.STRING
  },
  'email': {
    type: DataTypes.STRING
  },
}, {
  tableName: 'Interns'
});

// testing if interns table has been created
try {
  (async () => {
    await User.sync();
    console.log('Interns table for User model has been created!')
  })();
} catch (error) {
  console.error('Unable to create table!', error);
}

module.exports = User;