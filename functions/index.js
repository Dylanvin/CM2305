
'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const { Carousel } = require('actions-on-google');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

// URLs for images used in card rich responses
const imageUrl = 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png';
const imageUrl2 = 'https://lh3.googleusercontent.com/Nu3a6F80WfixUqf_ec_vgXy_c0-0r4VLJRXjVFF_X_CIilEu8B9fT35qyTEj_PEsKw';
const linkUrl = 'https://assistant.google.com/';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function lecture(agent) { // Lecture location
    agent.add("Not sure yet");
  }

  function module(agent) { // Who lectures this module
    const modulueNo = agent.parameters.Modules;
    agent.add(`I don't know who lectures ` + modulueNo);
  }

  function lecture_time(agent) { // Lecture time 
    const moduleNo = agent.parameters.Modules;
    agent.add('This lecture is some time in the future ');
  }

  // Run the proper handler based on the matched Dialogflow intent
  let intentMap = new Map();
  intentMap.set('Where_is_lecture', lecture);
  intentMap.set('module_lecturer', module);
  intentMap.set('When_is_lecture',lecture_time);


  agent.handleRequest(intentMap);
});
