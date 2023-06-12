// Initializing dependencies
const express = require("express");
const ViteExpress = require("vite-express");
const cors = require('cors');
const path = require("path");
// Grabbing routers to load assets, css, js
const assetsRouter = require("./routes/assetsRouter");
const cssRouter = require("./routes/cssRouter");
const jsRouter = require("./routes/jsRouter");

const app = express(); // creating app
app.use(express.json());
app.use(cors());

// whenever app wants to use assets,css,js, it'll go through the router to ensure that they load in properly
app.use("/assets", assetsRouter);
app.use("/css", cssRouter);
app.use("/js", jsRouter);

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

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
