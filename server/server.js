/**
 * Setting up BackEnd Server with OpenAPI implementation
 */

/**
 * Importing Dependencies to enable communicaton between backend and frontend
 * const var-name = require('package-name')
 * Ensure that the package is locally installed by doing npm i package-name
 * Similar to import package-name in python
 */
const express = require('express');
const cors = require('cors') // Able to make requests from one website to another website in browser
const {Configuration, OpenAIApi } = require("openai") // openai package is a tuple object
require('dotenv').config()


// Creating an config object through a constructor containing a property called apiKey
const configuration = new Configuration({
    apiKey: process.env.OPEN_API_KEY, // from .env file
});

// Creating an open api object using the configuration
const openai = new OpenAIApi(configuration)

const app = express();
const port = 5000; // arbitrary can be any port you'd like

app.use(express.json()); // Pass JSON from frontend to backend
app.use(cors());

/**
 * IGNORE (Used for past test cases, but no longer required)
 */
// Telling Express app to use current directory as our main folder
// app.use(express.static(__dirname));

/**
 * Route for main page (Create Message)
 * Sends generic JSON file to http://localhost:5000/main or https://openapi.atlasaiteam.web.illinois.edu/main
 * @param {path, callback function()} defined as current directory and res.send (a lambda function)
 */
app.get('/main', function (req, res) {
    res.status(200).send({
        message: 'Hello Message Generator!',
    }) 
});

/**
 * Route for spotlight page (Create Spotlight)
 * Sends generic JSON file to http://localhost:5000/spotlight or https://openapi.atlasaiteam.web.illinois.edu/spotlight
 * @param {path, callback function()} defined as current directory and res.send (a lambda function)
 */
app.get('/spotlight', function (req, res) {
    res.status(200).send({
        message: 'Hello Spotlight!',
    }) 
});

/**
 * Route Handler for handling main fetches from frontend
 * @docs https://platform.openai.com/docs/api-reference/chat
 * @param {path, callback function()} defined as current directory and a custom async function 
 * defined as @param {Request, Response} where req is request and res is response all in a try catch block
 * 
 * Using OpenAI's createChatCompletion and createImage functions with the @param {model, messages},
 * we are able to get a response back from the API. One is a paragraph and another is the URL to the image.
 * The params are defined as so:
 * 1) model: the type of language model we want to use (gpt-3.5-turbo)
 * 2) messages: {role, content}
 *      roles used: "system" which tells the model to act like a certain type of assistant. "user" which is the author of the prompt 
 *      content: the actual prompt you'd ask ChatGPT
 * 
 * Additionally, we also use createModeration (free of cost) to moderate the message and image prompts. If any prompt is flagged,
 * we immediately send a JSON response with the @string violation as the response. However, since DALL-E is more sensitive than ChatGPT,
 * we can sometimes end up with a valid message response but not a valid image response. In that case, we send the message but send
 * @string violation as the image. If createModeration isn't flagged, but both calls to the API result in errors, we send 
 * a JSON response with the @string violation.
 * 
 * @returns res.send(response JSON)
 */
app.post('/main', async(req, res) => {
    console.log(req.headers.origin)
    // Our violation message
    const violation= "Your inputs have been classified as content that violates OpenAI's usage policies. Please enter\
    new inputs to generate a new message or image.";
    try {
        // Receiving the request
        const message_prompt = req.body.message_prompt; // Grabbing the message_prompt from the request body
        const image_prompt = req.body.image_prompt; // Grabbing the image_prompt from the request body
        // console.log("How the prompt is defined in backend: " + message_prompt + "\n " + image_prompt);
        const p_messages = [ // array object of dictionary
            {"role": "system", "content": "You will be writing messages based on user needs."},
            {"role": "user", "content": message_prompt}
        ];
        // moderation for given user message
        const message_flag = openai.createModeration({
            input: message_prompt
        });
        if ((await message_flag).data.results[0].flagged === true) {
            // Sending prompt and image violation message back to frontend
            // POST Method ends with res.send
            res.status(200).send({
                bot: violation,
                image_bot: violation
            })
        } else { // creating message with ChatGPT because not flagged as harmful content
            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: p_messages,
                temperature: 0.1,
            });
            // console.log("This is the message from the backend: "+ response.data.choices[0].message.content);
            // Asking ChatGPT for a Dall-E Prompt
            const i_messages = [
                {"role": "system", "content": "You will be generating good DALL-E prompts that will generate images that correspond with the user's prompts."},
                {"role": "user", "content": image_prompt}
            ];
            const dallE_response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: i_messages,
                temperature: 0.1,
            });
            // Grabs the DALL-E prompt generated by ChatGPT
            const dallE_prompt = dallE_response.data.choices[0].message.content;
            // console.log(dallE_prompt);

            // moderation for DALL-E Prompt
            const image_flag = openai.createModeration({
                input: dallE_prompt
            });
            if ((await image_flag).data.results[0].flagged === true) { //if image prompt is flagged, return message but violation for image
                res.status(200).send({
                    bot: response.data.choices[0].message.content,
                    image_bot: violation
                })                   
            } else {
                // if image prompt valide, send the DALL-E Prompt to DALL-E
                const image = await openai.createImage({
                    prompt: dallE_prompt,
                    n: 1,
                    size: "256x256"
                });
                // prints the url of the image
                // console.log(image.data.data[0].url);
                // sending both the message and image URL to frontend as JSON response
                res.status(200).send({
                    bot: response.data.choices[0].message.content,
                    image_bot: image.data.data[0].url
                })  
            }
        }
    } catch (error) { // error with response
        // console.log("This is error: " + error)
        // if the url includes generations, then this is a DALL-E error. 
        if (error.config.url.includes("generations")) {
            // There was nothing wrong with the message response. So, we generate ONLY the message this time.
            const message_prompt = req.body.message_prompt;
            const p_messages = [
                {"role": "system", "content": "You will be writing messages based on user needs."},
                {"role": "user", "content": message_prompt}
            ];
            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: p_messages,
                temperature: 0.1,
            });
            res.status(500).send({
                bot: response.data.choices[0].message.content,
                image_bot: violation
            })    
        } else { // if API key has expired or user is spamming submissions
            // console.log("It reaches here!")
            res.status(500).send({
                bot: "ChatGPT may be limiting your usage. Please wait 30 seconds and try again.\
                 If you still receive this error, contact the staff on the About Section!"
            })
        }
    }
})

/**
 * Route Handler for handling spotlight fetches from frontend
 * Similar functionality as app.post('/main')
 * @docs https://platform.openai.com/docs/api-reference/chat
 * @param {path, callback function()} defined as current directory and a custom async function 
 * defined as @param {Request, Response} where req is request and res is response all in a try catch block
 * 
 * Using OpenAI's createChatCompletion function with the @param {model, messages}, we are able to get a response back from the API.
 * The params are defined as so:
 * 1) model: the type of language model we want to use (gpt-3.5-turbo)
 * 2) messages: {role, content}
 *      roles used: "system" which tells the model to act like a certain type of assistant. "user" which is the author of the prompt 
 *      content: the actual prompt you'd ask ChatGPT
 * 
 * Additionally, we also use createModeration (free of cost) to moderate the message prompt. If any prompt is flagged,
 * we immediately send a JSON response with the @string violation as the response. 
 * If createModeration isn't flagged, but a call to the API result in an error, 
 * we catch and send a JSON response with the @string limiting as the response. This is usually due to user spamming or
 * expired API Key
 * 
 * POST Method ends with res.send
 * @returns res.send(response JSON)
 */
app.post('/spotlight', async(req,res) => {
    const violation= "Your inputs have been classified as content that violates OpenAI's usage policies. Please enter\
    new inputs to generate a new message or image.";
    const limiting = "ChatGPT may be limiting your usage. Please wait 30 seconds and try again.\
    If you still receive this error, contact the staff on the About Section!";
    try {
        // Receiving the request
        const message_prompt = req.body.message_prompt; // Grabbing the message_prompt from the request body
        console.log("How the prompt is defined in backend: " + message_prompt + "\n");
        const p_messages = [ // array object of dictionary
            {"role": "system", "content": "You will be writing messages based on user needs."},
            {"role": "user", "content": message_prompt}
        ];
        // moderation for given user message
        const message_flag = openai.createModeration({
            input: message_prompt
        });
        if ((await message_flag).data.results[0].flagged === true) {
            // Sending violation message back to frontend
            res.status(200).send({
                bot: violation,
            })
        } else { // creating message with ChatGPT because not flagged as harmful content
            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: p_messages,
                temperature: 0.1,
            });
            // console.log("This is the message from the backend: "+ response.data.choices[0].message.content);
            // sending the message to frontend as JSON response
            res.status(200).send({
                bot: response.data.choices[0].message.content,
            })
        }
    } catch (error) { // error with response
        console.log("It reaches here!")
        console.log("This is error: " + error)
        res.status(500).send({
            bot: limiting
        })
    }
})

/**
 * Listens for incoming requests from frontend
 * @param {number, callback function()} defined as port and a lambda function that simply prints 
 * current server url
 */
// Listens for incoming requests (listen also has a callback function)
app.listen(port, () => {
    console.log(`Now listening on http://localhost:${port}`);
});


