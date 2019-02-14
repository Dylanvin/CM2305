'use strict';
//Initialize libraries
const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

var db = admin.firestore();


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
    var inString = JSON.stringify(app.query);
    conv.close(inString);
  });

app.intent('language', (conv, {language}) => {
    conv.close(`Wow! I didn't know you knew ${language}!`);   //allows user to extract vars from user input. In this case language
  });

app.intent('module_lecturer', (conv, {Modules}) => {
    conv.close(`I don't know who lectures ${Modules}!`);
  });

app.intent('db_test', (conv, {test}) => {
    // Create a reference to the cities collection
    var testCol = db.collection('test col');

// Create a query against the collection
    var queryRef = testCol.where('TestQuery', '==', test);
    conv.close('Your query is in ' + queryRef);
});



exports.TutorFunctions = functions.https.onRequest(app);
