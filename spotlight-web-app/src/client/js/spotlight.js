// Grabbing Form and Response
const form = document.getElementById('spotlight-details');
const response1 = document.querySelector('#chat-response1');
const response2 = document.querySelector('#chat-response2');
const response3 = document.querySelector('#chat-response3');

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

function createPromptandDisplayInputs() {
  // Grabbing all form inputs
  const name = document.querySelector('#inputName').value.trim();
  const major = document.querySelector('#inputMajor').value.trim();
  const year = document.querySelector('#inputYear').value;
  const referral = document.querySelector('#inputReferral').value;
  let reference = referral;
  if (referral === "other") {
    reference = document.querySelector('#other-referral-input').value;
  }
  const sems = document.querySelector('#inputSems').value;
  const whyJoin = document.querySelector('#reasonForJoining').value.trim();
  const funFact = document.querySelector('#funFact').value.trim();
  const position = document.querySelector('#inputPosition').value.trim();
  const client = document.querySelector('#inputClient').value.trim();
  const task1 = document.querySelector('#inputTasks1').value.trim();
  const task2 = document.querySelector('#inputTasks2').value.trim();
  const task3 = document.querySelector('#inputTasks3').value.trim();
  let moreTasks = [];
  // if we have more than 3 task inputs, we add their values to moreTasks
  if (taskContainer.getElementsByTagName("input").length > 3) {
    var extraTasks = Array.from((taskContainer.getElementsByTagName("input"))).slice(3)
    extraTasks.forEach(element => {
      moreTasks.push(element.value);
    });
  }
  const skills = document.querySelector('#skillsGain').value.trim();
  const exp = document.querySelector('#experienceGain').value.trim();
  const future = document.querySelector('#future').value.trim();

  // Creating the prompt
  let prompt = "Now, generate a paragraph about an intern who participated in the ATLAS Internship Program using the following variables:\n" 
  + "Name: [" + name + "]\nMajor: [" + major + "]\nYear: [" + year + "]\nReferral to ATLAS: [" + reference + "]\nHow Many Semesters as an ATLAS Intern: ["
  + sems + "]\nWhy did you join ATLAS: [" + whyJoin + "]\nOfficial Position: [" + position + "]\nClient: [" + client + "]\nTasks and Responsibilities: ["
  + task1 + ", " + task2 + ", " + task3;
  if (!(moreTasks.length === 0)) {
    moreTasks.forEach(task => {
      prompt += ", " + task;
    }); 
  }
  prompt += "]\nSkills Gained: [" + skills + "]\nExperience Gained: [" + exp + "]\nFuture Plans and Career Aspirations: [" + future + "]\nFun Fact: [" + funFact + "]\n"
  + "Remember to provide a cohesive and informative paragraph that highlights the intern's journey, growth, and connection to the ATLAS Internship Program.";
  console.log(prompt);

// removing extra tasks if > 3 tasks were added previously 
  if (document.querySelectorAll('.rm').length != 0) { 
    var extra = document.querySelectorAll('.rm');
    Array.prototype.forEach.call(extra, function(node) {
      node.parentNode.remove();
    });
  }
  return prompt;
}

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
    // Add loading animation and remove example text
    response1.innerHTML = "";
    response2.innerHTML = "";
    response3.innerHTML = "";
    document.querySelector('#loading').style.display = "block";
    form.classList.remove('was-validated');
    
    // Sending prompt to server
    const chatResponse = await fetch('/spotlight',{ // from server
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        message_prompt: prompt,
      }) 
    })
    if (chatResponse.ok) {
        // Make loading animation invisible
        document.querySelector('#loading').style.display = "none";

        const data = await chatResponse.json();
        const msg1 = data.paragraphs[0];
        const msg2 = data.paragraphs[1];
        const msg3 = data.paragraphs[2];

        response1.innerHTML = `
          <button type="submit" class="btn btn-primary">Select</button> 
          <p>Paragraph 1:</p>
          <p contentEditable="true">${msg1}</p>
        `;
        response2.innerHTML = `
          <button type="submit" class="btn btn-primary">Select</button> 
          <p>Paragraph 2:</p>
          <p contentEditable="true">${msg2}</p>
        `;
        response3.innerHTML = `
          <button type="submit" class="btn btn-primary">Select</button> 
          <p>Paragraph 3:</p>
          <p contentEditable="true">${msg3}</p>
        `;
      } else {  // Means ChatGPT is down or API Key has run out of credits
        document.querySelector('#loading').style.display = "none";
        const err = await chatResponse.json();
        const message = err.bot.trim();
        console.log(message);
        response2.innerText = message;
    }
  }
}

// Passing in defined handleSubmit when submit is pressed
// useCapture is set to False because we don't want the user to initiate a submission
// Helpful Explanation: https://stackoverflow.com/questions/31535600/stop-propagation-doesnt-work
form.addEventListener('submit', handleSubmit, false);
