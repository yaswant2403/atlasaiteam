/******************************************************************************
 * Module dependencies and initialization.
 *****************************************************************************/
const express = require("express");
const router = express.Router();

var passport = require("passport");
var OIDCStrategy = require("passport-azure-ad").OIDCStrategy;
var User = require('./db.config'); //grabbing User from database
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
passport.serializeUser(function(user, done) {
    done(null, user.oid);
});
  
passport.deserializeUser(function(oid, done) {
    User.findOne({ // use Sequelize model's built-in method to find a single entry where oid = req.oid
        where: {
        oid: oid
        }
    }).then(function(user) {
        if(user) {
            return done(null, user);
        }
    })
    .catch((err) => {
        console.log("Something wrong with database: ", err);
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
    loggingLevel: 'info',
};

// Strategies in passport require a `verify` function, which accepts credentials
// (in this case, the `oid` claim in id_token), and invoke a callback to find
// the corresponding user object. For this example, we simply add the user if they don't exist
// in our database. However, for production, we will have a database already created
// and if they don't exist in there, they won't be able to access our web application
var verifyCallback = function (iss, sub, profile, accessToken, refreshToken, done) {
    if (!profile.oid) {
        console.log(profile);
        return done(new Error("No OID found!"), null);
    }
    User.findOne({
        where: {
        oid: profile.oid
        }
    }).then(function(user) {
        if (user) {
            logger.info('we are using user: ', user);
            return done(null, user);
        } else {
            var data = {
                oid: profile.oid,
                name: profile.displayName,
                email: profile._json.email
            }
            User.create(data).then(function(newUser, created) { // adding a new User to our database
                console.log("Created a new user! Here they are:")
                console.log(newUser.name);
                console.log(newUser);
                return done(null, newUser);
            })
        }
    })
    .catch((err) => {
        console.log("Something wrong with database: ", err);
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
    console.log("User is authenticated! We received a return from AzureAD");
    res.redirect('/spotlight');
  }
);

// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/login-error'; otherwise, it redirects them to the /message.
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


//exporting passport object
module.exports.passport = passport;
// exporting router
module.exports.router = router;