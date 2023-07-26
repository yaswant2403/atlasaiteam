/**
 * This file contains all the POST routes that are called by the account subpages (Interns, Staff, Admin)
 * */ 
const express = require('express');
const { Op, Sequelize } = require('sequelize');
const router = express.Router();

const emailValidator = require('deep-email-validator');
const sequelize = require('../config/db.config');
var initModels = require('../db_models/init-models');
const { route } = require('./assetsRouter');

// Initializing all the models
var models = initModels(sequelize);
var User = models.User;
var Action = models.Action;
var Role = models.Role;
var UserRole = models.UserRole;
var Paragraph = models.Paragraph;

function ensureAuthenticated(req, res, next) {
    console.log("In the ensureAuth function, request is ", req.isAuthenticated(), " authenticated.");
    if(req.isAuthenticated()) { 
      // console.log("In the ensureAuth function, the request headers are: \n", req.headers);
      return next(); 
    }
    return res.redirect('/login');
}

const existingNetID = async (net_id) => {
    try {
        const user = await User.findOne({ // use Sequelize model's built-in method to find a single entry where net_id = req.net_id
        where: {
            net_id: net_id
        }
        })
        if (user) {
        return true;
        }
        return false;
    } catch (error) {
        console.log("There was an error checking if this intern exists or not: ", error);
        return null;
    }
}
  
const verifyNetID = async (net_id) => {
    const inputEmail = net_id + "@illinois.edu";
    const { valid, reason, validators } = await emailValidator.validate(inputEmail);
    if (valid) {
        const alreadyExists = await existingNetID(net_id);
        if (alreadyExists != null) {
        return alreadyExists ? {message: "User already exists! Please provide another NetID.", reason: "exists"} : {message: "valid", reason: null};
        } else {
        return {
            message: "Something went wrong on our side. Please try again in a few moments or contact Admin if issue persists.", 
            reason: "db-error"
        };
        }
    } else {
        return {
        message: "Please provide a valid NetID!",
        reason: reason
        };
    }
}

router.post('/all-interns', ensureAuthenticated, async(req, res) => {
    try {
      var response = [];
      var interns = await User.findAll({
      include: [{
            model: Action,
            as: 'attempts',
            attributes: ['spotlight_attempts'] 
          },
          {
            model: Role,
            attributes: ['role'],
            where: {
                'role': 'Intern'
            },
            through: {
                attributes: []
            }
          }
      ]
      });
      if (interns.length > 0) {
        for (const intern of interns) {
            const user_id = intern.user_id;
            var term = "";
            var additional_roles = await UserRole.findAll({
              attributes: ['role'],
              where: {
                  'user_id': user_id,
                  'role': {
                    [Op.ne]: 'Intern'
                  }
              },
              raw: true
            });
            var roles = ["Intern"];
            additional_roles.forEach((role) => {
            roles.push(Object.values(role)[0]);
            })
            if (intern.term.endsWith("5")) {
            term = "SU" + intern.term.substring(1,5);
            } else if (intern.term.endsWith("8")) {
            term = "FA" + intern.term.substring(1,5);
            } else {
            term = "SP" + intern.term.substring(1,5);
            }
            var updatedBy = "";
            var updatedDate;
            if (intern.last_modified_by == null) {
              updatedBy = intern.created_by;
              updatedDate = intern.created_date;
            } else {
              updatedBy = intern.last_modified_by;
              updatedDate = intern.last_modified_date;
            }
            response.push ({
              net_id: intern.net_id,
              name: intern.name,
              term: term,
              attempts: intern.attempts[0].spotlight_attempts,
              updatedBy: updatedBy,
              updatedDate: updatedDate,
              roles: roles
            });
        }
      } else {
        response.push({net_id: null}); // no interns found in database
      }
      // console.log(interns);
      res.status(200).send(response);
    } catch (error) {
        console.log(error);
        return res.status(500).send({
        error: 'There was an error fetching the intern data!'
        }) 
    }
})
  
router.post('/add-intern', ensureAuthenticated, async(req, res) => {
    const net_id = req.body.net_id;
    const verification = await verifyNetID(net_id);
    if (verification.message == "valid") {
      const name = req.body.name;
      const season = req.body.term.slice(0, -4);
      const year = req.body.term.slice(-4);
      let term = "1" + year;
      if (season == "Fall") {
        term += "8";
      } else if (season == "Summer") {
        term += "5";
      } else {
        term += "1";
      }
      const spotlight_attempts = parseInt(req.body.attempts);
      const created_by = req.session.passport.user;
      const roles = [];
      for (const role of req.body.roles) {
        var user_role = {
          role: role,
          created_by: created_by,
          last_modified_by: null,
          last_modified_date: null
        };
        roles.push(user_role);
      }
      const newIntern = await User.create({
        net_id: net_id,
        name: name,
        term: term,
        created_by: created_by,
        last_modified_by: null,
        last_modified_date: null,
        attempts: [{ 
            spotlight_attempts: spotlight_attempts,
            message_attempts: 0,
            created_by: created_by,
            last_modified_by: null,
            last_modified_date: null
        }],
        user_roles: roles
      }, {
        include: [{ model: Action, as: 'attempts'},
                  { model: UserRole, as: 'user_roles'}]
      });
      let response = "";
      if (newIntern) {
        response = "User " + newIntern.net_id + " has been created!";
        return res.status(200).send({message: response});
      } else {
        return res.status(500).send({
          message: "Something went wrong on our side. User could not be created. Please try again later or contact Admin.", 
          reason: "db-error"
        });
      }
    } else {
      return res.status(500).send(verification);
    }
  })
  
router.post('/edit-intern', ensureAuthenticated, async(req, res) => {
    const net_id = req.body.net_id;
    const verification = await existingNetID(net_id);
    if (verification) {
        let message = "";
        const name = req.body.name;
        const season = req.body.term.slice(0, -4);
        const year = req.body.term.slice(-4);
        let term = "1" + year;
        if (season == "Fall") {
        term += "8";
        } else if (season == "Summer") {
        term += "5";
        } else {
        term += "1";
        }
        const spotlight_attempts = parseInt(req.body.attempts);
        const last_modified_by = req.session.passport.user;
        const updateIntern = await User.update({
          net_id: net_id,
          name: name,
          term: term,
          last_modified_by: last_modified_by,
          last_modified_date: Sequelize.literal('CURRENT_TIMESTAMP') 
        },
        {
          where: { net_id: net_id }
        });
        if (updateIntern[0] == 1) {
        const editedUser = await User.findOne({
            where: {
            net_id: net_id
            },
            attributes: ['user_id']
        });
        const editUserAttempts = await Action.update({
            spotlight_attempts: spotlight_attempts,
            message_attempts: 3,
            last_modified_by: last_modified_by,
            last_modified_date: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        {
            where: { user_id: editedUser.user_id } 
        });
        const editUserRoles = await editedUser.setRoles(req.body.roles, {
            through: {created_by: last_modified_by, 
                    created_date: Sequelize.literal('CURRENT_TIMESTAMP'),
                    last_modified_by: last_modified_by,  
                    last_modified_date: Sequelize.literal('CURRENT_TIMESTAMP')
                    }
        });
        if (editUserRoles) {
            message = "User " + net_id + " has been edited successfully!"
        } else {
            message = "There was an error updating user " + net_id + "'s roles!"
        }
        } else {
        message = "We couldn't. Please double check the NetID and try again!"
        }
        return res.status(200).send({message: message});
    } else {
        return res.status(500).send({message: "User doesn't exist! Please add the user or enter an existing user's NetID."});
    }
})
  
router.post('/all-staff', ensureAuthenticated, async(req, res) => {
    try {
      var response = [];
      var staff = await User.findAll({
        include: [
          {
            model: Role,
            attributes: ['role'],
            where: {
              'role': 'Staff'
            },
            through: {
              attributes: []
            }
          }
        ]
      });
      if (staff.length > 0) {
        for (const staff_member of staff) {
          const user_id = staff_member.user_id;
          var term = "";
          var additional_roles = await UserRole.findAll({
            attributes: ['role'],
            where: {
              'user_id': user_id,
              'role': {
                [Op.ne]: 'Staff'
              }
            },
            raw: true
          });
          var roles = ["Staff"];
          additional_roles.forEach((role) => {
            roles.push(Object.values(role)[0]);
          })
          if (staff_member.term.endsWith("5")) {
            term = "SU" + staff_member.term.substring(1,5);
          } else if (staff_member.term.endsWith("8")) {
            term = "FA" + staff_member.term.substring(1,5);
          } else {
            term = "SP" + staff_member.term.substring(1,5);
          }
          var updatedBy = "";
          var updatedDate;
          if (staff_member.last_modified_by == null) {
            updatedBy = staff_member.created_by;
            updatedDate = staff_member.created_date;
          } else {
            updatedBy = staff_member.last_modified_by;
            updatedDate = staff_member.last_modified_date;
          }
          response.push ({
            net_id: staff_member.net_id,
            name: staff_member.name,
            term: term,
            updatedBy: updatedBy,
            updatedDate: updatedDate,
            roles: roles
          });
        }
      } else {
        response.push({net_id: null}); // no staff found in database
      }
      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        error: 'There was an error fetching the staff data!'
      }) 
    }
})
  
router.post('/add-staff', ensureAuthenticated, async(req, res) => {
    const net_id = req.body.net_id;
    const inputEmail = net_id + "@illinois.edu";
    const { valid, reason, validators } = await emailValidator.validate(inputEmail);
    const created_by = req.session.passport.user;
    // if valid netID
    if (valid) {
      const user = await User.findOne({ 
        where: {
          net_id: net_id
        },
        include: [
          {
            model: Role,
            attributes: ['role'],
            through: {
              attributes: []
            }
          }
        ]
      })
      // if user already exists, give the user the Staff role too
      // if user doesn't exist, then we can add them as a new Staff member
      if (user) { 
        console.log("User " + user.net_id +" already exists!");
        let is_staff;
        let existing_roles = [];
        user.Roles.forEach((role_model) => {
          existing_roles.push(role_model.role);
          is_staff = (role_model.role == 'Staff');
        })
        if (is_staff) {
          return res.status(200).send({
            message: "User is already a staff member!"
          })
        } else {
          const roles_to_add = [...new Set([...req.body.roles, ...existing_roles])];
          // console.log(roles_to_add);
          await user.setRoles(roles_to_add, {
            through: {
              created_by: created_by, 
              created_date: Sequelize.literal('CURRENT_TIMESTAMP'),
              last_modified_by: null,
              last_modified_date: null
            }
          });
          const response = "User " + net_id + " was an existing user and has been granted the Staff Role!";
          return res.status(200).send({message: response});
        }
      } else { 
        const name = req.body.name;
        const season = req.body.term.slice(0, -4);
        const year = req.body.term.slice(-4);
        let term = "1" + year;
        if (season == "Fall") {
          term += "8";
        } else if (season == "Summer") {
          term += "5";
        } else {
          term += "1";
        }
        const roles = [];
        let hasInternRole;
        for (const role of req.body.roles) {
          hasInternRole = (role == 'Intern');
          var user_role = {
            role: role,
            created_by: created_by,
            last_modified_by: null,
            last_modified_date: null
          };
          roles.push(user_role);
        }
        let newStaff;
        // if one of the roles is Intern, then they do need 3 attempts
        if (hasInternRole) {
          newStaff = await User.create({
            net_id: net_id,
            name: name,
            term: term,
            created_by: created_by,
            last_modified_by: null,
            last_modified_date: null,
            attempts: [{ 
              created_by: created_by,
              last_modified_by: null,
              last_modified_date: null
            }],
            user_roles: roles,
          }, {
            include: [{ model: Action, as: 'attempts'},
                      { model: UserRole, as: 'user_roles'}]
          });
        } else { // otherwise they don't get any attempts 
          newStaff = await User.create({
            net_id: net_id,
            name: name,
            term: term,
            created_by: created_by,
            last_modified_by: null,
            last_modified_date: null,
            user_roles: roles
          }, {
            include: [{ model: UserRole, as: 'user_roles'}]
          });
        }
        if (newStaff) {
          const response = "User " + newStaff.net_id + " has been created!";
          return res.status(200).send({message: response});
        } else {
          return res.status(500).send({
            message: "Something went wrong on our side. User could not be created. Please try again later or contact Admin.", 
            reason: "db-error"
          });
        }
      }
    } else {
      return res.status(500).send({
        message: "Please provide a valid NetID!",
        reason: reason
      });
    }
})
  
router.post('/edit-staff', ensureAuthenticated, async(req, res) => {
    const net_id = req.body.net_id;
    const verification = await existingNetID(net_id);
    if (verification) {
      let message = "";
      const name = req.body.name;
      const season = req.body.term.slice(0, -4);
      const year = req.body.term.slice(-4);
      let term = "1" + year;
      if (season == "Fall") {
        term += "8";
      } else if (season == "Summer") {
        term += "5";
      } else {
        term += "1";
      }
      const last_modified_by = req.session.passport.user;
      const updateStaff = await User.update({
        net_id: net_id,
        name: name,
        term: term,
        last_modified_by: last_modified_by,
        last_modified_date: Sequelize.literal('CURRENT_TIMESTAMP') 
      },
      {
        where: { net_id: net_id }
      });
      if (updateStaff[0] == 1) {
        const editedUser = await User.findOne({
          where: {
            net_id: net_id
          },
          attributes: {exclude: ['net_id', 'name', 'created_by', 'created_date', 'last_modified_by', 'term', 'last_modified_date']}
        });
        // if we edit a staff member and give them the Intern role, then we need to add attempts to them
        if (req.body.roles.includes('Intern')) {
          await Action.create({
            user_id: editedUser.user_id,
            spotlight_attempts: 3,
            message_attempts: 3,
            created_by: last_modified_by,
            last_modified_by: null,
            last_modified_date: null
          });
        }
        const editUserRoles = await editedUser.setRoles(req.body.roles, {
          through: {created_by: last_modified_by, 
                    created_date: Sequelize.literal('CURRENT_TIMESTAMP'),
                    last_modified_by: last_modified_by,  
                    last_modified_date: Sequelize.literal('CURRENT_TIMESTAMP')
                  }
        });
        message = "User " + net_id + " has been edited successfully!"
      } else {
        message = "We couldn't. Please double check the NetID and try again!"
      }
      return res.status(200).send({message: message});
    } else {
      return res.status(500).send({message: "User doesn't exist! Please add the user or enter an existing user's NetID."});
    }
})

router.post('/all-admin', ensureAuthenticated, async(req, res) => {
  try {
    var response = [];
    var admin = await User.findAll({
      include: [
        {
          model: Role,
          attributes: ['role'],
          where: {
            'role': 'Admin'
          },
          through: {
            attributes: []
          }
        }
      ]
    });
    if (admin.length > 0) {
      for (const admin_member of admin) {
        const user_id = admin_member.user_id;
        var term = "";
        var additional_roles = await UserRole.findAll({
          attributes: ['role'],
          where: {
            'user_id': user_id,
            'role': {
              [Op.ne]: 'Admin'
            }
          },
          raw: true
        });
        var roles = ["Admin"];
        additional_roles.forEach((role) => {
          roles.push(Object.values(role)[0]);
        })
        if (admin_member.term.endsWith("5")) {
          term = "SU" + admin_member.term.substring(1,5);
        } else if (admin_member.term.endsWith("8")) {
          term = "FA" + admin_member.term.substring(1,5);
        } else {
          term = "SP" + admin_member.term.substring(1,5);
        }
        var updatedBy = "";
        var updatedDate;
        if (admin_member.last_modified_by == null) {
          updatedBy = admin_member.created_by;
          updatedDate = admin_member.created_date;
        } else {
          updatedBy = admin_member.last_modified_by;
          updatedDate = admin_member.last_modified_date;
        }
        response.push ({
          net_id: admin_member.net_id,
          name: admin_member.name,
          term: term,
          updatedBy: updatedBy,
          updatedDate: updatedDate,
          roles: roles
        });
      }
    } else {
      response.push({net_id: null}); // no admin found in database
    }
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: 'There was an error fetching the admin data!'
    }) 
  }
})

router.post('/add-admin', ensureAuthenticated, async(req, res) => {
  const net_id = req.body.net_id;
  const inputEmail = net_id + "@illinois.edu";
  const { valid, reason, validators } = await emailValidator.validate(inputEmail);
  const created_by = req.session.passport.user;
  // if valid netID
  if (valid) {
    const user = await User.findOne({ 
      where: {
        net_id: net_id
      },
      include: [
        {
          model: Role,
          attributes: ['role'],
          through: {
            attributes: []
          }
        }
      ]
    })
    // if user already exists, give the user the Admin role too
    // if user doesn't exist, then we can add them as a new Admin member
    if (user) { 
      console.log("User " + user.net_id +" already exists!");
      let is_admin;
      let existing_roles = [];
      user.Roles.forEach((role_model) => {
        existing_roles.push(role_model.role);
        is_admin = (role_model.role == 'Admin');
      })
      if (is_admin) {
        return res.status(200).send({
          message: "User is already a admin!"
        })
      } else {
        const roles_to_add = [...new Set([...req.body.roles, ...existing_roles])];
        await user.setRoles(roles_to_add, {
          through: {
            created_by: created_by, 
            created_date: Sequelize.literal('CURRENT_TIMESTAMP'),
            last_modified_by: null,
            last_modified_date: null
          }
        });
        const response = "User " + net_id + " was an existing user and has been granted the Admin Role!";
        return res.status(200).send({message: response});
      }
    } else { 
      const name = req.body.name;
      const season = req.body.term.slice(0, -4);
      const year = req.body.term.slice(-4);
      let term = "1" + year;
      if (season == "Fall") {
        term += "8";
      } else if (season == "Summer") {
        term += "5";
      } else {
        term += "1";
      }
      const roles = [];
      for (const role of req.body.roles) {
        var user_role = {
          role: role,
          created_by: created_by,
          last_modified_by: null,
          last_modified_date: null
        };
        roles.push(user_role);
      }
      const newAdmin = await User.create({
        net_id: net_id,
        name: name,
        term: term,
        created_by: created_by,
        last_modified_by: null,
        last_modified_date: null,
        user_roles: roles
      },{
        include: [{ model: UserRole, as: 'user_roles'}]
      });
      if (newAdmin) {
        const response = "User " + newAdmin.net_id + " has been created!";
        return res.status(200).send({message: response});
      } else {
        return res.status(500).send({
          message: "Something went wrong on our side. User could not be created. Please try again later or contact Admin.", 
          reason: "db-error"
        });
      }
    }
  } else {
    return res.status(500).send({
      message: "Please provide a valid NetID!",
      reason: reason
    });
  }
})

router.post('/edit-admin', ensureAuthenticated, async(req, res) => {
  const net_id = req.body.net_id;
  const verification = await existingNetID(net_id);
  if (verification) {
    let message = "";
    const name = req.body.name;
    const season = req.body.term.slice(0, -4);
    const year = req.body.term.slice(-4);
    let term = "1" + year;
    if (season == "Fall") {
      term += "8";
    } else if (season == "Summer") {
      term += "5";
    } else {
      term += "1";
    }
    const last_modified_by = req.session.passport.user;
    const updateAdmin = await User.update({
      net_id: net_id,
      name: name,
      term: term,
      last_modified_by: last_modified_by,
      last_modified_date: Sequelize.literal('CURRENT_TIMESTAMP') 
    },
    {
      where: { net_id: net_id }
    });
    if (updateAdmin[0] == 1) {
      // grabbing the user so we can update their roles too
      const editedUser = await User.findOne({
        where: {
          net_id: net_id
        },
        attributes: {exclude: ['net_id', 'name', 'created_by', 'created_date', 'last_modified_by', 'term', 'last_modified_date']},
        include: [
          {
            model: models.Role,
            attributes: ['role'],
            through: {
              attributes: []
            }
          }
        ]
      });
      let existing_roles = [];
      editedUser.Roles.forEach((role_model) => {
        existing_roles.push(role_model.role)
      })
      // To prevent duplicates, does a union for the existing roles and the roles the user wants to add
      const roles_to_add = [...new Set([...req.body.roles, ...existing_roles])];
      const editUserRoles = await editedUser.setRoles(roles_to_add, {
        through: {created_by: last_modified_by, 
                  created_date: Sequelize.literal('CURRENT_TIMESTAMP'),
                  last_modified_by: last_modified_by,  
                  last_modified_date: Sequelize.literal('CURRENT_TIMESTAMP')
                }
      });
      message = "User " + net_id + " has been edited successfully!"
    } else {
      message = "We couldn't. Please double check the NetID and try again!"
    }
    return res.status(200).send({message: message});
  } else {
    return res.status(500).send({message: "User doesn't exist! Please add the user or enter an existing user's NetID."});
  }
})

router.post('/delete-user', ensureAuthenticated, async(req, res) => {
  const net_id = req.body.net_id;
  console.log(net_id);
  const verification = await existingNetID(net_id);
  if (verification) {
    await User.destroy(
    {
      where: { net_id: net_id }
    });
    const message = "User " + req.body.net_id + " has been deleted!";
    return res.status(200).send({message: message});
  } else {
    return res.status(500).send({message: "User can't be deleted as they don't exist! Please try again."});
  }
})

router.get('/paragraph/:netID', ensureAuthenticated, async(req, res) => {
  const net_id = req.params.netID;
  try {
    const user = await User.findOne({
      where: {
        net_id: net_id,
      },
      attributes: ['term'],
      include: [
          {
            model: Paragraph,
            as: 'paragraphs',
            attributes: ['paragraph']
          }
      ],
      plain: true
    });
    if (user.paragraphs.length > 0) {
      const result = JSON.stringify(user, null, 2);
      return res.status(200).send(result);
    } else {
      return res.status(200).send({
        message: "No paragraph found! Please add a paragraph by going to CREATE SPOTLIGHT"
      })
    }
  } catch(error) {
    return res.status(500).send({message: "There was an error getting your paragraph! Please refresh the page."});
  }
})

router.get('/all-paragraphs', ensureAuthenticated, async(req, res) => {
  try {
    const all_user_paragraphs = await User.findAll({
      attributes: {exclude: ['user_id']},
      include: [
          {
            model: Paragraph,
            as: 'paragraphs',
            attributes: ['paragraph'],
            where: {
              paragraph: {
                [Op.ne]: null  
              }
            }
          }
      ]
    });
    if (all_user_paragraphs.length > 0) {
      let response = [];
      for (const user of all_user_paragraphs) {
        var term = "";
        if (user.term.endsWith("5")) {
          term = "SU" + user.term.substring(1,5);
        } else if (user.term.endsWith("8")) {
          term = "FA" + user.term.substring(1,5);
        } else {
          term = "SP" + user.term.substring(1,5);
        }
        var updatedBy = "";
        var updatedDate;
        if (user.last_modified_by == null) {
          updatedBy = user.created_by;
          updatedDate = user.created_date;
        } else {
          updatedBy = user.last_modified_by;
          updatedDate = user.last_modified_date;
        }
        response.push ({
          net_id: user.net_id,
          name: user.name,
          term: term,
          paragraph: user.paragraphs[0].paragraph,
          updatedBy: updatedBy,
          updatedDate: updatedDate
        });
      }
      return res.status(200).send(response);
    } else {
      return res.status(200).send({
        message: "No paragraphs found! Please tell interns to add their paragraphs by going to CREATE SPOTLIGHT"
      })
    }
  } catch(error) {
    return res.status(500).send({
      message: "Something went wrong with getting the paragraphs! Please refresh the page."
    })
  }
})

router.post('/edit-paragraph', ensureAuthenticated, async(req, res) => {
  const verification = await existingNetID(req.body.net_id);
  if (verification) {
    const last_modified_by = req.session.passport.user;
    const editedUser = await User.findOne({
      where: {
        net_id: req.body.net_id
      },
      attributes: ['user_id']
    });
    const editUserParagraph = await Paragraph.update({
      paragraph: req.body.paragraph,
      last_modified_by: last_modified_by,
      last_modified_date: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    {
        where: { user_id: editedUser.user_id } 
    });
    if (editUserParagraph[0] == 1) {
      const message = "User " + req.body.net_id + "\'s paragraph has been edited successfully!"
      return res.status(200).send({message: message});
    } else {
      const message = "User " + net_id + "\'s paragraph couldn't be edited! Please try again!"
      return res.status(500).send({message: message});
    }
  } else {
    return res.status(500).send({message: "User doesn't exist! You can only edit existing interns."});
  }
})

router.post('/add-paragraph', ensureAuthenticated, async(req, res) => {
    const net_id = req.session.passport.user;
    try {
      const user = await User.findOne({ // use Sequelize model's built-in method to find a single entry where net_id = req.net_id
        where: {
          net_id: net_id
        }
      })
      if (user) {
        await Paragraph.create({
          user_id: user.user_id,
          term: req.body.term,
          created_by: net_id,
          last_modified_by: null,
          last_modified_date: null
        });
        let message = "Paragraph has been added for " + net_id;
        return res.status(500).send({message: message});
      } else {
        return res.status(500).send({message: "Can't add paragraph as you don't exist! Please contact staff."});
      }
    } catch (error) {
      return res.status(500).send({message: "There was an error checking if you exist in our database! Please try again."});
    }
})

router.post('/update-attempts', ensureAuthenticated, async(req, res) => {
  try {
    const user = await User.findOne({
      where: {
        net_id: req.body.net_id,
      },
      attributes: ['user_id']
    });
    if (user) {
      await Action.update({
        spotlight_attempts: req.body.attempts,
        message_attempts: 3,
        last_modified_by: req.body.net_id,
        last_modified_date: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      {
          where: { user_id: user.user_id } 
      });
      return res.status(200).send({message: "valid"});
    } else {
      // user doesn't exist
      return res.status(500).send({message: "User doesn't exist!"});
    }
  } catch(err) {
    return res.status(500).send({message: "There was an error updating your attempts! Please refresh the page."});
  }
})

module.exports = router;
