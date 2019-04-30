'use strict';

const functions = require('firebase-functions');
const { WebhookClient} = require('dialogflow-fulfillment');
//const { Carousel } = require('actions-on-google');

const admin = require('firebase-admin');
const moment = require('moment');
const runtimeOpts = {
    timeoutSeconds: 300,
    memory: '2GB'
};

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const Lecturer = require('./Lecturer/LecturerInfo.js');
const User = require('./Authentication/User.js');
const Auth = require('./Authentication/Auth.js');
const Lectures = require('./Student/Lectures.js')
const Meeting = require('./Student/Meeting.js')
const Event = require('./Global/Event.js')
const Library = require('./Global/Library.js')
const Nickname = require('./Student/Nickname.js')
const Module = require('./Lecturer/Module.js');
const Context = require('./Misc/Context.js');
const Timetable = require('./Student/Timetable.js');
const Weather = require('./WeatherAPI/weather.js');
const Who_is = require('./Lecturer/WhoIs.js');
const FBMessenger = require('fb-messenger')
const Broadcast = require('./Broadcast/Broadcast.js')
const Assignments = require('./Student/Assignment.js');
const Exams = require('./Student/Exams.js');

exports.dialogflowFirebaseFulfillment = functions.runWith(runtimeOpts).region('europe-west1').https.onRequest((request, response) => {
  try{
  const agent = new WebhookClient({ request, response });
}
catch(error){
    const messenger = new FBMessenger({token: 'EAAYy6wrtLUEBAI68xZAZCqvmrwkxBtbTUgL3gZAAHiHSGA0126LSQh6UM3HoYnVYMG7wDb4CdsUCKhZAf7raOKldczVNTMnxZBeMbv4OZBUemxnCNKU88QVEdkM0uop92HpuDveUvRZCKg4gZB0K98ZCz4wCHchCRTyACpLArcL4ZAWwZDZD'}) // Will always use this page's token for request unless sent on each method
    Broadcast.broadcastMsg(db, request, messenger, moment)
  //  messenger.sendTextMessage({id: '2288655187875159', text: 'YYYYYYYAAAAAAAAAAAAAAAAAAR'})
    return;

}
const agent = new WebhookClient({ request, response });
console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

function getModuleLecturer(agent) { // Who lectures this module
    return Module.getModuleLecturer(agent, db);
}

function getLecturerEmail(agent) {
    return Lecturer.getLecturerEmail(agent, db);
}

function getLecturerLocation() {
    return Lecturer.getLecturerLocation(agent, db);
}

function checkToken(agent){ //checks token given by user in token intent
    return Auth.checkToken(agent, db, request);
}

function Welcome(agent){ //Welcome intent ----- this intent is currently CRUCIAL for many other functions as it initialises important contexts
    return User.Welcome(agent, db, request);
}

function getNextLecture(agent) {
    return checkIntegrity(agent).then((res) => {
        if (res) {
        return Lectures.getNextLecture(agent, db);
        }
        else {
            return;
        }
    });
}
function bookMeetingInfo(agent){ //handles slot filling for the booking functionality
    return checkIntegrity(agent).then((res) => {
        if (res) {
        return Meeting.bookMeetingInfo(agent, db)
        }
        else {
            return;
        }
    });
}

function bookMeeting(agent){ //books the meeting - creates new events in student and staff timetable collections
    return checkIntegrity(agent).then((res) => {
        if (res) {
        return Meeting.bookMeeting(agent, db);
        }
        else {
            return;
        }
    });
}

function cancelBooking(agent){ //handles cancel booking intent - just clears contexts, should use context clearing function instead for consintency
    return checkIntegrity(agent).then((res) => {
        if (res) {
        return Meeting.cancelBooking(agent);
        }
        else {
            return;
        }
    });
}
function searchLibrary(agent){ //searches for a book in the Library collection
        return Library.searchLibrary(agent, db);
}

function searchEvents(agent){ //searches for upcoming events
    return Event.searchEvents(agent, db);
}


function changeNickname(agent){ //change the student's nickname
    return checkIntegrity(agent).then((res) => {
        if (res) {
        return Nickname.changeNickname(agent, db);
        }
        else {
            return;
        }
    });
}

function getTimetable(agent) {
    return checkIntegrity(agent).then((res) => {
        if (res) {
        return Timetable.getTimetable(agent);
        }
        else {
            return;
        }
    });
}

//function getCurrentWeather(agent)

function clearAll(agent) {
    return Context.clearAll(agent);
}

function checkIntegrity(agent){
    if ((agent.context.get("sessionvars")) && (agent.context.get("sessionvars").hasOwnProperty('parameters'))){
        return Promise.all([]);
    }
    else {
        return User.getStudent(agent, db, request).then((passed) => {
            if (passed) {
            return User.getName(agent, db).then(() => {
                return true;
            }).catch(err => console.log(err));
        } else {
                return false;
            }
        }).catch(err => console.log(err));
    }
}

function getWeather(agent) { // Depracated, we won't use this.
  return Weather.getWeather(agent);
}

function getWhoIs(agent) {
  return checkIntegrity(agent).then(() => {
    return Who_is.query(agent,db);
  });
}

function getAssignments(agent){
  return checkIntegrity(agent).then((res) => {
      if (res) {
      return Assignments.myAssignments(agent, db, moment);
      }
      else {
          return;
      }
  });
}

function getExams(agent){
    return checkIntegrity(agent).then((res) => {
        if (res) {
        return Exams.myExams(agent, db, moment);
        }
        else {
            return;
        }
    });
  }


  // Run the proper handler based on the matched Dialogflow intent
  let intentMap = new Map();
  intentMap.set('Module_lecturer', getModuleLecturer);    //CASE SENSITIVE: THIS HAS CASUED PAIN ALREADY
  intentMap.set('LecturerLocation', getLecturerLocation);
  intentMap.set('LecturerEmail', getLecturerEmail);
  intentMap.set('NextLecture', getNextLecture);
  intentMap.set('NextLecture-LecturerLocation', getLecturerLocation);
  intentMap.set('BookMeeting', bookMeetingInfo);
  intentMap.set('Bookmeeting-No', cancelBooking);
  intentMap.set('Bookmeeting-Yes', bookMeeting);
  intentMap.set('BookMeeting-Init', bookMeetingInfo);
  intentMap.set('BookSearch', searchLibrary);
  intentMap.set('Events', searchEvents);
  intentMap.set('CallMe', changeNickname);
  intentMap.set('Token', checkToken);
  intentMap.set('Welcome', Welcome);
  intentMap.set('clearall', clearAll);
  intentMap.set('Timetable', getTimetable);
  intentMap.set('Weather', getWeather);
  intentMap.set('Who_is?', getWhoIs);
  intentMap.set('Assignments', getAssignments);
  intentMap.set('Exams', getExams);
  intentMap.set('BookSearchFollowup', searchLibrary)
  agent.handleRequest(intentMap);
  });
