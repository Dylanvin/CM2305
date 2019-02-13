'use strict';
//Initialize libraries
const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');

const {
  SimpleResponse,
  BasicCard,
  Image,
  Suggestions,
  Button
} = require('actions-on-google');
// Instantiate a datastore client

const app = dialogflow({debug: true});
//app.middleware((conv) => {

//  });

app.intent('pls_help', (conv) => {
    const inString = app.query;
    conv.close(inString);
  });

app.intent('language', (conv, {language}) => {
    conv.close(`Wow! I didn't know you knew ${language}!`);   //allows user to extract vars from user input. In this case language
    });

exports.TutorFunctions = functions.https.onRequest(app);
