/**
 * Setting up BackEnd Server with OpenAPI implementation
 */

// Importing express dependency similar to import package-name in python
const express = require('express');
require('dotenv').config()

// Allows for Communication between backend and frontend
const cors = require('cors') // Allows you to make requests from one website to another website in browser
const {Configuration, OpenAIApi } = require("openai")

// Creating an config object through a constructor containing a property called apiKey
const configuration = new Configuration({
    apiKey: process.env.OPEN_API_KEY,
});

// Creating an open api object using the configuration
const openai = new OpenAIApi(configuration)

const app = express();
const port = 5000;

app.use(express.json()); // Pass JSON from frontend to backend
app.use(cors());
// Telling Express app to use current directory as our main folder
// app.use(express.static(__dirname));

// Receive data from frontend
// two parameters (path, callback functions)
// we only have call back function (res.send) and it's a lambda function
app.get('/', function (req, res) {
    res.status(200).send({
        message: 'Hello World!',
    }) 
});

/**
 * Sending Response back to frontend through post function
 * Using openai's createChatCompletion Method to create an openAI completion
 * We need to pass in some inputs such as model and messages
 * 1) model: the type of language model we want to use (gpt-3.5-turbo)
 * 2) messages:
 *    system message: tells the model to act like a certain kind of assistant. So, from now on, it 
 *    will act as an assitant that writes short greeting cards.
 *    user message: is the person interacting or sending the prompt on our website 
 */
app.post('/', async(req, res) => {
    try {
        const prompt = req.body.prompt; // we will send backend an object with a body with prompt variable
        console.log("How the prompt is defined in backend: " + prompt);
        const messages = [
            {"role": "system", "content": "You will be writing short greeting cards based on user needs."},
            {"role": "user", "content": prompt}
        ];
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.1,
        });
        console.log("This is from the backend: "+ response.data.choices[0].message.content);
        // sending response back to frontend
        res.status(200).send({
            // bot: "Connection successful!"
            bot: response.data.choices[0].message.content
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({error});
    }
})

// Listens for incoming requests (listen also has a callback function)
app.listen(port, () => {
    console.log(`Now listening on http://localhost:${port}`);
});


