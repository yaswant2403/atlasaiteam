# QuikScribe - Message and Image Generator
## By ATLAS AI Team of Spring 2023

This branch contains an archived page of the website that generates messages and images based on user's inputs. 
Specifically, the `Create Message` page was made during Spring 2023, and this repo contains how the code was structured from
that semester. As such, it doesn't include authentication, or any database connections. 

### Project Description

This project is a full-stack web appliction that uses OpenAI's gpt-3.5-turbo API along with NodeJS, HTML and CSS. The user enters information about the type of message they would like, and using those inputs, we send ChatGPT a prompt that generates a response which we display to the user on the frontend. Along with the message, we use ChatGPT to generate a DALL-E prompt, and send that prompt to DALL-E to create an image corresponding with the message. You can access this website at [atlasaiteam.web.illinois.edu](atlasaiteam.web.illinois.edu).

### Environment Setup (Windows + Mac)
```bash
# Ensure you have Node and NPM installed
node -v
npm -v
# If you don't, you can install both from here: https://nodejs.org/en/download
# Then, clone the repository by doing 
git clone https://github.com/yaswant2403/atlasaiteam
```
Make a new `.env` file with the contents of the `.env.dummy.file` and set OPEN_API_KEY to the key you receive from [OpenAI](https://platform.openai.com/account/api-keys).

### Running the App
```bash
    npm ci
    npm run dev
```
Now, you'll be able to view all the webpages and interact with the form.

### File Structure
```bash
├── index.html
└── src
    ├── client
    │   ├── assets/
    │   ├── css/
    │   ├── html
    │   │   └── about.ejs
    │   └── js
    │       └── main.js
    └── server
        ├── main.js
        └── routes
            ├── assetsRouter.js
            ├── cssRouter.js
            └── jsRouter.js
```

In the `client/` folder, we have the code for the frontend of the website with `js/main.js` fetching the response and handling form submits while `index.html` is the main page for the application. The `server/` folder contains the backend of the application with `server/main.js` handling the routes to the different pages calling OpenAI's API and sending the response back to the frontend. The `server/routes` folder contains routers to handle the assets, css, and javascript used for the pages. 


## Acknowledgements

[MAIN INSPIRATION](https://www.youtube.com/watch?v=2FeymQoKvrk)

OpenAPI Documentation:
https://platform.openai.com/docs/guides/chat/introduction
https://platform.openai.com/tokenizer
https://platform.openai.com/docs/api-reference/chat/create

JS Issues:
https://stackoverflow.com/questions/31931614/require-is-not-defined-node-js
https://stackoverflow.com/questions/48248832/stylesheet-not-loaded-because-of-mime-type
https://webpack.js.org/guides/getting-started/
https://browserify.org/
https://stackoverflow.com/questions/71844271/vite-is-not-recognized-on-npm-run-dev

Managing multiple JS Files:
https://stackoverflow.com/questions/5697061/how-to-manage-multiple-js-files-server-side-with-node-js
https://stackoverflow.com/questions/21377892/using-node-js-modules-in-html
https://levelup.gitconnected.com/building-multi-file-node-js-applications-with-bazel-9d631b667c8d
https://www.digitalocean.com/community/tutorials/how-to-create-a-node-js-module
https://www.youtube.com/watch?v=OFOCxrhHUOs

Creating a ChatBot:
https://philna.sh/blog/2023/03/13/create-a-cli-chatbot-with-chatgpt-api-and-node-js/

https://www.youtube.com/watch?v=dXsZp39L2Jk
