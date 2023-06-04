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

// Example Paragraphs to be used for call to ChatGPT
const exParagraph1 = "Bob is a senior studying English and Creative Writing. He heard about the ATLAS Internship Program through the Humanities Professional Resource Center on campus and decided to join to gain some professional experience before he graduates. Mary is a digital marketing intern for Earnest Earth and he handles the social media and market research in order to find ways to organically grow the company’s social media accounts. At the beginning of his internship he was handling social media posts and researching possible ways to build up the company’s social media profiles. He then transitioned into developing an instructional website that will improve the company’s Search Engine Optimization. He has learned how to properly research keywords in a specific niche using a keyword research tool. As he moves forward with his future plans in marketing, he will take his newly learned technology skills along with better time management skills, consistency, good working habits and overall increased self-awareness. He believes that his internship has allowed him to grow as a professional and become ready for responsibilities that will come with a full-time position.";
const exParagraph2 = "Mary is a junior studying English and Creative Writing. She heard about the ATLAS Internship Program through the English Department and she decided to join because she wanted to have an immersive experience in working with technology. Mary is a Social Media Specialist intern for the Humanities Professional Resource Center. Her responsibilities include, the upkeep of HPRC’s social media accounts, and marketing their events to the students at the University of Illinois. She designs at least 2 graphics a week and posts them on Instagram and Facebook. She also creates presentation slides that are posted on the TV displays in Lincoln Hall. She is currently searching for more professionals to feature in the Professional Pitstops and is aiming to post at least two videos this school year. Her future plans include being an editor of a publishing company but she is also considering social media because she has enjoyed her internship and thinks it would be a cool career to pursue. She will take her new skills and experiences in social media marketing, communication, resume building skills, how to work in a mostly remote position, networking, professional emails, graphic design, and editing with her as she works towards her future plans.";
const exParagraph3 = "Sue is a senior studying English and Creative Writing. She heard about the ATLAS Internship Program her freshman year and then her advisor recommended it her junior year. Mary decided to join the program to have the opportunity to get professional work experience. She knew ATLAS has a lot of established connections at the university so she decided to sign up. Mary is a Team Leader for the Business Process Improvement Team. Some of her responsibilities include, helping to build forms for clients based on specifications, she is on-call for the FormBuilder Help Desk to assist any clients having issues with their forms, and she is the first line of communication between their new clients and the team. She has currently finished working with a Help Desk client from the Less Commonly Taught Language Program. They were having issues with the text merge fields in the confirmation/reviewal phases, as well as the emails being sent to the form submitter and admins. She met with them to help make sure their text merge fields were all working properly and to discuss their concerns with routing triggers. Mary's future career plan has recently changed, she was previously planning on going to law school, but now she is preparing to apply for admissions to English graduate/PhD programs for Fall 2023. After she gets her graduate degree, she hopes to teach English Literature at any level. Mary will bring newly learned skills and experience, including the ability to effectively communicate very technical information, to the rest of her professional life.";
const exParagraph4 = "Jenny Lee is a Senior double-majoring in Advertising and Economics with a business minor! Jenny is a Social Media and Marketing Intern for Earnest Earth! She is responsible for posting and analyzing the company's social media platforms and search engines using various tactics using programs such as SEMrush. After analyzing target consumers' interests and behaviors, she develops marketing projects. This involves improving a website by creating a blog post on relevant topics after research.  Jenny is currently working on SEO Strategy. In order to do so, she is researching and analyzing keywords and popular search engines that are relevant to the company using various platforms or tools such as SEMrush, UberSuggest, and etc. Jenny hopes to pursue a career in marketing, public relations, finance, or media! She hopes to develop her career in the field of business involving art or media! Through her ATLAS internship, Jenny has realized the importance of time-management and communication skills! Some fun facts about Jenny are that she loves music and singing and bought karaoke microphones to sing with her roommates!";
const exParagraph5 = "Kayln Nowlan is a senior majoring in English. She learned about ATLAS through the Humanities Professional Resource Center while looking for an internship in communications. She works for the Office of Provost as a Media Content Producer. Kayln helps produce a series of faculty development-themed podcasts called “Dear Alma” a series in which Kalyn and her partner interview senior faculty members on the UIUC campus, drafting interview questions that are intended to support up-and-coming faculty as they grow and develop their careers. Then they culminate the audio into the podcast episodes, creating thumbnails that are consistent with the Office of the Provost brand and marketing our podcast series on various social media platforms. Currently, Kayln is working on releasing and editing more series of “Dear Alma.” She is planning to do a master's in Library and Information Science here at UIUC with hopes to pursue academic librarianship or a career in Information Science. Through ATLAS, Kayln learned about professionalism in the workplace and gained valuable communication experience. A fun fact about Kayln is that she studied abroad in the UK in Spring 2019!";

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
    const system_message = "You are are an AI Large Language Model that is an expert at writing paragraph summaries for students in the ATLAS Internship program.\
    Reference: You are helping the ATLAS internship program at UIUC to write paragraph summaries for all the interns in the program.\
    Objective: These paragraphs for each intern are called \"spotlights\" and your goal is to write the best possible and professional spotlight for each intern to help their future job placement.\
    Margins: Ensure the spotlight is professional and consists of a single paragraph with less than 400 words.\
    Perspective: If you are capable, generate more than one spotlight for an intern.\
    Throughputs: Ensure that the output is grammatically correct, professional and concise.";
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


