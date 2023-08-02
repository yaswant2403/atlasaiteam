# QuikScribe - Message and Image Generator
## Done by ATLAS AI Team Summer 2023
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://kentcdodds.com"><img src="https://avatars.githubusercontent.com/u/1500684?v=3?s=100" width="100px;" alt="Kent C. Dodds"/><br /><sub><b>Kent C. Dodds</b></sub></a><br /><a href="#question-kentcdodds" title="Answering Questions">💬</a> <a href="https://github.com/all-contributors/all-contributors/commits?author=kentcdodds" title="Documentation">📖</a> <a href="https://github.com/all-contributors/all-contributors/pulls?q=is%3Apr+reviewed-by%3Akentcdodds" title="Reviewed Pull Requests">👀</a> <a href="#talk-kentcdodds" title="Talks">📢</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jfmengels"><img src="https://avatars.githubusercontent.com/u/3869412?v=3?s=100" width="100px;" alt="Jeroen Engels"/><br /><sub><b>Jeroen Engels</b></sub></a><br /><a href="https://github.com/all-contributors/all-contributors/commits?author=jfmengels" title="Documentation">📖</a> <a href="https://github.com/all-contributors/all-contributors/pulls?q=is%3Apr+reviewed-by%3Ajfmengels" title="Reviewed Pull Requests">👀</a> <a href="#tool-jfmengels" title="Tools">🔧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://jakebolam.com"><img src="https://avatars2.githubusercontent.com/u/3534236?v=4?s=100" width="100px;" alt="Jake Bolam"/><br /><sub><b>Jake Bolam</b></sub></a><br /><a href="https://github.com/all-contributors/all-contributors/commits?author=jakebolam" title="Documentation">📖</a> <a href="#tool-jakebolam" title="Tools">🔧</a> <a href="#infra-jakebolam" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-jakebolam" title="Maintenance">🚧</a> <a href="https://github.com/all-contributors/all-contributors/pulls?q=is%3Apr+reviewed-by%3Ajakebolam" title="Reviewed Pull Requests">👀</a> <a href="#question-jakebolam" title="Answering Questions">💬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tbenning"><img src="https://avatars2.githubusercontent.com/u/7265547?v=4?s=100" width="100px;" alt="Tyler Benning"/><br /><sub><b>Tyler Benning</b></sub></a><br /><a href="#maintenance-tbenning" title="Maintenance">🚧</a> <a href="https://github.com/all-contributors/all-contributors/commits?author=tbenning" title="Code">💻</a> <a href="#design-tbenning" title="Design">🎨</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fhemberger"><img src="https://avatars.githubusercontent.com/u/153481?v=3?s=100" width="100px;" alt="F. Hemberger"/><br /><sub><b>F. Hemberger</b></sub></a><br /><a href="https://github.com/all-contributors/all-contributors/commits?author=fhemberger" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/frigginglorious"><img src="https://avatars.githubusercontent.com/u/3982200?v=3?s=100" width="100px;" alt="Daniel Kraft"/><br /><sub><b>Daniel Kraft</b></sub></a><br /><a href="https://github.com/all-contributors/all-contributors/commits?author=frigginglorious" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mbad0la"><img src="https://avatars.githubusercontent.com/u/8503331?v=3?s=100" width="100px;" alt="Mayank Badola"/><br /><sub><b>Mayank Badola</b></sub></a><br /><a href="https://github.com/all-contributors/all-contributors/commits?author=mbad0la" title="Documentation">📖</a> <a href="#tool-mbad0la" title="Tools">🔧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.marcobiedermann.com"><img src="https://avatars.githubusercontent.com/u/5244986?v=3?s=100" width="100px;" alt="Marco Biedermann"/><br /><sub><b>Marco Biedermann</b></sub></a><br /><a href="#design-marcobiedermann" title="Design">🎨</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->


After cloning repo locally, you will need to add an .env file similar to the dummy env file with your details. If you have a mySQL database set up, you'll need to edit the password and database name accordingly. In the future, we won't be creating our database. It will be made on cPanel and we will only query it for the admin page.
#### Launch the App
```bash
cd spotlight-web-app
npm ci
npm run dev
```

Go to http://localhost:3000/ to see the website!

### IGNORE THE BELOW FOR NOW! It is outdated information.

This project is a full-stack web appliction that uses OpenAI's gpt-3.5-turbo API along with NodeJS, HTML and CSS. The user enters information about the type of message they would like, and using those inputs, we send ChatGPT a prompt that generates a response which we display to the user on the frontend. Along with the message, we use ChatGPT to generate a DALL-E prompt, and send that prompt to DALL-E to create an image corresponding with the message.

### File Structure

```bash
├───client
│   ├───assets
│   ├───index.html
│   ├───main.js
│   ├───style.css
├───server
│   └───server.js
```

In the `client/` folder, we have the code for the frontend of the website with `main.js` fetching the response and handling form submits while `index.html` is the main page for the application. The `server/` folder contains the backend of the application with `server.js` calling OpenAI's API and sending the response back to the frontend. It should also contain the .env file with the OPEN_API_KEY set to the key you receive from [OpenAI].(https://platform.openai.com/account/api-keys)

## Running Guide

This project uses Vanilla JS as its programming language and NodeJS (16.17.1) for its backend server. Vite (4.2.0) is used to run the frontend and server locally. You can access this website at [atlasaiteam.web.illinois.edu](atlasaiteam.web.illinois.edu). If you'd like to run it locally, the following setup process has been tested on Windows 10. Below are the console/terminal/shell commands:

### Environment Setup for Windows (Using WSL2 in VSCode)

```bash
# Ensure you have Node and NPM installed
node -v
npm -v

# Install the Necessary Packages
npm i vite
npm i cors dotenv express nodemon openai
```
#### Launch the Frontend
```bash
cd client
npm install
npm run dev
// You should see something like this:
```
![Application Running](https://user-images.githubusercontent.com/51063116/232668794-88e9b4bd-a108-4e43-ae91-ac7f2002f0a0.png)

Click on the localhost link to see the frontend of the website!

#### Launching the Backend
```bash
// Open a new terminal
cd server
npm run server
```
At this point, the environment setup is complete. You have both the frontend and the backend running locally, and you should be able to generate responses based on different user inputs.

## Acknowledgements

[MAIN INSPIRATION](https://www.youtube.com/watch?v=2FeymQoKvrk)

ChatGPT for Bootstrap

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
