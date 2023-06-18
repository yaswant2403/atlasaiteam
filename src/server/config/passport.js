var passport = require("passport");
var OIDCStrategy = require("passport-azure-ad").OIDCStrategy;
var User = require('./db.config');

try {
    (async () => {
      await User.sync();
      console.log('Passport use')
    })();
  } catch (error) {
    console.error('Unable to create table!', error);
  }

// for logging
const bunyan = require('bunyan');
var logger = bunyan.createLogger({
  name: 'Spotlight Generator Application'
});

passport.serializeUser(function(user, done) {
    done(null, user.oid);
});
  
passport.deserializeUser(function(oid, done) {
    User.findOne({
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
        User.create(data).then(function(newUser, created) {
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
  
// Using OIDC Strategy with custom configs and verify callback function
const strategy = new OIDCStrategy(OIDC_Configs, verifyCallback);
passport.use(strategy);

module.exports = passport;