/**
 * Web Server Implementation
 */

// Importing the express dependency to setup a web server
// require equivalent of import <package> in python
const express = require('express');

const app = express();
const port = 5000;

// Telling Express app to use current directory as our main folder
app.use(express.static(__dirname));

// two parameters (path, callback functions)
// we only have call back function (res.sendFile) and it's a lambda function
app.get('/', function (req, res) {
    // send a file from same folder that server file is in
    // in our case, we send index.html from the root folder that index.js is also in
    res.sendFile('index.html'); 
});

// Listens for incoming requests (listen also has a callback function)
app.listen(port, () => {
    console.log(`Now listening on part ${port}`);
});