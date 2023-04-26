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
    //console.log(customFormat)
  }
  const sender = document.querySelector('#from').value.trim();
  const receiver = document.querySelector('#to').value.trim();
  const subject = document.querySelector('#subject').value.trim();
  const length = document.querySelector('#length').value + " sentences";
  const include = document.querySelector('#include').value.trim();
  // Input Validation of Null/Empty Strings
  if (sender == null || sender == "" || receiver == null || receiver == "" || subject == null || subject == "" || !length.includes('-') ||
    include == null || include == "" || customFormat == null || customFormat == "") {
      alert("Please Enter In All Required Fields");
      form.reset();
  } else {
    const message_prompt = "Generate a " + customFormat + " to " + receiver + " from " 
    + sender + " with the subject of \"" + subject + "\" that is " + length +".";
    const image_prompt = "Write a DALL-E prompt to generate an image about " + subject // can have additional details once include input is made
    + " and include " + include + ". " + "Your only response should be the DALL-E prompt without any quotations such that if I copy the response, I should be able" + 
    " to paste it directly into the DALL-E prompt box."; 
    console.log("How the prompt is in frontend: " + message_prompt);
    console.log("Image prompt: " + image_prompt);
    
    // creating new div element to display response and clearing responseDiv
    const displayResponse = document.createElement('div');
    responseDiv.innerHTML = '';
    responseDiv.style.marginTop = "0";
    responseDiv.style.border = "none";
    responseDiv.style.borderRadius = "0";
    // getting GIF Image and displaying it 
    const loadingGIF = document.querySelector('#loadingGIF');
    loadingGIF.style.display = 'block';
    loadingGIF.style.border = "2px solid #c1baba";
    loadingGIF.style.borderRadius = "10px";

    // Sending user prompt to backend
    // local: http://localhost:5000
    // cPanel: https://openapi.atlasaiteam.web.illinois.edu/
    const chatResponse = await fetch('https://openapi.atlasaiteam.web.illinois.edu/',{
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
      const data = await chatResponse.json();
      const finalResponse = data.bot.trim();
      const finalImageUrl = data.image_bot;
      console.log("How the response is in frontend: " + finalResponse);
      if (finalResponse.includes("violates OpenAI's usage policies") || finalImageUrl.includes("violates OpenAI's usage policies")) {
        //Creates new HTML to display the results
        displayResponse.innerHTML = `
          <div class="card-header">
            <h1>Message and Image</h1>
          </div>
          <div class="card-body text-primary">
            <h3 style="color:black">Your Prompt: ${message_prompt}</h3>
            <h3 style="color:black">Image Keywords: ${include}</h3>
            <div class="row">
              <div class="col">
                <h3 style="color:black">Message:</h3>
                <p style="color:rgb(5, 88, 37)">${finalResponse}</p>
              </div>
              <div class="col">
                <h3 style="color:black">Image:</h3>
                <p style="color:rgb(153, 31, 3)">${finalImageUrl}</p>
              </div>
            </div>
          </div>
        `
      } else {
        displayResponse.innerHTML = `
          <div class="card-header">
            <h1>Message and Image</h1>
          </div>
          <div class="card-body text-primary">
            <h3 style="color:black">Your Prompt: ${message_prompt}</h3>
            <h3 style="color:black">Image Keywords: ${include}</h3>
            <div class="row">
              <div class="col">
                <h3 style="color:black">Message:</h3>
                <p style="color:rgb(5, 88, 37)">${finalResponse}</p>
              </div>
              <div class="col">
                <h3 style="color:black">Image:</h3>
                <img src="${finalImageUrl}" class="mx-auto">
              </div>
            </div>
          </div>
        `
      }
    } else {
      const err = await chatResponse.json();
      const message = err.bot.trim();
      // Means ChatGPT is down or API Key has run out of credits
      if (message.includes("About Section!")) {
        displayResponse.innerHTML = `
          <div class="card-header">
            <h1>Message and Image</h1>
          </div>
          <div class="card-body text-primary">
            <h3 style="color:black">Your Prompt: ${message_prompt}</h3>
            <h3 style="color:black">Image Keywords: ${include}</h3>
            <div class="row">
              <div class="col">
                <h3 style="color:black">Error Message:</h3>
                <p style="color:rgb(153, 31, 3)">${message}</p>
              </div>
            </div>
          </div>
          `
      } else { // Image can't be generated, but the message can so we display that
        const image_err = err.image_bot.trim();
        displayResponse.innerHTML = `
          <div class="card-header">
            <h1>Message and Image</h1>
          </div>
          <div class="card-body text-primary">
            <h3 style="color:black">Your Prompt: ${message_prompt}</h3>
            <h3 style="color:black">Image Keywords: ${include}</h3>
            <div class="row">
              <div class="col">
                <h3 style="color:black">Message:</h3>
                <p style="color:rgb(5, 88, 37)">${message}</p>
              </div>
              <div class="col">
                <h3 style="color:black">Image Error:</h3>
                <p style="color:rgb(153, 31, 3)">${image_err}</p>
              </div>
            </div>
          </div>
        `
      }
    }
    loadingGIF.style.display = "none";
    loadingGIF.style.border = "none";
    loadingGIF.style.borderRadius = "0";
    responseDiv.appendChild(displayResponse);
    responseDiv.style.marginTop = "20px";
    responseDiv.style.border = "2px solid #c1baba";
    responseDiv.style.borderRadius = "10px";
    form.reset();
  }
}

// Once we submit on the form, we will call the handleSubmit Function
form.addEventListener('submit', handleSubmit);