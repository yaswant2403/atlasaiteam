// Initializing dependencies
const express = require("express");
const ViteExpress = require("vite-express");
const cors = require("cors");
const path = require("path");

// Dependencies for Authentication
require('dotenv').config();
const expressSession = require("express-session");
const passport = require("passport");
const OIDCStrategy = require("passport-azure-ad").OIDCStrategy;


// Creating Express App
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

// Set up mySQL Database and connect database to express session
const mysql = require("mysql2");
const MySQLStore = require("express-mysql-session")(expressSession);
const options = {
  host: 'localhost',
  port: '3306',
  user: 'user',
  password: 'Password123%',
  database: 'test1',
  createDatabaseTable: 'false',
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'custom_session_id',
      expires: 'custom_expires_column_name',
      data: ''
    }
  }
};
const connection = mysql.createConnection(options);
connection.connect((err) => {
  if (!err) {
    console.log("Connected!");
    connection.query('CREATE TABLE testing (users VARCHAR(255), id VARCHAR(255))', function(err, results) {
      if (err) {
        console.log(err);
      } else {
        console.log(results);
      }
    })
  } else {
    console.log(err);
    console.log("Connection failed");
  }
})

// root@localhost at port 3306

// Grabbing routers to load assets, css, js
const assetsRouter = require("./routes/assetsRouter");
const cssRouter = require("./routes/cssRouter");
const jsRouter = require("./routes/jsRouter");
// whenever app wants to use assets,css,js, it'll go through the router to ensure that they load in properly
app.use("/assets", assetsRouter);
app.use("/css", cssRouter);
app.use("/js", jsRouter);
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

// Home Page is the Login Page
app.get("/", (req, res) => {
  console.log("I made it here!");
  res.sendFile(path.join(__dirname, "../client/html/login.html"));
})

// When user clicks on login, we send them to a /auth/openid page
app.get("/auth/openid", (req, res) => {
  res.send("<p>You are authenticated!<p>");
})

// When user clicks on logout, we send them to a /auth/openid page
app.get("/logout", (req, res) => {
  res.send("<p>You are authenticated!<p>");
})
// app.get("/login", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/html/login.html"));
// })
app.get("/message", (req, res) => {
  res.sendFile(path.join(__dirname, "../../index.html"));
});
app.get("/spotlight", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/spotlight.html"));
});
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/about.html"));
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
