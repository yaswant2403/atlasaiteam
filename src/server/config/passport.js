/******************************************************************************
 * Module dependencies and initialization.
 *****************************************************************************/
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

//exporting passport object
module.exports = passport;