
require('dotenv').config();
var errors = require('http-errors');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
// Debugging Purposes
var bunyan = require('bunyan'); // logger
var morgan = require ('morgan'); // http request logger middleware

var config = require('./config');
const { profile } = require('console');

// Setting up databse for express session
// var MySQLStore = require('express-mysql-session')(expressSession);
// const options = {
//     host:
// }

const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
var log = bunyan.createLogger({
    name: "Azure AD Example Web App"
});

// Setting up the passport in the app

//passport needs to be able to serialize users into and deseriazlize users out of the session
passport.serializeUser(function(user, done) {
    done(null, user.oid);
});
passport.deserializeUser(function(oid, done) {
    findByOid(oid, function (err, user) {
        done(err, user);
    });
});
// logged in users
var users = [];
var findByOid = function(oid, fn) {
    for (var i = 0, len=users.length; i < len; i++) {
        var user = users[i];
        log.info('we are using user', user);
        if (user.oid === oid) {
            return fn(null, user);
        }
    }
    return fn(null, null);
};

// Use OIDCStrategy within Passport
const strategyConfig = {
    identityMetadata: config.creds.identityMetadata,
    clientID: config.creds.clientID,
    responseType: config.creds.responseType,
    responseMode: config.creds.responseMode,
    redirectUrl: config.creds.redirectUrl,
    allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
    clientSecret: config.creds.clientSecret,
    validateIssuer: config.creds.validateIssuer,
    isB2C: config.creds.isB2C,
    passReqToCallback: config.creds.passReqToCallback,
    scope: config.creds.scope,
    loggingLevel: config.creds.loggingLevel,
    useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
};

passport.use(new OIDCStrategy(strategyConfig, function(iss, sub, profile, accessToken, refreshToken, done) {
    if (!profile.oid) {
        return done(new Error("No OID Found"), null);
    }
    findByOid(profile.oid, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            // automatically registers user
            users.push(profile);
            return done(null, profile);
        }
        return done(null, user);
    })
}));

// Configuring the app
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(expressSession({secret: 'key', resave: true, saveUninitialized: false, cookie: {secure: false}}));
app.use(express.urlencoded({extended: true}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/openid', 
    passport.authenticate('azuread-openidconnect', {failureRedirect: '/login'}),
    (req, res) => {
        res.redirect('/');
    }
);

app.get('/auth/openid/return', 
    passport.authenticate('azuread-openidconnect', {failureRedirect: '/login'}),
    (req, res) => {
        res.redirect('/');
    }
);

app.get('/logout', 
    passport.authenticate('azuread-openidconnect', {failureRedirect: '/login'}),
    (req, res) => {
        res.redirect('/');
    }
);