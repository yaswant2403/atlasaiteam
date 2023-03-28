function display() {
    let words = document.querySelector("#keywords");
    let display = document.querySelector("#allKeywords");
    let response = document.querySelector("#response");
    let responseTitle = document.querySelector("#responseTitle");
    let chatGPT = "Thank you so much for all your gifts in the baby shower! We couldn't have done it without you.";
    display.innerHTML = "Your keywords are " + words.value;
    responseTitle.innerHTML = "ChatGPT has generated this following letter:";
    response.innerHTML = chatGPT;
}