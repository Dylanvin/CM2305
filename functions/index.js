'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const { Carousel } = require('actions-on-google');
const admin = require('firebase-admin');

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
const Weather = require('./Misc/Weather.js');
const Who_is = require('./Lecturer/WhoIs.js');

exports.dialogflowFirebaseFulfillment = functions.runWith(runtimeOpts).https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

function getModuleLecturer(agent) { // Who lectures this module
   return Module.getModuleLecturer(agent, db)
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
   return Lectures.getNextLecture(agent, db)
}
function bookMeetingInfo(agent){ //handles slot filling for the booking functionality
    return Meeting.bookMeetingInfo(agent, db);
}

function bookMeeting(agent){ //books the meeting - creates new events in student and staff timetable collections
    return  Meeting.bookMeeting(agent, db);
}

function cancelBooking(agent){ //handles cancel booking intent - just clears contexts, should use context clearing function instead for consintency
    return Meeting.cancelBooking(agent);
}
function searchLibrary(agent){ //searches for a book in the Library collection
    return Library.searchLibrary(agent, db);
}

function searchEvents(agent){ //searches for upcoming events
    return Event.searchEvents(agent, db)
}

function eventDetails(agent){
    return Event.eventDetails(agent, db)
}

function changeNickname(agent){ //change the student's nickname
   return Nickname.changeNickname(agent, db)
}

function getTimetable(agent) {
    return Timetable.getTimetable(agent);
}

function clearAll(agent) {
   return Context.clearAll(agent);
}
function getWeather(agent) {
  return Weather.getWeather(agent);
}
function getWhoIs(agent) {
  return Who_is.query(agent,db);
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
  intentMap.set('EventDetails', eventDetails);
  intentMap.set('CallMe', changeNickname);
  intentMap.set('Token', checkToken);
  intentMap.set('Welcome', Welcome);
  intentMap.set('clearall', clearAll);
  intentMap.set('Timetable', getTimetable);
  intentMap.set('Weather', getWeather);
  intentMap.set('Who_is?', getWhoIs);
  //intentMap.set('Exams',nextExam);
  agent.handleRequest(intentMap);
  });
