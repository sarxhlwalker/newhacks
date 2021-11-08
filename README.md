# Peer Pressure Panda

Developed in 24 hours, Peer Pressure Panda is a social media app that won [IEEE UofT's 2021 NewHacks](https://newhacks-2021.devpost.com/) Best Productivity Hack category. It incentivizes productivity by letting students create groups for their classes at school in which they will be notified by text message when one of their friends completes an assignment for that class.

![Screenshot](https://cdn.discordapp.com/attachments/906910291776925696/906910298391334952/unknown.png)

## Description

> Instead of weakly asking friends about their success in school and their productivity, this is an easy shortcut to your answers! Moreover, we have found that knowing about others’ success makes it more encouraging for us to work hard for the same result, so Peer Pressure Panda is the perfect solution: you get automated text messages whenever a peer completes their work, so you get reminded to do the same as well!

More information for our app can be found on our [Devpost page](https://devpost.com/software/peer-pressure-panda).

## Web Demo

As of writing, the web demo for this project is hosted at https://pandapressure.tech/. Because this app is hosted by Heroku at the moment, it may initially take a little while to load.

## Build from Source

> ### Warning
> You will need to create a `.env` file in the `Backend/` folder for the server to run properly. This file contains environment variables for a MongoDB connection url (`CONNECTION_URL`), an express session key (`SESSION_KEY`) and Twilio keys (`AUTH_TOKEN`) and (`ACCOUNT_SID`). Also remember to change the from phone number for Twilio to work properly.

The source code for this project can be compiled and run from the ground-up using the command found in the `Procfile`, located in the root directory of this repository. Alternatively, you can manually compile this project using the steps below.

1. Install Typescript and SASS (if you have not already done so) using

```
npm i -g typescript
```

and

```
npm i -g sass
```

2. Compile the front-end
   Navigate to `WebApp/` and run `npm i` to install any necessary dependencies, then run

```
tsc
```

and

```
sass sass:static/styles
```

to compile the necessary components for the project.

3. Navigate backwards into the root directory, then into `Backend/` and run `npm i` to install any necessary dependencies for the server.

4. Still in `Backend/`, run `node server.js`
