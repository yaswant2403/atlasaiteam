const form = document.querySelector('#greeting-details')
const responseDiv = document.querySelector('#response')

const formatSelect = document.querySelector('#format');
const customInput = document.getElementById("custom-input");

formatSelect.addEventListener('change', function () {
  if (formatSelect.value == "custom") {
    customInput.style.display = 'block';
  } else {
    customInput.style.display = 'none';
  }
});

// function to handle when user submits form
const handleSubmit = async (e) => {
  e.preventDefault(); // prevents browser from reloading the page
  const format = document.querySelector('#format').value;
  let customFormat = format;
  if (format == 'custom' && customFormat) {
    customFormat = document.querySelector('#custom-format-input').value;
    console.log(customFormat)
  }
  const sender = document.querySelector('#from').value;
  const receiver = document.querySelector('#to').value;
  const subject = document.querySelector('#subject').value;
  const length = document.querySelector('#length').value + " sentences";
  const message_prompt = "Generate a " + customFormat + " to " + receiver + " from " 
  + sender + " with the subject of \"" + subject + "\" that is " + length +".";
  const image_prompt = "Write a DALL-E prompt to generate an image about " + subject // can have additional details once include input is made
  + ". Your only response should be the DALL-E prompt without any quotations such that if I copy the response, I should be able" + 
  " to paste it directly into the DALL-E prompt box."; 
  console.log("How the prompt is in frontend: " + message_prompt);
  console.log("Image prompt: " + image_prompt);
  
  // creating new div element to display response and clearing responseDiv
  const displayResponse = document.createElement('div');
  responseDiv.innerHTML = '';
  // getting GIF Image and displaying it 
  const loadingGIF = document.querySelector('#loadingGIF');
  loadingGIF.style.display = 'block';

  // Sending user prompt to backend
  // local: http://localhost:5000
  // cPanel: http://openapi.atlasaiteam.web.illinois.edu/
  const chatResponse = await fetch('http://openapi.atlasaiteam.web.illinois.edu/',{
    method: 'POST', // from server.js
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message_prompt: message_prompt,
      image_prompt: image_prompt
    }) 
  })

  // Grabbing response from backend
  if (chatResponse.ok) {
    loadingGIF.style.display = "none";
    const data = await chatResponse.json();
    const finalResponse = data.bot.trim();
    const finalImageUrl = data.image_bot;
    console.log("How the response is in frontend: " + finalResponse);
    // Creates a new element to display the results
    displayResponse.innerHTML = `
      <p>From: ${sender}</p>
      <p>To: ${receiver}</p>
      <p>Subject: ${subject}</p>
      <p>Your Prompt: ${message_prompt}</p>
      <h1>ChatGPT Response</h1>
      <p>${finalResponse}</p>
      <img src="${finalImageUrl}" class="mx-auto">
      `
    responseDiv.innerHTML = ''; //clear responseDiv before appending new response
    responseDiv.appendChild(displayResponse);
  } else {
    const err = await chatResponse.text();
    displayResponse.innerHTML = `
      <p>Something went wrong!</p>
      <p>${err}</p>
      `
    loadingGIF.style.display = "none";
    responseDiv.innerHTML = ''; //clear responseDiv before appending new response
    responseDiv.appendChild(displayResponse);
  }
  form.reset();
}

// Once we submit on the form, we will call the handleSubmit Function
form.addEventListener('submit', handleSubmit);
// Just added bonus to submit the form by pressing enter key (key code 13)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) { // === ensures type matches as well
    handleSubmit(e);
  }
});