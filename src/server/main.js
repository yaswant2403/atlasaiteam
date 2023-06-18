/******************************************************************************
 * Module dependencies.
 *****************************************************************************/
const express = require("express");
const ViteExpress = require("vite-express"); // to be able to run vite frontend using Express as backend
const cors = require("cors");
const path = require("path");
require('dotenv').config();
const expressSession = require("express-session"); // necessary to store the session of our user

// Creating Express App
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

/******************************************************************************
 * Database Connection Check
 *****************************************************************************/
// Grabbing user model from database
var UserA = require('./config/db.config');
// // testing if UserA is able to sync with our database
try {
  (async () => {
    await UserA.sync();
    console.log('Users have been synced! [main.js]');
  })();
} catch (error) {
  console.error('Unable to sync to database [main.js]!', error);
}

// importing the passport configuration which handles the authentication
var passport = require('passport');
require('./config/passport.js');

/******************************************************************************
 * Session Store Setup
 *****************************************************************************/

/********************************
 * What is a session?
 * A session stores unique information about the current user of our application such that
 * if they close the tab, they're able to access the website again without having to log in.
 * Passport handles the behind the scenes to allow our server to recognize the user and then grant them access.
 * 
 * We could store this unique information in a cookie, but that's unsafe because hackers can easily access any identifying information
 * within the cookie (since cookies are stored in the browser) and pretend to be that user. Additonally, cookies have a limit on the
 * amount of information we can store in them. As such, we use a database to store all of the different sessions of our users. In this
 * app, we store them in a MySQL Database, but you can store them in MongoDB, PostgreSQL, etc.
 * 
 * Once the user logs out, the session gets destroyed in our database and the user must log back in to access our application.
 * 
 * An important note is that if the user closes their browser, the session-id they received previously will no longer be valid. 
 * It will expire according to its expiry date and they'll have to login again creating a new session with a new session-id.
 ********************************/

// initializing session store with mySQL so that each user has a unique session
const MySQLStore = require("express-mysql-session")(expressSession);

// our database details so MySQLStore can create a new sessions table 
const options = {
  host: 'localhost',
  port: '3306',
  user: 'user',
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  createDatabaseTable: true
};
const sessionStore = new MySQLStore(options);
// checking sessionStore has no errors and is configured properly
sessionStore.onReady().then(() => {
  console.log("MySQLStore ready!");
}).catch(error => {
  console.log(error);
});

// Telling our express app to use a session and then store that session in our MySQL Database
app.use(expressSession({
  secret: process.env.SESSION_SECRET, // a random arrangement of characters
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // expiration data of cookie (will delete itself from our database)
    secure: false // set to true if using https
  }
}))

// Initializing Passport with our Express App
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

//-----------------------------------------------------------------------------
// Setting up Necessary Route Controllers
//
// 1. For 'login' route and 'returnURL' route, use `passport.authenticate`. 
// This way the passport middleware can redirect the user to login page, receive
// id_token, oid, display name, etc from returnURL.
//
// 2. For the routes you want to check if user is already logged in, use 
// `ensureAuthenticated`. It checks if there is an user stored in session, if not
// it will redirect user to login page where passport can authenticate.
//-----------------------------------------------------------------------------

// Grabbing routers to load assets, css, js
const assetsRouter = require("./routes/assetsRouter");
const cssRouter = require("./routes/cssRouter");
const jsRouter = require("./routes/jsRouter");


// middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) { return next(); }
  res.redirect('http://localhost:3000/login');
}

/*****************************
 * Passport Routes
 *****************************/

// Home Page is the Login Page
app.get("/", (req, res) => {
  console.log("I made it here!");
  res.sendFile(path.join(__dirname, "../client/html/login.html"));
})

app.get("/login", (req, res) => {
  console.log("Here is the login page!");
  res.redirect("/");
})

// After user clicks on login, we send them to a /auth/openid page
app.get("/auth/openid", passport.authenticate('azuread-openidconnect', {failureRedirect: '/login-error'}), 
  (req, res) => {
    console.log("User is authenticated! We received a return from AzureAD");
    res.redirect('/message');
  }
);

// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/login-error'; otherwise, it redirects them to the /message.
app.post("/auth/openid/return", passport.authenticate('azuread-openidconnect', {failureRedirect: '/login-error'}), 
  (req, res) => {
    console.log("User is authenticated! We received a return from AzureAD AGAIN!");
    res.redirect('/message');
  }
);

// If user fails authentication, we send them back to login-error
app.get("/login-error", (req, res) => {
  console.log("User isn't authenticated!");
  res.send("<p>You are NOT authenticated!<p>"); // link them back to login page
})

// 'logout' route, logout from passport, and destroy the session with AAD.
app.get('/logout', function(req, res) {
  // logout removes req.user property and clears any sessions stored in our database
  req.logout(function(err) {
    if (err) { console.error("Error logging out!", err); }
  });
  // send user back to login page
  const postLogoutRedirectURL = encodeURIComponent('http://localhost:3000/login');
  res.redirect(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/logout?post_logout_redirect_uri=${postLogoutRedirectURL}`);
});

// whenever app wants to use assets,css,js, it'll go through the router to ensure that they load in properly
app.use("/assets", assetsRouter);
app.use("/css", cssRouter);
app.use("/js", jsRouter);

/*****************************
 * Main Page Routes
 *****************************/
// All are only accessible if ensureAuthenticated is true (user is authenticated)
app.get("/message", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../../index.html"));
});
app.get("/spotlight", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/spotlight.html"));
});
app.get("/about", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/about.html"));
});

// For ViteExpress
ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);