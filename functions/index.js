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
    conv.close("Have a good day!");
  });

exports.TutorFunctions = functions.https.onRequest(app);
