function generateMessage() {
  const sender = document.querySelector('#from');
  const receiver = document.querySelector('#to');
  const subject = document.querySelector('#subject');
  const prompt = "Generate a greeting card to " + receiver.value + " from " + sender.value + " with the subject of " + subject.value + " that's under three sentences."
  console.log(prompt)
  const url = `https://api.openai.com/v1/engines/code-davinci-002/completions?prompt=${encodeURIComponent(prompt)}&max_tokens=100`;
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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'
    }
  })
  .then(response => response.json())
  .then(data => {
    const message = data.choices[0].text;
    console.log(message)
    document.querySelector('responseTitle').innerHTML = "Here is your card:";
    document.querySelector('response').innerHTML = message;
  })
  .catch(error => console.error(error));
  localStorage.setItem('greetingCard', message)
}


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