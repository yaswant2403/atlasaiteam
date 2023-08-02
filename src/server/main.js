/******************************************************************************
 * Module dependencies.
 *****************************************************************************/
const express = require("express");
const ViteExpress = require("vite-express"); // to be able to run vite frontend using Express as backend
const cors = require("cors");
const path = require("path");
const ejs = require('ejs');
require('dotenv').config();
const {Configuration, OpenAIApi } = require("openai") // tuple object - necessary to send API requests to generate paragraphs

// Creating Express App
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

/******************************************************************************
 * OpenAI Configuration Settings
 *****************************************************************************/
// Creating an config object through a constructor containing a property called apiKey
const configuration = new Configuration({
  apiKey: process.env.OPEN_API_KEY, // from .env file
  organization: process.env.ORGANIZATION_ID
});

// Creating an open api object using the configuration
const openai = new OpenAIApi(configuration)


// Grabbing routers to load assets, css, js
const assetsRouter = require("./routes/assetsRouter");
const cssRouter = require("./routes/cssRouter");
const jsRouter = require("./routes/jsRouter");


/*****************************
 * Main GET Routes
 *****************************/
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client/html/'));
// Home Page is the Spotlight Page if Authenticated
app.get("/", (req, res) => {
  console.log("User made it to the main page!");
  res.redirect('/main');
})

// whenever app wants to use assets,css,js, it'll go through the router to ensure that they load in properly
app.use("/assets", assetsRouter);
app.use("/css", cssRouter);
app.use("/js", jsRouter);

// Get Routes
app.get("/message", (req, res) => {
  res.sendFile(path.join(__dirname, "../../index.html"));
});
app.get("/about", (req, res) => {
  res.render("about");
});


/*****************************
 * Form Submission POST Routes
 *****************************/

/**
 * Route Handler for handling 'Generate Message' submissions from client side
 * Gets called when our JS code on the client side fetches /main
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
  // console.log(req.headers.origin)
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
          return res.status(200).send({
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
              return res.status(200).send({
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
          return res.status(500).send({
              bot: response.data.choices[0].message.content,
              image_bot: violation
          })    
      } else { // if API key has expired or user is spamming submissions
          // console.log("It reaches here!")
          return res.status(500).send({
              bot: "ChatGPT may be limiting your usage. Please wait 30 seconds and try again.\
               If you still receive this error, contact the staff on the About Section!"
          })
      }
  }
})


// For ViteExpress
ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);