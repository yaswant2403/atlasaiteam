var DataTypes = require("sequelize").DataTypes;
var _User = require("./User");
var _Paragraph = require("./Paragraph");
var _Action = require("./Action");
var _UserRole = require("./UserRole");
var _Role = require("./Role");

function initModels(sequelize) {
  var User = _User(sequelize, DataTypes);
  var Paragraph = _Paragraph(sequelize, DataTypes);
  var Action = _Action(sequelize, DataTypes);
  var UserRole = _UserRole(sequelize, DataTypes);
  var Role = _Role(sequelize, DataTypes);

  User.hasMany(Action, { as: "attempts", foreignKey: "user_id"});
  Action.belongsTo(User, { as: "user", foreignKey: "user_id"});

  User.hasMany(Paragraph, { as: "paragraphs", foreignKey: "user_id"});
  Paragraph.belongsTo(User, { as: "user", foreignKey: "user_id"});

  User.belongsToMany(Role, {unique: false, through: UserRole, foreignKey: 'user_id'});
  Role.belongsToMany(User, {unique: false, through: UserRole, foreignKey: 'role'});
  User.hasMany(UserRole, { as: "user_roles", foreignKey: "user_id"});
  UserRole.belongsTo(User, { as: "user", foreignKey: "user_id"});
  Role.hasMany(UserRole, { as: "roles", foreignKey: "role"});
  UserRole.belongsTo(Role, { as: "role_description", foreignKey: "role"});

  return {
    User,
    Paragraph,
    Action,
    UserRole,
    Role,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
