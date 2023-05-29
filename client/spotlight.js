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
  if (refSelect.value == "other") {
    otherRef.style.display = 'inline-block';
  } else {
    otherRef.style.display = 'none';
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
    style="margin-bottom: 15px;"/>
    <button id="removeTask" type="button" class="btn rm btn-secondary ml-lg-4" style="text-align: center; background-color: rgb(225, 26, 26);">
      <span class="bi bi-x" style="font-size: 16px"></span>
      Remove
    </button>
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

function check() {
  // Array.from(form.elements).forEach((element) => {
  //   if (typeof element.reportValidity === 'function') {
  //     console.log(element);
  //     console.log(`valueMissing: ${element.validity.valueMissing}`,
  //                 `checkValidity: ${form.checkValidity()}`
  //     );
  //     // console.log(element.reportValidity());
  //   }
  // });
  form.classList.add('was-validated');
  console.log(form.checkValidity());
}

form.addEventListener("invalid", (e) => {
  console.log("I reached the invalid listener!")
  console.log(e);
})


/**
 * Defines an asynchronous process that occurs when user submits form
 * Returns Promise Object
 * @handleSubmit
 * @param {*} e Any parameter
 * @return {Promise} object that's assigned to the variable handleSubmit
 */
const handleSubmit = async (e) => {
    e.preventDefault(); // prevents browser from reloading the page
    check();
    // form.classList.add('was-validated');
    // Array.from(form.elements).forEach((element) => {
    //   if (typeof element.reportValidity === 'function') {
    //     console.log(element);
    //     element.reportValidity();
    //     // console.log(element.reportValidity());
    //   }
    // });
    // console.log(form.checkValidity());
    // if (!form.checkValidity()) {
    //   console.log("We reach here!")
    //   e.stopPropagation();  
    //   return;
    // }
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
form.addEventListener('submit', handleSubmit);