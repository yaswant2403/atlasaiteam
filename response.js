/**
 * Open API Implementation to generate messages
 */
function openAIResponse() {
    // Initialize configuration object and OpenAIApi object
    const {Configuration, OpenAIApi } = require("openai")
    require('dotenv').config()


    // Creating an object through a constructor containing a property called apiKey
    const configuration = new Configuration({
        apiKey: process.env.OPEN_API_KEY,
    });
    // Creating an open api object using the configuration
    const openai = new OpenAIApi(configuration)

    /**
     * Using openai's createChatCompletion Method to create an openAI completion
     * We need to pass in some inputs such as model and messages
     * 1) model: the type of language model we want to use (gpt-3.5-turbo)
     * 2) messages:
     *    system message tells the model to act like a certain kind of assistant. So, from now on, it 
     * will act as an assitant that writes short greeting cards.
     *    user message is the person interacting or sending the prompt on our website
     * 
     * We finally get the response we want and display it in the console
     */
    async function generateMessage() {
        // const prompt = generatePrompt()
        const messages = [
            {"role": "system", "content": "You will be writing short greeting cards based on user needs."},
            {"role": "user", "content": "How are you writing this information?"}
        ]
        const response = await openai.createChatresponse({
            messages, model: "gpt-3.5-turbo"
        });
        console.log(response.data.choices[0].message);
    }
    /**
     * Generates a prompt using the user input
     * @returns prompt based on user input
     */
    function generatePrompt() {
        const sender = document.querySelector('#from');
        const receiver = document.querySelector('#to');
        const subject = document.querySelector('#subject');
        const prompt = "Generate a greeting card to " + receiver.value + " from " + sender.value + " with the subject of \"" + subject.value + "\" that's a maximum of three sentences."
        console.log(prompt)
        return prompt;
    }
    generateMessage();
}
// const {Configuration, OpenAIApi } = require("openai")
// require('dotenv').config()


// // Creating an object through a constructor containing a property called apiKey
// const configuration = new Configuration({
//     apiKey: process.env.OPEN_API_KEY,
// });
// // Creating an open api object using the configuration
// const openai = new OpenAIApi(configuration)

// /**
//  * Using openai's createChatCompletion Method to create an openAI completion
//  * We need to pass in some inputs such as model and messages
//  * 1) model: the type of language model we want to use (gpt-3.5-turbo)
//  * 2) messages:
//  *    system message tells the model to act like a certain kind of assistant. So, from now on, it 
//  * will act as an assitant that writes short greeting cards.
//  *    user message is the person interacting or sending the prompt on our website
//  * 
//  * We finally get the response we want and display it in the console
//  */
// async function generateMessage() {
//     // const prompt = generatePrompt()
//     const messages = [
//         {"role": "system", "content": "You will be writing short greeting cards based on user needs."},
//         {"role": "user", "content": "How are you writing this information?"}
//     ]
//     const response = await openai.createChatresponse({
//         messages, model: "gpt-3.5-turbo"
//     });
//     console.log(response.data.choices[0].message);
// }
// generateMessage();
// /**
//  * Generates a prompt using the user input
//  * @returns prompt based on user input
//  */
// function generatePrompt() {
//   const sender = document.querySelector('#from');
//   const receiver = document.querySelector('#to');
//   const subject = document.querySelector('#subject');
//   const prompt = "Generate a greeting card to " + receiver.value + " from " + sender.value + " with the subject of \"" + subject.value + "\" that's a maximum of three sentences."
//   console.log(prompt)
//   return prompt;
// }
//   const url = `https://api.openai.com/v1/engines/code-davinci-002/completions?prompt=${encodeURIComponent(prompt)}&max_tokens=100`;
//   fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Bearer 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'
//     }
//   })
//   .then(response => response.json())
//   .then(data => {
//     const message = data.choices[0].text;
//     console.log(message)
//     document.querySelector('responseTitle').innerHTML = "Here is your card:";
//     document.querySelector('response').innerHTML = message;
//   })
//   .catch(error => console.error(error));
//   localStorage.setItem('greetingCard', message)
// }


// function displayMessage() {
//   // get the input values
//   const from = document.getElementById('from').value;
//   const to = document.getElementById('to').value;
//   const occasion = document.getElementById('occasion').value;

//   // generate the message
//   const message = generateGreetingCard(from, to, occasion);

//   // store the message in localStorage
//   localStorage.setItem('greetingCard', message);
// }