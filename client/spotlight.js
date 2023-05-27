// Grabbing Button and Heading
const button = document.querySelector('#submit');
const change = document.querySelector('#response');

/**
 * Defines an asynchronous process that occurs when user submits form
 * Returns Promise Object
 * @handleSubmit
 * @param {*} e Any parameter
 * @return {Promise} object that's assigned to the varialbe handleSubmit
 */
const handleSubmit = async (e) => {
    e.preventDefault(); // prevents browser from reloading the page
    console.log("BUTTON HAS BEEN PRESSED!");
    const prompt = "Give me a song about grapes.";
    const chatResponse = await fetch('http://localhost:5000/spotlight',{
      method: 'POST', // from server.js
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message_prompt: prompt,
      }) 
    })
    if (chatResponse.ok) {
        const data = await chatResponse.json();
        const finalResponse = data.bot.trim();
        console.log("How the response is in frontend: " + finalResponse);
        change.innerText = message; // displaying response
    } else {  // Means ChatGPT is down or API Key has run out of credits
        const err = await chatResponse.json();
        const message = err.bot.trim();
        console.log(message);
        change.innerText = message;
    }
}

// Passing in defined handleSubmit when submit is pressed
button.addEventListener('click', handleSubmit);