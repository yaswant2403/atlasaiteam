/******************************************************************************
 * Module dependencies and initialization.
 *****************************************************************************/
const express = require("express");
const router = express.Router();

var passport = require("passport");
var OIDCStrategy = require("passport-azure-ad").OIDCStrategy;

const sequelize = require('./db.config');
var initModels = require('../db_models/init-models');
var models = initModels(sequelize);
var User = models.User;
var Action = models.Action;
var Role = models.Role;

// checking database connection
try {
  (async () => {
    await User.sync();
    console.log('User synced to database in passport.js!')
  })();
} catch (error) {
  console.error('Unable to sync database in passport.js!', error);
}

// for logging
const bunyan = require('bunyan');
var logger = bunyan.createLogger({
  name: 'Spotlight Generator Application'
});

// Setting up Passport
//-----------------------------------------------------------------------------
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. In our case,
// we are storing the user netID when serializing, and finding the user by netID 
// when deserializing.
//-----------------------------------------------------------------------------
passport.serializeUser(async function(user, done) {
    // serializing the user's net_id and all their roles to use them when they go to certain pages
    done(null, user.net_id);
});
  
passport.deserializeUser(function(net_id, done) {
    User.findOne({ // use Sequelize model's built-in method to find a single entry where net_id = req.net_id
        where: {
          net_id: net_id
        }
    }).then(function(user) {
        if(user) {
            return done(null, user);
        }
    })
    .catch((err) => {
        console.log("Something went wrong with deserializing User in passport.js: ", err);
        return done(err);
    });
});

// Use the OIDCStrategy within Passport.

// OIDC Configuration options (https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc)
var OIDC_Configs = {
    identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.CLIENT_ID, // Required, the client ID of your app in AAD
    responseType: 'code id_token',
    responseMode: 'form_post',
    redirectUrl: process.env.REDIRECT_URL, //the reply URL registered in AAD for your app
    allowHttpForRedirectUrl: true, // false if using https
    clientSecret: process.env.CLIENT_SECRET,
    validateIssuer: true,
    passReqToCallback: false,
    scope: ['openid', 'profile', 'email'],
    cookieSameSite: true,
    loggingLevel: 'info',
};

// Strategies in passport require a `verify` function, which accepts credentials
// (in this case, the `oid` claim in id_token), and invoke a callback to find
// the corresponding user object. For this example, we simply add the user if they don't exist
// in our database. However, for production, we will have a database already created
// and if they don't exist in there, they won't be able to access our web application
var verifyCallback = function (iss, sub, profile, accessToken, refreshToken, done) {
    console.log();
    if (!profile._json.email) {
        console.log(profile);
        return done(new Error("No EMAIL found!"), null);
    }
    const user_netID = profile._json.email.substring(0, profile._json.email.indexOf("@"))
    User.findOne({
        where: {
          net_id: user_netID
        }
    }).then(function(user) {
        if (user) {
            logger.info('we are using user: ', user);
            return done(null, user);
        } else {
            return done(new Error("Unauthorized User!"), null)
        }
    })
    .catch((err) => {
        console.log("Something went wrong with verifying callback in passport.js ", err);
        done(err);
    });
};
  
// Making passport use our OIDC Strategy with custom configs and verify callback function
const strategy = new OIDCStrategy(OIDC_Configs, verifyCallback);
passport.use(strategy);

/*****************************
 * Authentication Routes
 *****************************/

// After user clicks on login, we send them to a /auth/openid page
router.get("/auth/openid", passport.authenticate('azuread-openidconnect', {failureRedirect: '/login-error'}), 
  (req, res) => {
    console.log(req.headers);
    console.log("User is authenticated! We received a return from AzureAD");
    res.redirect('/spotlight');
  }
);

// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/login-error'; otherwise, it redirects them to the /spotlight.
router.post("/auth/openid/return", passport.authenticate('azuread-openidconnect', {failureRedirect: '/login-error'}), 
  (req, res) => {
    console.log("User is authenticated! We received a return from AzureAD AGAIN!");
    res.redirect('/spotlight');
  }
);

// router.get("/auth/check-auth", ensureAuthenticated, (req, res) => {
//   res.json({isAuthenticated : true});
// })

// If user fails authentication, we send them back to login-error
router.get("/login-error", (req, res) => {
  console.log("User isn't authenticated!");
  res.send("<p>You are NOT authenticated!<p>"); // link them back to login page
})

// Only added because for some reason if a user does /logout, they're able to access generate message.
router.get('/logout', function(req, res) {
  if (req.isAuthenticated()) { 
    // console.log("In the login function, the request headers are: \n", req.headers); 
    return res.redirect('/'); 
  }
  return res.redirect('/login');
})

// 'logout' route, logout from passport, and destroy the session with AAD.
router.post('/logout', function(req, res) {
  // logout removes req.user property and clears any sessions stored in our database
  req.logout(function(err) {
    if (err) { console.error("Error logging out!", err); }
  });
  // send user back to login page
  const postLogoutRedirectURL = encodeURIComponent('http://localhost:3000/login');
  res.redirect(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/logout?post_logout_redirect_uri=${postLogoutRedirectURL}`);
});

function ensureAuthenticated(req, res, next) {
  console.log("In the ensureAuth function, request is ", req.isAuthenticated());
  if(req.isAuthenticated()) { 
    // console.log("In the ensureAuth function, the request headers are: \n", req.headers);
    return next(); 
  }
  return res.redirect('/login');
}

async function getUser(net_id) {
  const user_seq_format = await User.findOne({
    attributes: ['net_id', 'name'],
    where: {
      'net_id': net_id
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
  let roles = [];
  user_seq_format.dataValues.Roles.forEach(role => {
    roles.push(role.dataValues.role)
  });
  const user = {
    'net_id': user_seq_format.dataValues.net_id,
    'name': user_seq_format.dataValues.name,
    'roles': roles
  }
  return user;
}

async function getUserAndAttempts(net_id) {
  const user_seq_format = await User.findOne({
    attributes: ['net_id', 'name'],
    where: {
      'net_id': net_id
    },
    include: [
        {
          model: Action,
          as: 'attempts',
          attributes: ['spotlight_attempts'] 
        },
        {
          model: Role,
          attributes: ['role'],
          through: {
              attributes: []
          }
        }
      ]
  })
  let roles = [];
  user_seq_format.dataValues.Roles.forEach(role => {
    roles.push(role.dataValues.role)
  });
  let attempts = 0;
  if (user_seq_format.attempts.length > 0) { // if the user is only an Admin, they won't have any attempts
    attempts = user_seq_format.attempts[0].spotlight_attempts;
  } else {
    attempts = 0;
  }
  const user = {
    'net_id': user_seq_format.net_id,
    'name': user_seq_format.name,
    'roles': roles,
    'attempts': attempts
  }
  return user;
}

//exporting passport object
module.exports.passport = passport;
// exporting router
module.exports.router = router;
// exporting the ensureAuthenticated middleware and getUser helpers
module.exports.authMiddleware = ensureAuthenticated;
module.exports.getUser = getUser;
module.exports.getUserAndAttempts = getUserAndAttempts;
