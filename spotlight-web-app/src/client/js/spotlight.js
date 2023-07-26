// keeping track of how many times form has been submitted

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

let submit = 0;
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

function createPrompt() {
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

const selectButton = `
<div class="select" style="text-align: right;">
  <button type="submit" class="btn btn-primary mb-2">Select</button> 
</div>
`;


$(document).ready(function() {
    // when user clicks on select button we are grabbing the corresponding paragraph
    $(document).on('click', '.mb-2', async function() {
    console.log("goes here!")
    const warning_message = "For " + current_user.name + ", are you sure you want to send this paragraph for review? Once selected, it can no longer be edited by you. You will be able to select other paragraphs or generate new ones if you have attempts.";
    if(confirm(warning_message)) {
      let parentColumn = ($(this).parent()).parent(); // finds the parent col of the button
      let paragraph = (parentColumn.find('> p')).text(); // finds the p tag of the col and grabs the paragraph
      const addParagraph = await fetch('/add-paragraph',{ // from server
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          net_id: current_user.net_id,
          paragraph: paragraph,
        }) 
      })
      var response = await addParagraph.json();
      if (addParagraph.ok) {
        // if successfully added, toggle modal with success message
        var user_title = 'Spotlight Paragraph Success 💯';
        $('#add-modal').find('.modal-title').text(user_title);
        $('#add-modal').find('#add-message').css("color", 'rgb(29 151 74)');
        var full_message = response.message + " Go to Account -> View Paragraph to see it!"
        $('#add-modal').find('#add-message').text(full_message);
        $('#add-modal').modal('toggle');
      } else {
        var user_title = 'Spotlight Paragraph Failure';
        $('#add-modal').find('.modal-title').text(user_title);
        $('#add-modal').find('#add-message').css("color", 'rgb(29 151 74)');
        $('#add-modal').find('#add-message').text(response.message);
        $('#add-modal').modal('toggle');
      }
    }
  });
  $('#clear-form').click(_ => {
    form.reset();
    $('#add-modal').modal('toggle');
  })
  // manually toggling the modal close
  $('.close-add').click(_ => {
    $('#add-modal').modal('toggle');
  })
  $('.close-add-modal-btn').click(_ => {
      $('#add-modal').modal('toggle');
  })
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
  if (!form.checkValidity()) {
    console.log("Form is Invalid!");
    form.classList.add('was-validated');
  } else {
    form.classList.remove('was-validated');
    // Add loading animation and remove example text
    document.querySelectorAll('.loader').forEach((loader) => {
      loader.style.display = null;
    })
    response1.style.opacity = 0;
    response2.style.opacity = 0;
    response3.style.opacity = 0;
    // remove any select buttons if they exist
    document.querySelectorAll('.select').forEach((button) => {
      button.remove();
    })
    // if the user has attempts left
    if (current_user.attempts > 0) {
      const prompt = createPrompt();
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
      const data = await chatResponse.json();
      if (chatResponse.ok) {
        // Make loading animations invisible and our boxes visible
        document.querySelectorAll('.loader').forEach((loader) => {
          loader.style.display = 'none';
        })
        // if violation by OpenAI
        if (data.error) {
          // don't dock user of attempt
          response2.style.opacity = 1;
          response2.innerText = data.error.trim();
        } else {
          // continue as normal and dock user of attempt
          const paragraph1 = data.paragraphs[0];
          const paragraph2 = data.paragraphs[1];
          const paragraph3 = data.paragraphs[2];
          // make paragraphs visible and editable
          response1.style.opacity = 1;
          response1.innerText = paragraph1;
          response1.setAttribute("contenteditable", true);
          response2.style.opacity = 1;
          response2.innerText = paragraph2;
          response2.setAttribute("contenteditable", true);
          response3.style.opacity = 1;
          response3.innerText = paragraph3;
          response3.setAttribute("contenteditable", true);
          // adding the select button
          var parentColumn1 = response1.parentElement;
          var parentColumn2 = response2.parentElement;
          var parentColumn3 = response3.parentElement;
          parentColumn1.insertAdjacentHTML('afterbegin', selectButton);
          parentColumn2.insertAdjacentHTML('afterbegin', selectButton);
          parentColumn3.insertAdjacentHTML('afterbegin', selectButton);
          // updating user attempts
          current_user.attempts--;
          const updateAttempts = await fetch('/update-attempts',{ // from server
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
              net_id: current_user.net_id,
              attempts: current_user.attempts
            }) 
          })
          const update = await updateAttempts.json();
          if (updateAttempts.ok) { // if update attempts is successful, update the heading and footer with the current attempts
            document.querySelector('#header-attempts').textContent = `${current_user.attempts} attempts`;
            document.querySelector('#footer-attempts').textContent = `${current_user.attempts}`;
          } else { // TODO: better error handling 
            console.log(update.message);
          }
        }
      } else {  // Means ChatGPT is down or API Key has run out of credits
        // dont dock user of an attempt
        document.querySelectorAll('.loader').forEach((loader) => {
          loader.style.display = 'none';
        })
        response2.style.opacity = 1;
        response2.innerText = data.error.trim();
      }
    } else {
      document.querySelectorAll('.loader').forEach((loader) => {
        loader.style.display = 'none';
      })
      response2.style.opacity = 1;
      response2.innerText = "You have NO ATTEMPTS REMAINING!!";
    }
  }
}

// Passing in defined handleSubmit when submit is pressed
// useCapture is set to False because we don't want the user to initiate a submission
// Helpful Explanation: https://stackoverflow.com/questions/31535600/stop-propagation-doesnt-work
form.addEventListener('submit', handleSubmit, false);
