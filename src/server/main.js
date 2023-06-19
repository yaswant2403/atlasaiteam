/******************************************************************************
 * Module dependencies.
 *****************************************************************************/
const express = require("express");
const ViteExpress = require("vite-express"); // to be able to run vite frontend using Express as backend
const cors = require("cors");
const path = require("path");
require('dotenv').config();
const expressSession = require("express-session"); // necessary to store the session of our user
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
});

// Creating an open api object using the configuration
const openai = new OpenAIApi(configuration)

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

let count = 0;
// middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  count++;
  console.log("In the ensureAuth function, request is ", req.isAuthenticated(), " authenticated ", count, " times! \n");
  if(req.isAuthenticated()) { 
    console.log("In the ensureAuth function, the request headers are: \n", req.headers);
    return next(); 
  }
  return res.redirect('/login');
}

/*****************************
 * Authentication Routes
 *****************************/

// Home Page is the Login Page
app.get("/", ensureAuthenticated, (req, res) => {
  console.log("User made it to the main page!");
  res.redirect('/spotlight');
})

app.get("/login", (req, res) => {
  console.log("User has made it to the login page!");
  // console.log("In the /login function, request is ", req.isAuthenticated(), " authenticated!\n");
  // this is used to redirect the user back to the homepage if they try to access the login page after being authenticated
  // otherwise, it works as usual, directing them to the login page.
  if (req.isAuthenticated()) { 
    // console.log("In the login function, the request headers are: \n", req.headers); 
    return res.redirect('/'); 
  }
  return res.sendFile(path.join(__dirname, "../client/html/login.html"));
})

// After user clicks on login, we send them to a /auth/openid page
app.get("/auth/openid", passport.authenticate('azuread-openidconnect', {failureRedirect: '/login-error'}), 
  (req, res) => {
    console.log("User is authenticated! We received a return from AzureAD");
    res.redirect('/spotlight');
  }
);

// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/login-error'; otherwise, it redirects them to the /message.
app.post("/auth/openid/return", passport.authenticate('azuread-openidconnect', {failureRedirect: '/login-error'}), 
  (req, res) => {
    console.log("User is authenticated! We received a return from AzureAD AGAIN!");
    res.redirect('/spotlight');
  }
);

// app.get("/auth/check-auth", ensureAuthenticated, (req, res) => {
//   res.json({isAuthenticated : true});
// })


// If user fails authentication, we send them back to login-error
app.get("/login-error", (req, res) => {
  console.log("User isn't authenticated!");
  res.send("<p>You are NOT authenticated!<p>"); // link them back to login page
})

// Only added because for some reason if a user does /logout, they're able to access generate message.
app.get('/logout', function(req, res) {
  res.redirect('/login');
})

// 'logout' route, logout from passport, and destroy the session with AAD.
app.post('/logout', function(req, res) {
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
 * Main Page GET Routes
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

/*****************************
 * Form Submission POST Routes
 *****************************/

// Example Paragraphs to be used for call to ChatGPT
const exParagraph1 = "Bob is a senior studying English and Creative Writing. He heard about the ATLAS Internship Program through the Humanities Professional Resource Center on campus and decided to join to gain some professional experience before he graduates. Mary is a digital marketing intern for Earnest Earth and he handles the social media and market research in order to find ways to organically grow the company’s social media accounts. At the beginning of his internship he was handling social media posts and researching possible ways to build up the company’s social media profiles. He then transitioned into developing an instructional website that will improve the company’s Search Engine Optimization. He has learned how to properly research keywords in a specific niche using a keyword research tool. As he moves forward with his future plans in marketing, he will take his newly learned technology skills along with better time management skills, consistency, good working habits and overall increased self-awareness. He believes that his internship has allowed him to grow as a professional and become ready for responsibilities that will come with a full-time position.";
const exParagraph2 = "Mary is a junior studying English and Creative Writing. She heard about the ATLAS Internship Program through the English Department and she decided to join because she wanted to have an immersive experience in working with technology. Mary is a Social Media Specialist intern for the Humanities Professional Resource Center. Her responsibilities include, the upkeep of HPRC’s social media accounts, and marketing their events to the students at the University of Illinois. She designs at least 2 graphics a week and posts them on Instagram and Facebook. She also creates presentation slides that are posted on the TV displays in Lincoln Hall. She is currently searching for more professionals to feature in the Professional Pitstops and is aiming to post at least two videos this school year. Her future plans include being an editor of a publishing company but she is also considering social media because she has enjoyed her internship and thinks it would be a cool career to pursue. She will take her new skills and experiences in social media marketing, communication, resume building skills, how to work in a mostly remote position, networking, professional emails, graphic design, and editing with her as she works towards her future plans.";
const exParagraph3 = "Sue is a senior studying English and Creative Writing. She heard about the ATLAS Internship Program her freshman year and then her advisor recommended it her junior year. Mary decided to join the program to have the opportunity to get professional work experience. She knew ATLAS has a lot of established connections at the university so she decided to sign up. Mary is a Team Leader for the Business Process Improvement Team. Some of her responsibilities include, helping to build forms for clients based on specifications, she is on-call for the FormBuilder Help Desk to assist any clients having issues with their forms, and she is the first line of communication between their new clients and the team. She has currently finished working with a Help Desk client from the Less Commonly Taught Language Program. They were having issues with the text merge fields in the confirmation/reviewal phases, as well as the emails being sent to the form submitter and admins. She met with them to help make sure their text merge fields were all working properly and to discuss their concerns with routing triggers. Mary's future career plan has recently changed, she was previously planning on going to law school, but now she is preparing to apply for admissions to English graduate/PhD programs for Fall 2023. After she gets her graduate degree, she hopes to teach English Literature at any level. Mary will bring newly learned skills and experience, including the ability to effectively communicate very technical information, to the rest of her professional life.";
const exParagraph4 = "Jenny Lee is a Senior double-majoring in Advertising and Economics with a business minor! Jenny is a Social Media and Marketing Intern for Earnest Earth! She is responsible for posting and analyzing the company's social media platforms and search engines using various tactics using programs such as SEMrush. After analyzing target consumers' interests and behaviors, she develops marketing projects. This involves improving a website by creating a blog post on relevant topics after research.  Jenny is currently working on SEO Strategy. In order to do so, she is researching and analyzing keywords and popular search engines that are relevant to the company using various platforms or tools such as SEMrush, UberSuggest, and etc. Jenny hopes to pursue a career in marketing, public relations, finance, or media! She hopes to develop her career in the field of business involving art or media! Through her ATLAS internship, Jenny has realized the importance of time-management and communication skills! Some fun facts about Jenny are that she loves music and singing and bought karaoke microphones to sing with her roommates!";
const exParagraph5 = "Kayln Nowlan is a senior majoring in English. She learned about ATLAS through the Humanities Professional Resource Center while looking for an internship in communications. She works for the Office of Provost as a Media Content Producer. Kayln helps produce a series of faculty development-themed podcasts called “Dear Alma” a series in which Kalyn and her partner interview senior faculty members on the UIUC campus, drafting interview questions that are intended to support up-and-coming faculty as they grow and develop their careers. Then they culminate the audio into the podcast episodes, creating thumbnails that are consistent with the Office of the Provost brand and marketing our podcast series on various social media platforms. Currently, Kayln is working on releasing and editing more series of “Dear Alma.” She is planning to do a master's in Library and Information Science here at UIUC with hopes to pursue academic librarianship or a career in Information Science. Through ATLAS, Kayln learned about professionalism in the workplace and gained valuable communication experience. A fun fact about Kayln is that she studied abroad in the UK in Spring 2019!";


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
app.post('/main', ensureAuthenticated, async(req, res) => {
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

/**
* Route Handler for handling 'Generate Spotlight' submissions from client side
* Gets called when the JS code on the client side fetches /spotlight
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
app.post('/spotlight', ensureAuthenticated, async(req,res) => {
  const violation= "Your inputs have been classified as content that violates OpenAI's usage policies. Please enter\
  new inputs to generate a new message or image.";
  const limiting = "ChatGPT may be limiting your usage. Please wait 30 seconds and try again.\
  If you still receive this error, contact the staff on the About Section!";
  const system_message = "You are are an AI Large Language Model that is an expert at writing paragraph summaries for students in the ATLAS Internship program.\
  Reference: You are helping the ATLAS internship program at UIUC to write paragraph summaries for all the interns in the program.\
  Objective: These paragraphs for each intern are called \"spotlights\" and your goal is to write the best possible and professional spotlight for each intern to help their future job placement.\
  Margins: Ensure the spotlight is professional and consists of a single paragraph with less than 400 words.\
  Perspective: If you are capable, generate more than one spotlight for an intern.\
  Throughputs: Ensure that the output is grammatically correct, professional and concise.";
  console.log('\nHere is the req headers inside /spotlight: ', req.headers);
  try {
      // Receiving the request
      let message_prompt = req.body.message_prompt; // Grabbing the message_prompt from the request body
      message_prompt = "Here are five paragraphs about interns who interned with the ATLAS Internship Program:\nParagraph 1:\n" 
      + exParagraph1 + "\nParagraph 2:\n" + exParagraph2 + "\nParagraph 3:\n" + exParagraph3 + "\nParagraph 4:\n" + exParagraph4 
      + "\nParagraph 5:\n" + exParagraph5 + "\n\n" + message_prompt;
      console.log("How the prompt is defined in backend:\n" + message_prompt + "\n");
      const p_messages = [ // array object of dictionary
          {"role": "system", "content": system_message},
          {"role": "user", "content": message_prompt}
      ];
      // moderation for given user message
      const message_flag = openai.createModeration({
          input: message_prompt
      });
      if ((await message_flag).data.results[0].flagged === true) {
          // Sending violation message back to frontend
          return res.status(200).send({
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
          return res.status(200).send({
              bot: response.data.choices[0].message.content,
          })
      }
  } catch (error) { // error with response
      console.log("It reaches here!")
      console.log("This is error: " + error)
      return res.status(500).send({
          bot: limiting
      })
  }
})


// For ViteExpress
ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);