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

    return db.collection('Modules').doc(moduleNo).get().then( (snapshot) => {
           agent.add(snapshot.data().Teacher);
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

//----------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------


function getStudent(agent) {
  var fbid = JSON.stringify(request.body.originalDetectIntentRequest.payload.data.sender.id);
  fbid = fbid.replace(/['"]+/g, '');
  var exists = false;
  return db.collection('Authenticated').get().then( (snapshot) => {
       snapshot.docs.forEach(doc => {
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
    if (exists) {
      return;
     }
    else {
       agent.context.delete("sessionvars");
       agent.add("Looks like this is your first time using the bot.");
        agent.add("What is your student number?");
        agent.context.set({
                     'name':'auth',
                     'lifespan': 3,
                     'parameters': {}
       });
    }
    return;
});
}

function checkToken(agent){
 var studentDocID;
 var token = agent.parameters.token;
 var SID = agent.context.get("sid").parameters.sid;
 var fbid = JSON.stringify(request.body.originalDetectIntentRequest.payload.data.sender.id);
 fbid = fbid.replace(/['"]+/g, '');
 var valid = false;
  return db.collection('Students').get().then( (snapshot) => {
       snapshot.docs.forEach(doc => {
         if ((doc.data().SID === SID) && doc.data().Token === token){
           valid = true;
           studentDocID = doc.id;
         }
       });
       return;
  }).then(t => {
           db.runTransaction(t => {
                 db.collection("Authenticated").doc(SID.toString()).set({
                       SID: SID,
                       FBID: fbid,
                   });
               });
               return;
    }).then(t => {
         db.runTransaction(t => {
                 db.collection("Students").doc(studentDocID.toString()).update({
                       Token: generateToken(8),
                   });
               });
               return;
     }).then(t => {
          agent.context.set({
            'name':'sessionvars',
            'lifespan': 50,
            'parameters': {
              'sid': SID
            }
            });
        agent.context.delete("auth");
        agent.context.delete("token");
        agent.context.delete("sid");
          agent.add("Uni account linked successfully.");
          return;
     }).catch(function(err) {
        console.log(err);
      });
}

function generateToken(length){
 var token = "";
 var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 for (var i = 0; i < length; i++)
   token += chars.charAt(Math.floor(Math.random() * chars.length));

 return token;
}
function getName(agent){
     var nickname;
    var SID = agent.context.get("sessionvars").parameters.sid;
     return db.collection('Students').get().then( (snapshot) => {
       return snapshot.docs.forEach(doc => {
         if (doc.data().SID === SID) {
             nickname = doc.data().Nickname;
         }
       });
     }).then(e => {
         agent.context.set({
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

function Welcome(agent){
     return getStudent(agent).then((e) => {
      if (agent.context.get("sessionvars")) {
        if (agent.context.get("sessionvars").hasOwnProperty('parameters')) {
          return getName(agent).then((f) => {
           agent.add("Welcome " + agent.context.get("sessionvars").parameters.nickname + "! What would you like to know?");
           return;
       });
      }
      }
      return;
    });
}

function verify(agent){
  if (!(agent.context.get("sessionvars"))) {
     return getStudent(agent).then((e) => {
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
       lecturer = agent.parameters.lecturer.toLowerCase();
   }
   if (agent.parameters.c_lecturer){
       c_lecturer = agent.parameters.c_lecturer.toLowerCase(); //contextual lecturer name - If wrong intent is triggered.
   }
   if (!agent.parameters.lecturer && !agent.parameters.c_lecturer) {
       agent.add("Sorry I can't help.");
       return;
   }

   return db.collection('Staff').get().then( (snapshot) => {
       snapshot.docs.forEach(doc => {
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
// return db.collection('Students').doc(SID.toString()).get().then( (dc) => {
     //modules = dc.get("Modules");
   //}).then( a =>

function getNextLecture(agent) {
   var smodules;
   var namedModule = false;
   var module;
   var SID = agent.context.get("sessionvars").parameters.sid;
   if (agent.parameters.Module){
       module = agent.parameters.Module.toLowerCase();
       namedModule = true;
   }

   var min = -1;
   var minID;

   return db.collection('Students').doc(SID.toString()).get().then( (dc) => {
     smodules = dc.get("Modules");
     return;
   }).then( a =>

   db.collection('Timetable').get().then( (snapshot) => {
   snapshot.docs.forEach(doc => {
       var time = doc.data().Time;
       var caseModule = doc.data().Module.toLowerCase();
       var caseTitle = doc.data().Title.toLowerCase();
       if ((namedModule && !((caseModule === module) || (caseTitle === module)) ) || !(smodules.includes(doc.data().Module))) {
           return;
       }
       if (min === -1) {
           min = time;
           minID = doc.id;
       }
       else {
           if (time < min) {
               min = time;
               min = time;
               minID = doc.id;
           }
       }
   });

   var response = "Sorry, I can't find the lecture you're looking for.";

   snapshot.docs.forEach(doc => {
       if (doc.id === minID) {
           var date = doc.data().Time.toDate();
           var today = new Date();
           var formatted;
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
           agent.context.set({
                 'name':'nextlecture-followup',
                 'lifespan': 2,
                 'parameters':{
                 'name': doc.data().Lecturer
                   }
              });
       }
   });
   agent.add(response);
   return;
   }
));
}

function bookMeetingInfo(agent){
   var recipient, date, time;
   if (agent.context.get("bookmeeting")) {
       if (agent.parameters.recipient) {
           let oldvar = agent.parameters._recipient;
           if ((agent.parameters.recipient !== oldvar && agent.parameters.modifier && agent.parameters.recipientsyn) || oldvar === "") {
               recipient = agent.parameters.recipient;
           }
           else {
               recipient = oldvar;
           }
       }
       if (agent.parameters.date) {
           let oldvar = agent.parameters._date;
           if ((agent.parameters.date !== oldvar && agent.parameters.modifier && agent.parameters.datesyn) || oldvar === "") {
               date = agent.parameters.date;
           }
           else {
               date = oldvar;
           }
       }
       if (agent.parameters.time) {
           let oldvar = agent.parameters._time;
           if ((agent.parameters.time !== oldvar && agent.parameters.modifier && agent.parameters.timesyn) || oldvar === "") {
               time = agent.parameters.time;
           }
           else {
               time = oldvar;
           }
       }
   }
   else { //if no context exists yet (only triggered during bookmeeting-init intent)
       if (!agent.parameters.Appointment) {
           agent.add("Sorry I don't understand.");
           return;
       }
       if (agent.parameters.recipient){
           recipient = agent.parameters.recipient;
       }
       if (agent.parameters.date){
           date = agent.parameters.date;
       }
       if (agent.parameters.time) {
           time = agent.parameters.time;
       }
   }
      var found = false;
      return db.collection('Staff').get().then( (snapshot) => {
      if (recipient){
          snapshot.docs.forEach(doc => {
           if (doc.data().Name.toLowerCase() === recipient.toLowerCase()) {
               found = true;
           }
       });
       }

   if (recipient && !found){
       agent.add("Recipient does not exist! Please enter a valid name.");
       recipient = "";
       agent.context.delete("bookmeeting");
       agent.context.set({
                 'name':'bookmeeting',
                 'lifespan': 10,
                 'parameters':{
                 'recipient': recipient,
                 'date': date,
                 'time': time
               }
       });

   }
   else if (recipient && date && time) {
   agent.add("Just to confirm. You want to book an appointment with " + recipient + " on "  + date.split('T')[0] + " at " + time.split('T')[1].split('+')[0] + "?");
   agent.context.set({
                 'name':'bookmeetingConfirm',
                 'lifespan': 1,
                 'parameters':{
                 'recipient': recipient,
                 'date': date,
                 'time': time
               }
               });
   }
   else if (recipient && date) {
       agent.add("Great. What time?");
       agent.context.delete("bookmeeting");
       agent.context.set({
                 'name':'bookmeeting',
                 'lifespan': 10,
                 'parameters':{
                 'recipient': recipient,
                 'date': date,
                 'time': time
               }
               });
   }
   else if (recipient) {
       agent.add("Great. What date?");
       agent.context.delete("bookmeeting");
       agent.context.set({
                 'name':'bookmeeting',
                 'lifespan': 10,
                 'parameters':{
                     'recipient': recipient,
                     'date': date,
                     'time': time
                    }
               });
   }
   else {
       agent.add("Great. Who with?");
       agent.context.delete("bookmeeting");
       agent.context.set({
                 'name':'bookmeeting',
                 'lifespan': 10,
                 'parameters':{
                    'recipient': recipient,
                   'date': date,
                   'time': time
                    }
                   });
     }
     return;
  });
}


function bookMeeting(agent){
   var SID = agent.context.get("sessionvars").parameters.sid;
   var docId;
   var response;
   var found = false;
   //var recAvailable = true;
   //var stuAvailable = true;
   const dateTime = convertParametersDate(agent.parameters.date, agent.parameters.time);  //split('T')[0]
   var recipient = agent.parameters.recipient;
   return db.collection('Staff').get().then( (snapshot) => {
       snapshot.docs.forEach(doc => {
         if (found) {
           return;
         }
         if (recipient.toLowerCase() === doc.data().Name.toLowerCase()){
           docId = doc.id;
           found = true;
         }
        });
        return;
   }).then( rec => {
    //agent.context.delete("bookmeeting");
    //db.collection('Staff').doc(docId).collection('Timetable').get().then( (snapshot) => {
       //snapshot.docs.forEach(doc => {
   //	if (recAvailable && (doc.data().Date.toDate().getTime() ==== dateTime.getTime())) {
            // console.log("X");
            // recAvailable = false;
            // console.log("rec goes false");
            // return;
          // }
      // });
   // });
  // }).then( cli => {
    //db.collection('Students').doc(SID.toString()).collection('Timetable').get().then( (snapshot) => {
       //snapshot.docs.forEach(doc => {
     //if (stuAvailable && (doc.data().Date.toDate().getTime() ==== dateTime.getTime())) {
          //   stuAvailable = false;
            // console.log("stu goes false");
           //}
      // });
    //});
 //  }).then(edi => {
     //if (stuAvailable && recAvailable) {
         db.runTransaction(t => {
                 db.collection("Students").doc(SID.toString()).collection('Timetable').add({
                       Date: dateTime,
                       Description: ("Meeting with " + recipient),
                 Location: (recipient + "'s office")
                   });
         });
         return;
    }).then(eds => {
    // if (stuAvailable && recAvailable) {
        db.runTransaction(t => {
                 db.collection("Staff").doc(docId).collection('Timetable').add({
                       Date: dateTime,
                       Description: ("Meeting with " + agent.context.get("sessionvars").parameters.nickname),
                 Location: (recipient + "'s office")
                   });
               });
               return;
   }).then(fin => {
       //console.log("stu: " + stuAvailable);
      // console.log("rec: " + recAvailable);
       //if (!stuAvailable) {
       //	agent.add("You are already booked on that date/time.");
      // } else if (!recAvailable) {
        //	agent.add("The recipient is already booked on that date/time.");
      // } else {
         agent.add("Meeting succesfully booked.");
         return;
     //  }
    }).catch(err => {
     console.log(err);
   });
}

function cancelBooking(agent){
   var name = "";
   if (agent.context.get("sessionvars")) {
       name = ", " + agent.context.get("sessionvars").parameters.nickname;
       agent.context.delete("bookmeeting");
       agent.add("Okay" + name + ".");
   }
   else {
       return getName(agent).then((doc) => {
           name = ", " + agent.context.get("sessionvars").parameters.nickname;
           agent.context.delete("bookmeeting");
           agent.add("Okay" + name + ".");
           return;
   });
}
}

function searchLibrary(agent){
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

function searchEvents(agent){
    var numToID = {};
    agent.add("Upcoming events: \n");
    var count = 1;
    return db.collection('Events').get().then( (snapshot) => {
        snapshot.docs.forEach(doc => {
            agent.add(count + ". " + doc.data().Title + '\n');
            numToID[count.toString()] = doc.data().ID;
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

   if (agent.parameters.eventListNumber) {
       event = agent.parameters.eventListNumber;
       ID = true;
       IDmap = agent.context.get('events').parameters;
   }
   else if (agent.parameters.eventTitle) {
       event = agent.parameters.eventTitle.toLowerCase();
   }
   else {
       agent.add("Sorry I don't know about that event.");
   }

   return db.collection('Events').get().then( (snapshot) => {
        snapshot.docs.forEach(doc => {
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

function changeNickname(agent){
   verify(agent);
   var nickname = agent.parameters.name;
   var SID = agent.context.get("sessionvars").parameters.sid;
   const databaseEntry = agent.parameters.databaseEntry;
   return db.runTransaction(t => {
     db.collection('Students').doc(SID.toString()).update({
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
     agent.add("Okay. I'll call you " + nickname + " from now on!");
     return;
   }).catch(err => {
     agent.add("Sorry I can't do that right now.");
     console.log(err);
   });


}

function convertParametersDate(date, time){
   var newDate = new Date(Date.parse(date.split('T')[0] + 'T' + time.split('T')[1]));
   return newDate;
}

function addHours(dateObj, hoursToAdd){
   return new Date(new Date(dateObj).setHours(dateObj.getHours() + hoursToAdd));
}

function getLocaleTimeString(dateObj){
 return dateObj.toLocaleTimeString('en', { hour: 'numeric', hour12: true });
}

function getLocaleDateString(dateObj){
 return dateObj.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
}


function zTime(n) {
 return (n < 10 ? '0' : '') + n;
}

function clearContext(agent, contextname) {
 agent.context.set({
                     'name': contextname,
                     'lifespan': 0,
                     'parameters': {}
 });
 agent.context.delete(contextname);
}

function clearAll(agent) {
 clearContext(agent, "sessionvars");
 clearContext(agent, "auth");
 clearContext(agent, "token");
 clearContext(agent, "sid");
 agent.add("Cleared");
}

  // Run the proper handler based on the matched Dialogflow intent
  let intentMap = new Map();
  //intentMap.set('Where_is_lecture', lecture);
  intentMap.set('Module_lecturer', moduleL);        //CASE SENSITIVE: THIS HAS CASUED PAIN ALREADY
  intentMap.set('db_test', readFromDb);
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
  intentMap.set('clearall', clearAll);
//  intentMap.set('When_is_lecture',lecture_time);
  agent.handleRequest(intentMap);
  });
