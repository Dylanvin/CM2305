'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const { Carousel } = require('actions-on-google');
const admin = require('firebase-admin');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const mTeacher = db.collection('Modules').doc('CM1101');


exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  //
  // function lecture(agent) { // Lecture location
  //   agent.add("Not sure yet.");
  //   agent.add("test");
  // }

  function moduleL(agent) { // Who lectures this module
    const moduleNo = agent.parameters.Modules;

    mTeacher.onSnapshot(doc => {
      const data = doc.data();
      agent.add(data.Teacher)
    }

    )
  }

  function readFromDb (agent) {
       // Get the database collection 'test col' and document 'test doc'
       const dialogflowAgentDoc = db.collection('test col').doc('test doc');

       // Get the value of 'TestQuery' in the document and send it to the user
        return dialogflowAgentDoc.get()
            .then(doc => {
                if (!doc.exists) {
                    agent.add('No data found in the database!');
                } else {
                    agent.add(doc.get('TestQuery'));
                }
                return Promise.resolve('Read complete');
            }).catch(() => {
                agent.add('Error reading entry from the Firestore database.');
                agent.add('Please add a entry to the database first by saying, "Write <your phrase> to the database"');
            });
    }
  // function lecture_time(agent) { // Lecture time
  //   //Find next lecture in timetable using moduleNo and current time
  //   //Get the time of the next lecture and assign as a constant
  //   var currentDay = "";
  //   switch (new Date().getDay()) {
  //     case 0:
  //       currentDay = "Sunday";
  //       break;
  //     case 1 :
  //       currentDay = "Monday";
  //       break;
  //     case 2 :
  //       currentDay = "Tuesday";
  //       break;
  //     case 3 :
  //       currentDay = "Wednesday";
  //       break;
  //     case 4 :
  //       currentDay = "Thursday";
  //       break;
  //     case 5 :
  //       currentDay = "Friday";
  //       break;
  //     case 6 :
  //       currentDay = "Saturday";
  //       break;
  //   }
  //   const currentTime = new Date().getHours();
    // Check DB for next lecture
    /*                                                            REQUIRES BACK-END IMPLEMENTATION
    const accessMe = db.collection('Timetable').doc(currentDay);
    var nextLecture = accessMe.get().then(function(currentDay) {
        if (currentDay.exists) {
          // Retrieve data; module;time;location
          agent.add('Your next lecture is at $TIME in $LOCATION  for the module $MODULE ');
        } else {
          // Doc not found
          agent.add('No lecture found. Please report this to university administrators');
        }
    }).catch(() =>{
      agent.add('An error occured. Please report this to the university administrators');
    });

    */
    // Check what the next lecture is.
   //agent.add('This lecture is some time in the future. The current day is : ' + currentDay + ' and the current hour is: ' + currentTime );

  // Run the proper handler based on the matched Dialogflow intent
  let intentMap = new Map();
  //intentMap.set('Where_is_lecture', lecture);
  intentMap.set('Module_lecturer', moduleL);        //CASE SENSITIVE: THIS HAS CASUED PAIN ALREADY
  intentMap.set('db_test', readFromDb);
//  intentMap.set('When_is_lecture',lecture_time);
  agent.handleRequest(intentMap);
  });
