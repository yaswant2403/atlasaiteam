/**
 * TODO: JS for Handling Form Inputs (Very Similar to main.js)
 */

// Grabbing Button and Heading
const change = document.querySelector('#response');

const form = document.getElementById('spotlight-details');

/**
 * Displaying other referral input if other reference is selected
 */
const refSelect = document.querySelector('#inputReferral');
const otherRef = document.getElementById("other-referral");
refSelect.addEventListener('change', function () {
  const otherInput = otherRef.getElementsByTagName('input')[0];
  if (refSelect.value == "other") {
    otherRef.style.display = 'inline-block';
    // if user selects their own referral, we must add required attribute to input for form validation
    // (Great explanation: https://stackoverflow.com/questions/18770369/how-to-set-html5-required-attribute-in-javascript)
    otherInput.required = true;
  } else {
    otherRef.style.display = 'none';
    otherInput.required = false;
  }
});

/**
 * Displaying New Input Fields when Add More is Clicked
 */
const taskContainer = document.querySelector('#tasks');
const addTask = document.querySelector('#addTasks');
addTask.addEventListener('click', function() {
  const inputCount = String(taskContainer.getElementsByTagName("input").length + 1); // add 1 since we're setting the id of the NEXT input
  console.log(inputCount);
  const newInput = document.createElement('div');
  newInput.classList.add("d-flex", "input-group", "align-items-start");
  newInput.innerHTML = `
    <input type="text" class="form-control" id="inputTasks`+inputCount+`"
      placeholder="Specific Quantifying Task/Responsibility and highlighting its impact"
    style="margin-bottom: 15px;" required/>
    <button id="removeTask" type="button" class="btn rm btn-secondary ml-lg-4" style="text-align: center; background-color: rgb(225, 26, 26);">
      <span class="bi bi-x" style="font-size: 16px"></span>
      Remove
    </button>
    <div class="valid-feedback">Looks Good!</div>
    <div class="invalid-feedback">Please enter a task/responsibility or remove if unnecessary.</div>
  `;
  taskContainer.appendChild(newInput);
})
/**
 * Removing Input Fields when Remove is Clicked
 */
document.addEventListener("click", function(e) {
  if (e.target && e.target.classList.contains("rm")) {
    var parentContainer = e.target.parentElement;
    parentContainer.remove();
  }
});

/**
 * Defines an asynchronous process that occurs when user submits form
 * Returns Promise Object
 * @handleSubmit
 * @param {*} e Any parameter
 * @return {Promise} object that's assigned to the variable handleSubmit
 */
const handleSubmit = async (e) => {
  e.preventDefault(); // prevents browser from reloading the page
  if (!form.checkValidity()) {
    console.log("Form is Invalid!");
    form.classList.add('was-validated');
  } else {
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
}

// Passing in defined handleSubmit when submit is pressed
// useCapture is set to False because we don't want the user to initiate a submission
// Helpful Explanation: https://stackoverflow.com/questions/31535600/stop-propagation-doesnt-work
form.addEventListener('submit', handleSubmit, false);
