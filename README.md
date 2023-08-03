<!-- Inspiration from https://github.com/yaswant2403/Best-README-Template -->
<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<div align="center">
  <h3 align="center">QuikScribe - ATLAS Spotlight Generator</h3>
  <p align="center">
    Created by ATLAS AI Team of Summer 2023
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#tech-stack">Tech Stack</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project
QuikScribe is a full-stack web appliction that generates customized paragraphs about an **[ATLAS](https://github.com/ATLAS-Illinois/)** Intern's journey throughout their internship. Additionally, it's a full CRUD account management system that stores interns and their paragraphs, ATLAS staff and ATLAS admin.

You can access our **[presentation](https://docs.google.com/presentation/d/1DgfxkBn4Ui_j2Y8Wq-qlC1yMxgdV__ONvFIi3VAtxJE/edit?usp=sharing)** and a **[recorded demo](https://drive.google.com/file/d/1q1DMjHw3PqpwV6xHAvwsYI3wSUMJXbNC/view?usp=sharing)**.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Tech Stack
> **Frontend**

  * [![HTML][HTML.com]][HTML-url]
  * [![JavaScript][JavaScript.com]][JavaScript-url]
  * [![JQuery][JQuery.com]][JQuery-url]
  * [![CSS][CSS.com]][CSS-url]
  * [![Bootstrap][Bootstrap.com]][Bootstrap-url]

> **Backend**

* [![NodeJS][NodeJS.com]][NodeJS-url] + [![NPM][NPM.com]][NPM-url] 
* [![JQuery][Vite.com]][Vite-url]
* [![ExpressJS][ExpressJS.com]][ExpressJS-url]
* [![SQL][SQL.com]][SQL-url]
* [![Sequelize][Sequelize.com]][Sequelize-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

There are two methods to start developing. 
  
  1. **[Highly Recommended]** Have an MySQL server setup. Once your server is setup, you would create a database using the `dump.sql` file giving you a local copy of the database on cPanel. This gives you access to the **full functionality** and features of the application.

  2. If you only want to interact with the **frontend** (changing styling or HTML) of the application, then you may opt-in with this version where there doesn't exist any authentication or database connections. However, this does **NOT include the ACCOUNT** page and only has a semifunctional Spotlight page. 

### Prerequisites

For both methods, you will need:

* node + npm
  ```bash
  # Checking if they exist
  node -v
  npm -v  
  ```
  * If your system doesn't have them yet, you can install them at [NodeJS + NPM Download](https://nodejs.org/en/download)
* API Key at [OpenAI](https://platform.openai.com/account/api-keys)

For **Method 1**, you will need to install MySQL into your system. 
* [Windows Installation](https://dev.mysql.com/doc/refman/8.0/en/windows-installation.html)
* [Mac Installation](https://dev.mysql.com/doc/mysql-macos-excerpt/8.0/en/macos-installation.html)
* [Ubuntu-22.04 Installation](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-22-04)

  Once installed, ensure that you can create databases, create tables, insert, delete, etc. Here's a cheatsheet for different queries: [MySQL Cheatsheet](https://www.mysqltutorial.org/mysql-create-database/).

For **Method 2**, there's nothing to be done. 

### Installation

**BOTH Methods**

1. Clone the repo
   ```bash
   git clone https://github.com/yaswant2403/atlasaiteam.git
   ```
2. Install NPM packages
   ```bash
   cd spotlight-web-app
   npm ci
   ```
3. Make a copy of `spotlight-web-app/.env.dummy.file` and rename it `.env`. Open the `.env` file and change
   ```bash
   OPEN_API_KEY = "Your OpenAI API Key you created"
   ```
**Method 1** 

  4. Create the database. With whichever client you choose, import/run the `dump.sql` file. I'll show how you can do it from the mysql command line
  ```bash
  source path-to-folder/atlasaiteam/spotlight-web-app/dump.sql 
  ```
  This will create the database with all of the tables and all of the relationships between the tables. 
  
  5. Now, let's create a new user for MySQL. Execute the following queries:
  ```sql
  CREATE USER 'user'@'localhost' IDENTIFIED BY 'any-password-you-want';

  GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, RELOAD, PROCESS, REFERENCES, INDEX, ALTER, SHOW DATABASES, CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, REPLICATION SLAVE, REPLICATION CLIENT, CREATE VIEW, SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, CREATE USER, EVENT, TRIGGER ON *.* TO 'user'@'localhost' WITH GRANT OPTION;
  ```
  This helps fix this [access denied issue][sql-user-issue] and matches up with the existing configuration.
  
  6. Open the `.env` file and change
   ```bash
   PASSWORD = "The password that you gave user@localhost"
   ```
  
  7. Get a new Client Secret from [![JQuery][Azure.com]][Azure-url]. You can follow this [tutorial](https://learn.microsoft.com/en-us/answers/questions/834401/hi-i-want-my-client-id-and-client-secret-key) to obtain a new client secret. However, if you don't see `Certificates and Secrets`, you might not have permission. Please contact msommers@illinois.edu to give you permission. Once you have copied the secret, open the `.env` file and change
  ```bash
  CLIENT_SECRET = "The Client Secret you just made"
  ```

### Running App
To run the application,

**Method 1 (With MySQL Database)** 
```bash
cd spotlight-web-app
npm run dev
```
and wait until MySQL Store is ready. Then, you can go to http://localhost:3000/ to see the website. Any change you make in `src/server/` will automatically refresh the whole server. However, if you make a change in `src/client`, you will have to manually refresh the page to see your changes. You can stop running with `CTRL or CMD C`.
 
**Method 2 (Without MySQL Database)** 
```bash
cd spotlight-web-app
npm run dev-frontend
```
Then, you can go to http://localhost:3000/ to see the website.Any change you make in `src/server/` will automatically refresh the whole server. However, if you make a change in `src/client`, you will have to manually refresh the page to see your changes.  You can stop running with `CTRL or CMD C`.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

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

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/yaswant2403/atlasaiteam.svg?style=for-the-badge
[contributors-url]: https://github.com/yaswant2403/atlasaiteam/graphs/contributors
[issues-shield]: https://img.shields.io/github/issues/yaswant2403/atlasaiteam.svg?style=for-the-badge
[issues-url]: https://github.com/yaswant2403/atlasaiteam/issues
[license-shield]: https://img.shields.io/badge/License-GNU%20GPL-blue?style=for-the-badge
[license-url]: https://github.com/yaswant2403/atlasaiteam/blob/main/LICENSE

[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/

<!-- Frontend -->
[HTML.com]: https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[HTML-url]: https://developer.mozilla.org/en-US/docs/Web/HTML
[JavaScript.com]: https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E
[JavaScript-url]: https://www.javascript.com/
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
[CSS.com]: https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[CSS-url]: https://developer.mozilla.org/en-US/docs/Web/CSS
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
<!-- Backend -->

[NodeJS.com]: https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[NodeJS-url]: https://nodejs.org/en/download
[NPM.com]: https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white
[NPM-url]: https://www.npmjs.com/
[Vite.com]: https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E
[Vite-url]: https://vitejs.dev/
[ExpressJS-url]: https://expressjs.com/
[ExpressJS.com]: https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white
[SQL.com]: https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white
[SQL-url]: https://www.mysql.com/
[Sequelize.com]: https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white
[Sequelize-url]: https://sequelize.org/

[sql-user-issue]: https://stackoverflow.com/questions/40477625/nodejs-mysql-er-access-denied-error-access-denied-for-user-rootlocalhost?page=1&tab=scoredesc#tab-top

[MDNWebDocs.com]: 	https://img.shields.io/badge/MDN_Web_Docs-black?style=for-the-badge&logo=mdnwebdocs&logoColor=white
[MDNWebDocs-url]: https://developer.mozilla.org/en-US/docs/Web
[Azure.com]: https://img.shields.io/badge/microsoft%20azure-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white
[Azure-url]: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/0ee72bd2-5571-417d-a595-f83f13b2a45f/isMSAApp~/false
[VSCode.com]: https://img.shields.io/badge/VSCode-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white
[VSCode-url]: https://code.visualstudio.com/

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