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
var mailer = require('./mailer.js');
const lecturerInfo = require('./getLecturerInfo.js');
const getStudentInfo = require('./getStudent.js');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function moduleL(agent) { // Who lectures this module
    const moduleNo = agent.parameters.Modules;

    return db.collection('Modules').doc(moduleNo).get().then( (snapshot) => {
           agent.add(snapshot.data().Module_Leader + " is the module leader for this module.");
         return;
    });
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

  function getLecturerEmailFunc(lecturerName) {
    return lecturerInfo.getLecturerEmail(lecturerName.toLowerCase());
  }
  function getLecturerLocationFunc(lecturerName) {
    return lecturerInfo.getLecturerLocation(lecturerName.toLowerCase());
  }

 function getStudent(agent) { //get student ID and save it into a context (sessionvars)
   getStudentInfo.getS(agent, db, request)
 }

   /*
  var fbid = JSON.stringify(request.body.originalDetectIntentRequest.payload.data.sender.id); //get messenger FBID
  fbid = fbid.replace(/['"]+/g, '');
  var exists = false;
  return db.collection('Authenticated').get().then( (snapshot) => { //check each doc in Authenticated
       snapshot.docs.forEach(doc => { //if the user's FBID exists in a doc, get the corresponding SID
         if (doc.data().FBID === fbid) {
           agent.context.set({
                     'name':'sessionvars',
                     'lifespan': 50,
                     'parameters': {
                      'sid': doc.data().SID
                     }
         });
           exists = true;
         }

       });
    if (exists) { //if the SID has been found, return.
      return;
     }
    else { //initialising authentication with student
       agent.context.delete("sessionvars");
       agent.add("Looks like this is your first time using the bot.");
        agent.add("What is your student number?");
        agent.context.set({ //set auth context ready for next intent.
                     'name':'auth',
                     'lifespan': 3,
                     'parameters': {}
       });
    }
    return;
});
}

function checkToken(agent){ //checks token given by user in token intent
 var studentDocID;
 var token = agent.parameters.token; //get token value from most recent context (token)
 var SID = agent.context.get("sid").parameters.sid; //get student ID from SID context
 var fbid = JSON.stringify(request.body.originalDetectIntentRequest.payload.data.sender.id); //get FBID from messenger
 fbid = fbid.replace(/['"]+/g, '');
 var valid = false;
  return db.collection('Students').get().then( (snapshot) => { //check each student document
       snapshot.docs.forEach(doc => {
         if ((doc.data().SID === SID) && doc.data().Token === token){ //if the SID and token match, correct student has been found
           valid = true;
           studentDocID = doc.id;
         }
       });
       return;
  }).then(t => {
           db.runTransaction(t => { //run firebase transaction:
                 db.collection("Authenticated").doc(SID.toString()).set({ //create a new document in Authenticated using verified values
                       SID: SID,
                       FBID: fbid,
                   });
               });
               return;
    }).then(t => {
         db.runTransaction(t => {
                 db.collection("Students").doc(studentDocID.toString()).update({ //generate a new random token for the student
                       Token: generateToken(8),
                   });
               });
               return;
     }).then(t => {
          agent.context.set({ //set sessionvars context storing the SID
            'name':'sessionvars',
            'lifespan': 50,
            'parameters': {
              'sid': SID
            }
            });
        agent.context.delete("auth"); //reset contexts
        agent.context.delete("token");
        agent.context.delete("sid");
          agent.add("Uni account linked successfully.");
          return;
     }).catch(function(err) {
        console.log(err);
      });
}

function generateToken(length){ //generates a random string
 var token = "";
 var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 for (var i = 0; i < length; i++)
   token += chars.charAt(Math.floor(Math.random() * chars.length));

 return token;
}

function getName(agent){ //gets the nickname of the student and stores into sessionvars context
     var nickname;
    var SID = agent.context.get("sessionvars").parameters.sid;
     return db.collection('Students').get().then( (snapshot) => { //iterating through student docs
       return snapshot.docs.forEach(doc => {
         if (doc.data().SID === SID) { //finds matching SID -- this should probably be directly referenced rather than involve looping
             nickname = doc.data().Nickname;
         }
       });
     }).then(e => {
         agent.context.set({ //updating context with nickname value
                         'name':'sessionvars',
                         'lifespan': 50,
                         'parameters': {
                           'nickname': nickname,
                        'sid': SID
                         }
           });
           return;
     }).catch(err => {
       console.log(err);
     });
}

function Welcome(agent){ //Welcome intent ----- this intent is currently CRUCIAL for many other functions as it initialises important contexts
     return getStudent(agent).then((e) => {  // ---- if code has recently been deployed, the sessionsvars may be wiped from messenger session
      if (agent.context.get("sessionvars")) { // ---- therefore you'll need to say 'hey'/'hi' to recall this intent/function and get back the context.
        if (agent.context.get("sessionvars").hasOwnProperty('parameters')) { // //if session vars has been initialised properly (exists and has parameters), then:
          return getName(agent).then((f) => { //get student nickname
           agent.add("Welcome " + agent.context.get("sessionvars").parameters.nickname + "! What would you like to know?");
           return;
       });
      }
      }
      return;
    });
}

function verify(agent){ //current unused, was going to be used to force reverification in case of accidentally losing session contexts
  if (!(agent.context.get("sessionvars"))) { //similar to welcome function in structure
     return getStudent(agent).then((e) => { //gets student id -> gets student nickname using promise chains.
      if (agent.context.get("sessionvars") && (agent.context.get("sessionvars").hasOwnProperty('parameters')) && (agent.context.get("sessionvars").parameters.hasOwnProperty('nickname'))) {
          getName(agent);
      }
      return;
    });
  }
}

//begin intent functions
function getLecturerLoc(agent) {
   var lecturer;
   var c_lecturer;
   var found = false;

   if (agent.parameters.lecturer){
       lecturer = agent.parameters.lecturer.toLowerCase(); //lecturer name given by user
   }
   if (agent.parameters.c_lecturer){
       c_lecturer = agent.parameters.c_lecturer.toLowerCase(); //contextual lecturer name - If next-lecture-follow intent is triggered.
   }
   if (!agent.parameters.lecturer && !agent.parameters.c_lecturer) {
       agent.add("Sorry I can't help.");
       return;
   }

   return db.collection('Staff').get().then( (snapshot) => {
       snapshot.docs.forEach(doc => { //iterate through Staff docs until teacher name is matched
           if (doc.data().Name.toLowerCase() === lecturer || doc.data().Name.toLowerCase() === c_lecturer ) {
               var response = doc.data().Name + "'s office is located in " + doc.data().Location;
               agent.add(response);
               found = true;
           }
       });

       if (!found){
       agent.add("Sorry I don't know who you're talking about.");
     }
     return;
   });
}
function getNextLecture(agent) {
   var smodules;
   var namedModule = false; //used to determine whether a module name was given
   var module;
   var SID = agent.context.get("sessionvars").parameters.sid;
   if (agent.parameters.Module){ //if the user has specified a module, it wil be saved in this paramater (Module)
       module = agent.parameters.Module.toLowerCase();
       namedModule = true;
   }

   var min = -1; //used to compare lowest timestamp value and current timestamp value
   var minID; //document ID with the lowest timestamp value (i.e next lecture)

   return db.collection('Students').doc(SID.toString()).get().then( (dc) => {
     smodules = dc.get("Modules"); //gets the modules the student is enrolled on.
     return;
   }).then( a =>

   db.collection('Timetable').get().then( (snapshot) => {
   snapshot.docs.forEach(doc => { //iterate through lectures
       var time = doc.data().Time;
       var caseModule = doc.data().Module.toLowerCase();
       var caseTitle = doc.data().Title.toLowerCase();
    // if (a module name is given but current lecture does not match it) or (the module is not included in the student's enrolled modules)
       if ((namedModule && !((caseModule === module) || (caseTitle === module)) ) || !(smodules.includes(doc.data().Module))) {
           return;
       }
       if (min === -1) { //if it's first lecture that fullfils above criteria
           min = time; //store the lecture's time as the closest
           minID = doc.id; //store the lecture doc ID as the closest
       }
       else {
           if (time < min) { //if current doc has a closer timestamp then
               min = time; //same as above
               minID = doc.id;
           }
       }
   });

   var response = "Sorry, I can't find the lecture you're looking for.";

   snapshot.docs.forEach(doc => { //THIS NEEDS FIXING - don't need to iterate through the documents when I already have the DOC ID
       if (doc.id === minID) { //use direct referencing instead! todo
           var date = doc.data().Time.toDate(); //convert document timestamp into JS date object
           var today = new Date(); //today's date
           var formatted; //some bools to determine how the date is relative to today's date
           var sameDay = false;
           var sameWeek = false;
           var sameYear = false;

           if (date.getFullYear() === today.getFullYear()) {
               sameYear = true;
           }
           if ((date.getMonth() === today.getMonth()) && sameYear && date.getDate() >= today.getDate() && ((date.getDate() - today.getDate()) <= 7)) {
               sameWeek = true;
           }
           if (sameWeek && (date.getDate() === today.getDate())) {
               sameDay = true;
           }
           if ((date.getMonth() === today.getMonth()) && (date.getFullYear() === today.getFullYear())
           && date.getDate() >= today.getDate() && ((date.getDate() - today.getDate()) <= 7)) {
               sameWeek = true;
           }
           if (sameDay) {
               formatted = " today at " + date.getHours() + ":" + date.getMinutes();
           }
           else if (sameWeek) {
               formatted = " this " + date.toLocaleDateString('en', {weekday: 'long'}) + " at " + zTime(date.getHours()) + ":" + zTime(date.getMinutes());
           }
           else if (sameYear) {
               formatted = " on " + date.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric'}) + " at " + zTime(date.getHours()) + ":" + zTime(date.getMinutes());
           }
           else {
                formatted = " on " + date.toLocaleDateString('en', { weekday: 'long',  year: 'numeric', month: 'long', day: 'numeric'}) + " at " + zTime(date.getHours()) + ":" + zTime(date.getMinutes());
           }
           if (namedModule) {
               response = "Your next " + doc.data().Title + " lecture is" + formatted + " in " + doc.data().Room + " with " + doc.data().Lecturer + ".";
           }
           else {
               response = "Your next lecture is " + doc.data().Title + formatted +  " in " + doc.data().Room + " with " + doc.data().Lecturer + ".";
           }
           agent.context.delete("nextlecture-followup");
           agent.context.set({ //create a new context storing the lecturer's name, used for follow up intent ("where is that lecturers office?")
                 'name':'nextlecture-followup',
                 'lifespan': 2,
                 'parameters':{
                 'name': doc.data().Lecturer
                   }
              });
       }
   });
   agent.add(response); //add the formatted response to the agent
   return;
   }
));
}
function searchLibrary(agent){ //searches for a book in the Library collection
   if (agent.parameters.bookname){
       var bookname = agent.parameters.bookname;
       var found = false;
   return db.collection('Books').get().then( (snapshot) => {
          snapshot.docs.forEach(doc => {
           if (doc.data().Title.toLowerCase() === bookname.toLowerCase()) {
               found = true;
               if (doc.data().Availablity === true || doc.data().Availablity === "true") {
                   agent.add(doc.data().Title + " is available in the " + doc.data().Library + " library");
               }
               else {
                   agent.add(doc.data().Title + " is not available.");
               }
           }
          });
          if (!found){
              agent.add("Book could not be found.");
          }
          return;
   });
   }

}

function searchEvents(agent){ //searches for upcoming events
    var numToID = {};
    agent.add("Upcoming events: \n");
    var count = 1;
    return db.collection('Events').get().then( (snapshot) => {
        snapshot.docs.forEach(doc => { //loops through all events (would be way too many events in real life application so maybe improve)
            agent.add(count + ". " + doc.data().Title + '\n'); //lists the events using arbitrary numbers starting at 1.
            numToID[count.toString()] = doc.data().ID; //link the above number with the event ID, stored in an array [used later]
            count++;
        });
        agent.context.set({
                 'name':'events',
                 'lifespan': 5,
                 'parameters': numToID
        });
        return;
    });

}

function eventDetails(agent){
   var event;
   var ID = false;
   var IDmap = {};
   var found = false;

   if (agent.parameters.eventListNumber) { //if the user mentioned the event number ("tell me more about event 1")
       event = agent.parameters.eventListNumber; //get the number
       ID = true;
       IDmap = agent.context.get('events').parameters; //get the IDmap array from previous intent
   }
   else if (agent.parameters.eventTitle) { //if the user mentioned the event title ("tell me about carol singing")
       event = agent.parameters.eventTitle.toLowerCase();
   }
   else {
       agent.add("Sorry I don't know about that event.");
   }

   return db.collection('Events').get().then( (snapshot) => {
        snapshot.docs.forEach(doc => {
            // checks if either the ID exists in the ID map or if the title of the event matches
            if (ID && doc.data().ID === IDmap[event.toString()] || !ID && doc.data().Title.toLowerCase().indexOf(event) !== -1) {
                agent.add(doc.data().Title);
                agent.add(doc.data().Description);
                agent.add(new Date(doc.data().Date).toLocaleDateString('en', { year: 'numeric', month: 'numeric', day: 'numeric' }));
                found = true;
            }
        });
        if (!found) {
            agent.add("Sorry I don't know anything about that event.");
        }
        return;
   });
}

function changeNickname(agent){ //change the student's nickname
   verify(agent);
   var nickname = agent.parameters.name;
   var SID = agent.context.get("sessionvars").parameters.sid;
   const databaseEntry = agent.parameters.databaseEntry;
   return db.runTransaction(t => {
     db.collection('Students').doc(SID.toString()).update({ //updates the nickname value using the one given by user
                               Nickname: nickname
   });
   agent.context.delete("sessionvars");
   agent.context.set({'name': 'sessionvars', 'lifespan': 0});
   agent.context.set({
                 'name':'sessionvars',
                 'lifespan': 50,
                 'parameters': {
                    'nickname': nickname,
                    'sid': SID
                 }
   });
     return Promise.resolve('Write complete');
   }).then(doc => {
     agent.add("Okay. I'll call you " + nickname + " from now on!"); //successful
     return;
   }).catch(err => {
     agent.add("Sorry I can't do that right now."); //not successful, 98% caused by the sessionvars context no longer being active because of reset
     console.log(err);
   });


}

function convertParametersDate(date, time){ //conerts date and time into JS date object
   var newDate = new Date(Date.parse(date.split('T')[0] + 'T' + time.split('T')[1]));
   return newDate;
}

function addHours(dateObj, hoursToAdd){ //unused
   return new Date(new Date(dateObj).setHours(dateObj.getHours() + hoursToAdd));
}

function getLocaleTimeString(dateObj){ //unused
 return dateObj.toLocaleTimeString('en', { hour: 'numeric', hour12: true });
}

function getLocaleDateString(dateObj){ //unused
 return dateObj.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
}

function zTime(n) { //used to append zeros to low numbers
 return (n < 10 ? '0' : '') + n;
}

function clearContext(agent, contextname) { //used to clear contexts properly, this should always be used instead of just using .delete
 agent.context.set({
                     'name': contextname,
                     'lifespan': 0,
                     'parameters': {}
 });
 agent.context.delete(contextname);
}
/*
function nextExam( agent ) { // Created by Rhys 25.02.19 // Last updated 25.02.19

  // Recycled some of Joe's code but stopped further development as the code may be overhauled.
  // Need to add exam numbers entities.
  // May take a different approach and base this using the module entity and use the module code to determine the exam.

  var examSpecified = false; // Determines whether the next exam is specified or not when parsed to this function.
  var exam;
  var examList;
  var SID = agent.context.get("sessionvars").parameters.sid; // Get student ID from context parameters.
  var minTime = -1; //used to compare lowest timestamp value and current timestamp value
  var minDocumentID; //document ID with the lowest timestamp value (i.e next lecture)
  // Check if the next exam was specified
  if (agent.parameters.Exam) {
      // Update parameters with the specified exam, and update examSpecified now that we know what the next exam is.
       exam = agent.parameters.Exam.toLowerCase();
       examSpecified = true;
  }
  // Search FireBase for the document with the next exam. This is done by getting the student ID and checking the Exams collection within
  // that student.
  return db.collection('Students').doc(SID.toString()).get().then( (dc) =>  {
    examList = dc.get("Exams"); // Get exams the student currently takes
    return;
  }).then( a =>
  db.collection('Exams').get().then( ( snapshot ) => {
    snapshot.docs.forEach(doc => { // Iterate through each exam document in the Student's list of exams.
      var examTime = doc.data().Time;
      var examCode = doc.data().Module.toLowerCase();
      var examTitle = doc.data().Title.toLowerCase();
      if ( (examSpecified && !(examCode === exam) || (examTitle == exam)) || (examList.includes(doc.data().Exam)) ) {
        return; // Return nothing as the specified exam doesnt exist.
      }
      if ( minTime === -1) {
        minTime = examTime;
        minDocumentID = doc.id;
      }
      else {
        if ( examTime < minTime ) {
          minTime = examTime;
          minDocumentID = doc.id;
        }
      }
    });
  });
}
*/
function mailerFunc(){
  mailer.Email = "test"
  mailer.theMailer( "Dylan", "vincentd1@cardiff.ac.uk", "bobf@gmail.com", "bob", "c231242", "monday 25th 10am");
  agent.add("Email sent!");
}


function clearAll(agent) { //clear all authentication-related contexts
 clearContext(agent, "sessionvars");
 clearContext(agent, "auth");
 clearContext(agent, "token");
 clearContext(agent, "sid");
 agent.add("Cleared");
}

  // Run the proper handler based on the matched Dialogflow intent
  let intentMap = new Map();
  intentMap.set('Module_lecturer', moduleL);        //CASE SENSITIVE: THIS HAS CASUED PAIN ALREADY
  /*
  intentMap.set('LecturerLocation', getLecturerLoc);
  intentMap.set('NextLecture', getNextLecture);
  intentMap.set('NextLecture-LecturerLocation', getLecturerLoc);
  intentMap.set('BookMeeting', bookMeetingInfo);
  intentMap.set('Bookmeeting-No', cancelBooking);
  intentMap.set('Bookmeeting-Yes', bookMeeting);
  intentMap.set('BookMeeting-Init', bookMeetingInfo);
  intentMap.set('BookSearch', searchLibrary);
  intentMap.set('Events', searchEvents);
  intentMap.set('EventDetails', eventDetails);
  intentMap.set('CallMe', changeNickname);
  intentMap.set('Welcome', Welcome);
  intentMap.set('Token', checkToken);
  */
  intentMap.set('clearall', clearAll);
  intentMap.set('mail', mailerFunc);
  //intentMap.set('Exams',nextExam);
  agent.handleRequest(intentMap);
  });
