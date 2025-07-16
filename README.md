<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

<h1><center>Resume Q&A API</center></h1>

- This is a NestJS-based API that allows users to upload PDF resumes, extract their text content, store them in a MongoDB database, and then query the resume content using the Google Gemini Large Language Model (LLM).

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## 🏗️ Project Structure

```bash
├── src/
│ ├── resume/ # resume module
│ │ ├── dto/ask-question.dto.ts
│ │ ├── entities/resume.entity.ts
│ │ ├── resume.controller.ts # API endpoint
│ │ ├── resume.service.ts # Business logic
│ │ └── resume.module.ts
│ └── main.ts # Entry point
├── .env # Environment variables
├── package.json # Dependencies
└── README.md # This file
```

## 📦 Project setup

## 1. Installation

```bash
$ npm install
```

## 2. Create a .env file:

- PORT = port
- DB_URL = mongodb_connection_string
- GOOGLE_API_KEY = your_gemini_api_key_here
  ⚠️ Use your Google AI Studio key: https://makersuite.google.com/app/apikey

## 3. Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 📡 API Endpoint

1. Upload a Resume (PDF only)
   - Endpoint: POST http://localhost:3000/resume/upload
   - Headers: Content-Type: multipart/form-data
   - Body: {Key: file (Type: File)}

2. Get All Uploaded Resumes
   - Endpoint: GET http://localhost:3000/resume

3. Get a Specific Resume
   - Endpoint: GET http://localhost:3000/resume/:id

4. Query a Resume
   - Endpoint: POST http://localhost:3000/resume/query/:id
   - Body:
     {
     "question": "What is the candidate's work experience?"
     }

5. Perform a Global Search Query From All Resumes
   - Endpoint: POST http://localhost:3000/resume/search
   - Body:
     {
     "query":"list out all candidate's name"
     }
