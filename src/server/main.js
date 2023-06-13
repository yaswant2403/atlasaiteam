// Initializing dependencies
const express = require("express");
const ViteExpress = require("vite-express");
const cors = require("cors");
const path = require("path");

// for logging
const bunyan = require('bunyan');
var logger = bunyan.createLogger({
  name: 'Spotlight Generator Application'
});

// Dependencies for Authentication
require('dotenv').config();
const expressSession = require("express-session");
var passport = require("passport");
var OIDCStrategy = require("passport-azure-ad").OIDCStrategy;


// Creating Express App
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

// Set up mySQL Database, create User model with Sequelize, and connect database to express session
const { Sequelize, DataTypes } = require('sequelize');
const mysql = require("mysql2");
const MySQLStore = require("express-mysql-session")(expressSession);

const sequelize = new Sequelize(process.env.DATABASE, 'user', process.env.PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
  logging: msg => logger.debug(msg)
});

try {
  (async () => {
    await sequelize.authenticate();
  })();
  console.log('Connection has been established!')
} catch (error) {
  console.error('Unable to connect!', error);
}

// Created User schema where oid and email will be added when the user is logged in
const User = sequelize.define('User', {
  'oid': {
    type: DataTypes.STRING
  },
  'name': {
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
  })();
  console.log('Interns table for User model has been created!')
} catch (error) {
  console.error('Unable to create table!', error);
}

// Setting up Passport

//-----------------------------------------------------------------------------
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session.  Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing.
//-----------------------------------------------------------------------------
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

/**
 * -------------- SESSION SETUP ----------------
 */
const options = {
  host: 'localhost',
  port: '3306',
  user: 'user',
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  createDatabaseTable: true
};
const sessionStore = new MySQLStore(options);
// checking sessionStore has no errors
sessionStore.onReady().then(() => {
  console.log("MySQLStore ready!");
}).catch(error => {
  console.log(error);
});

app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: false // set to true if using https
  }
}))

//Passport authentication by making Express use it
app.use(passport.initialize());
app.use(passport.session());

// const connection = mysql.createConnection(options);
// connection.connect((err) => {
//   if (!err) {
//     console.log("Connected!");
//     // connection.query('SHOW TABLES', function(err, results) {
//     //   if (err) {
//     //     console.log(err);
//     //   } else {
//     //     console.log(results);
//     //   }
//     // })
//   } else {
//     console.log(err);
//     console.log("Connection failed");
//   }
// })

// root@localhost at port 3306

// Grabbing routers to load assets, css, js
const assetsRouter = require("./routes/assetsRouter");
const cssRouter = require("./routes/cssRouter");
const jsRouter = require("./routes/jsRouter");
// whenever app wants to use assets,css,js, it'll go through the router to ensure that they load in properly
// app use middleware, then next called at the end of it or redirect them automatically
// function ensureAuthentication(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect('/auth/openid');
// }

// Get requests for all the pages
// app.get("/", ensureAuthentication, (req, res, next) => {
//   console.log("You are authenticated!")
//   console.log("Your user email is: ", req.user._json.email);
//   return next();
// }, function(req, res, next) {
//   res.sendFile(path.join(__dirname, "../../index.html"));
// });
// middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) { return next(); }
  res.redirect('http://localhost:3000/login');
}

// Home Page is the Login Page
app.get("/", (req, res) => {
  console.log("I made it here!");
  res.sendFile(path.join(__dirname, "../client/html/login.html"));
})

app.get("/login", (req, res) => {
  console.log("Here is the login page!")
  // const login = '<a href=\"/auth/openid\">Login Through Azure AD!</a>';
  res.redirect("/");
})

// After user clicks on login, we send them to a /auth/openid page
app.get("/auth/openid", passport.authenticate('azuread-openidconnect', {failureRedirect: '/login-error'}), 
  (req, res) => {
    console.log("User is authenticated! We received a return from AzureAD");
    res.redirect('/message');
  }
);
/// 'GET returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
app.post("/auth/openid/return", passport.authenticate('azuread-openidconnect', {failureRedirect: '/login-error'}), 
  (req, res) => {
    console.log("User is authenticated! We received a return from AzureAD AGAIN!");
    res.redirect('/message');
  }
);
// If user fails authentication, we send them back to login-error
app.get("/login-error", (req, res) => {
  console.log("User isn't authenticated!");
  res.send("<p>You are NOT authenticated!<p>");
})

// 'logout' route, logout from passport, and destroy the session with AAD.
app.get('/logout', function(req, res) {
  // logout removes req.user property and clears any login sessions
  req.logout(function(err) {
    if (err) { console.error("Error logging out!", err); }
  });
  // then destroy the session
  // req.session.destroy(function(err) {
  //   if (err) {
  //     console.error("Error destroying session!", err);
  //   }
  // });
  // send user back to login page
  const postLogoutRedirectURL = encodeURIComponent('http://localhost:3000/login');
  res.redirect(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/logout?post_logout_redirect_uri=${postLogoutRedirectURL}`);
});

app.use("/assets", assetsRouter);
app.use("/css", cssRouter);
app.use("/js", jsRouter);
// app.get("/login", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/html/login.html"));
// })
app.get("/message", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../../index.html"));
});
app.get("/spotlight", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/spotlight.html"));
});
app.get("/about", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/about.html"));
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);

// Test whether user can logout and then they shouldn't be able to access 