var DataTypes = require("sequelize").DataTypes;
var _User = require("./User");
var _Paragraphs = require("./Paragraphs");
var _NumTries = require("./NumTries");
var _UserRole = require("./UserRole");
var _Roles = require("./Roles");

function initModels(sequelize) {
  var User = _User(sequelize, DataTypes);
  var Paragraphs = _Paragraphs(sequelize, DataTypes);
  var NumTries = _NumTries(sequelize, DataTypes);
  var UserRole = _UserRole(sequelize, DataTypes);
  var Roles = _Roles(sequelize, DataTypes);

  User.hasMany(NumTries, { as: "attempts", foreignKey: "user_id"});
  NumTries.belongsTo(User, { as: "user", foreignKey: "user_id"});

  User.hasMany(Paragraphs, { as: "paragraphs", foreignKey: "user_id"});
  Paragraphs.belongsTo(User, { as: "user", foreignKey: "user_id"});

  User.hasMany(UserRole, { as: "roles", foreignKey: "user_id"});
  UserRole.belongsTo(User, { as: "user", foreignKey: "user_id"});
  Roles.hasMany(UserRole, { as: "roles", foreignKey: "role"});
  UserRole.belongsTo(Roles, { as: "role_description", foreignKey: "role"});

  return {
    User,
    Paragraphs,
    NumTries,
    UserRole,
    Roles,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
