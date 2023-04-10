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
  const prompt = "Generate a " + customFormat + " to " + receiver + " from " 
  + sender + " with the subject of \"" + subject + "\" that is " + length +".";
  console.log("How the prompt is in frontend: " + prompt);
  
  // creating new div element to display response
  const displayResponse = document.createElement('div');

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
      prompt: prompt
    }) 
  })
  
  // Grabbing response from backend
  if (chatResponse.ok) {
    loadingGIF.style.display = "none";
    const data = await chatResponse.json();
    const finalResponse = data.bot.trim();
    console.log("How the response is in frontend: " + finalResponse);
    // Creates a new element to display the results
    displayResponse.innerHTML = `
      <p>From: ${sender}</p>
      <p>To: ${receiver}</p>
      <p>Subject: ${subject}</p>
      <p>Your Prompt: ${prompt}</p>
      <h1>ChatGPT Response</h1>
      <p>${finalResponse}</p>
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