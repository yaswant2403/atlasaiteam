require('dotenv').config();

// Initializing dependencies
const express = require("express");
const ViteExpress = require("vite-express");
const cors = require('cors');
const path = require("path");

var session = require("express-session");
var createError = require("http-errors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/indexRouter");
var userRouter = require("./routes/users");
var authRouter = require("./routes/auth");
// Config object to be passed to MSAL instance on creation

// const authMiddleware = require("./authorization")

// Grabbing routers to load assets, css, js
const assetsRouter = require("./routes/assetsRouter");
const cssRouter = require("./routes/cssRouter");
const jsRouter = require("./routes/jsRouter");

const app = express(); // creating app
app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
  }
}));
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use("/assets", assetsRouter);
app.use("/css", cssRouter);
app.use("/js", jsRouter);

app.use(function (req, res, next) {
  next(createError(404));
})

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render error page
  res.status(err.status || 500);
  res.status(200).send({
    error: 'Hello Error!',
  }); 
})

// app.use(ViteExpress.static());
// app.use(yourAuthMiddleware);
// Get requests for all the main pages
app.get("/message", (req, res) => {
  res.sendFile(path.join(__dirname, "../../index.html"));
});
app.get("/spotlight", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/spotlight.html"));
});
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/about.html"));
});

// catch 404 and forward to error handler


// whenever app wants to use assets,css,js, it'll go to these routers to ensure that they load in properly

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
