// Grabbing Form and Response
const form = document.getElementById('spotlight-details');
const response = document.querySelector('#chat-response');

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

  // Displaying their inputs
  form.reset(); // clears form
  if (document.querySelectorAll('.rm').length != 0) { // removing extra tasks if > 3 tasks were added previously 
    var extra = document.querySelectorAll('.rm');
    Array.prototype.forEach.call(extra, function(node) {
      node.parentNode.remove();
    });
  }
  var listInputs = document.createElement('ul');
  listInputs.setAttribute("id", "user-inputs");
  listInputs.classList.add("ml-auto");
  listInputs.innerHTML = `
    <li id="name" class="input-item">
      <p style="display: inline-block; font-weight: bold;">Name: </p>
      <p style="display: inline-block;">${name}</p>
    </li>
    <li id="major" class="input-item">
      <p style="display: inline-block; font-weight: bold;">Major: </p>
      <p style="display: inline-block;">${major}</p>
    </li>
    <li id="year" class="input-item">
      <p style="display: inline-block; font-weight: bold;">Year: </p>
      <p style="display: inline-block;">${year}</p>
    </li>
    <li id="referral" class="input-item">
      <p style="display: inline-block; font-weight: bold;">Referral: </p>
      <p style="display: inline-block;">${reference}</p>
    </li>
    <li id="semesters" class="input-item">
      <p style="display: inline-block; font-weight: bold;">Number of Semesters: </p>
      <p style="display: inline-block;">${sems}</p>
    </li>
    <li id="why-atlas" class="input-item">
      <p style="font-weight: bold;">Why ATLAS?</p>
      <!-- White space normal wraps the text such that it fits in the parent container -->
      <p style="white-space: normal;">${whyJoin}</p>
    </li>
    <li id="fun-fact" class="input-item">
      <p style="font-weight: bold;">Fun Fact</p>
      <p style="white-space: normal;">${funFact}</p>
    </li>
    <li id="title" class="input-item">
      <p style="display: inline-block; font-weight: bold;">Official Title: </p>
      <p style="display: inline-block;">${position}</p>
    </li>
    <li id="client" class="input-item">
      <p style="display: inline-block; font-weight: bold;">Client: </p>
      <p style="display: inline-block;">${client}</p>
    </li>
    <li id="tasksList" class="input-item">
      <p style="font-weight: bold;">Tasks/Responsibilities: </p>
      <p style="white-space: normal;">${task1}</p>
      <p style="white-space: normal;">${task2}</p>
      <p style="white-space: normal;">${task3}</p>
    </li>
    <li id="skills" class="input-item">
      <p style="font-weight: bold;">Skills: </p>
      <p style="white-space: normal;">${skills}</p>
    </li>
    <li id="experience" class="input-item">
      <p style="font-weight: bold;">Experience: </p>
      <p style="white-space: normal;">${exp}</p>
    </li>
    <li id="future-plans" class="input-item">
      <p style="font-weight: bold;">Future Plans: </p>
      <p style="white-space: normal;">${future}</p>
    </li>
  `
  if (!(moreTasks.length === 0)) {
    moreTasks.forEach(task => {
      const p = document.createElement('p');
      p.setAttribute('style','white-space: normal');
      p.innerHTML = task;
      listInputs.querySelector('#tasksList').appendChild(p); // appends new tasks to tasksList li element
    }); 
  }
  document.getElementById('inputs').appendChild(listInputs); // appends all ul element to inputs col
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
    response.innerHTML = "";
    document.querySelector('#loading').style.display = "block";
    form.classList.remove('was-validated');
    // Removing previous placeholder text and user inputs if they exists
    if (document.querySelector('#placeholder-input')) {
      document.querySelector('#placeholder-input').parentElement.removeChild(document.querySelector('#placeholder-input'));
    }
    const displayInputs = document.querySelector('#user-inputs');
    if (displayInputs) {
      displayInputs.parentElement.removeChild(displayInputs);
    }
    const prompt = createPromptandDisplayInputs();
    
    // Sending prompt to server
    const chatResponse = await fetch('/spotlight',{
      method: 'POST', // from server.js
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
        const finalResponse = data.bot.trim();
        console.log("How the response is in frontend: " + finalResponse);
        response.innerText = message; // displaying response
      } else {  // Means ChatGPT is down or API Key has run out of credits
        document.querySelector('#loading').style.display = "none";
        const err = await chatResponse.json();
        const message = err.bot.trim();
        console.log(message);
        response.innerText = message;
    }
  }
}

// Passing in defined handleSubmit when submit is pressed
// useCapture is set to False because we don't want the user to initiate a submission
// Helpful Explanation: https://stackoverflow.com/questions/31535600/stop-propagation-doesnt-work
form.addEventListener('submit', handleSubmit, false);
