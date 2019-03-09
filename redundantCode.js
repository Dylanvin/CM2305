// 1 
function lecture(agent) { // Lecture location
  agent.add("Not sure yet.");
  agent.add("test");
}
// 2
function lecture_time(agent) { // Lecture time
  //Find next lecture in timetable using moduleNo and current time
  //Get the time of the next lecture and assign as a constant
  var currentDay = "";
  switch (new Date().getDay()) {
    case 0:
      currentDay = "Sunday";
      break;
    case 1 :
      currentDay = "Monday";
      break;
    case 2 :
      currentDay = "Tuesday";
      break;
    case 3 :
      currentDay = "Wednesday";
      break;
    case 4 :
      currentDay = "Thursday";
      break;     
    case 5 :
        currentDay = "Friday";
        break;
    case 6 :
        currentDay = "Saturday";
        break;
    }
    const currentTime = new Date().getHours();
    // Check DB for next lecture
 
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
    // Check what the next lecture is.
    //agent.add('This lecture is some time in the future. The current day is : ' + currentDay + ' and the current hour is: ' + currentTime );

// 3
return db.collection('Students').doc(SID.toString()).get().then( (dc) => {
    modules = dc.get("Modules");
}).then( a =>

// 4
function readFromDb (agent) {
     // Get the database collection 'test col' and document 'test doc'
     const dialogflowAgentDoc = db.collection('test col').doc('test doc');

     // Get the value of 'TestQuery' in the document and send it to the user
      return dialogflowAgentDoc.get()
          .then(doc => {
          	if (!doc.exists) {
              	agent.add('No data found in the database!');
            } 
            else {
              	agent.add(doc.get('TestQuery'));
            }
              return Promise.resolve('Read complete');
          }).catch(() => {
              agent.add('Error reading entry from the Firestore database.');
              agent.add('Please add a entry to the database first by saying, "Write <your phrase> to the database"');
          });
  }
//5
function bookMeetingInfo(agent){ //handles slot filling for the booking functionality
   var recipient, date, time; //this will be constantly recalled until all the required parameters are given by the user (date/time/recipient)
   if (agent.context.get("bookmeeting")) {
       if (agent.parameters.recipient) {
           let oldvar = agent.parameters._recipient; //uses special parameters values '_param' to store previous values
           //this allows the user to change set parameters half way through the process, such as ("change the date to tomorrow", "set the time to 5pm")
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
           if (doc.data().Name.toLowerCase() === recipient.toLowerCase()) { //iterates through staff to ensure the recipient actually exists
               found = true;
           }
       });
       }

   if (recipient && !found){ //if the recipient is given but cannot be found in the database:
       agent.add("Recipient does not exist! Please enter a valid name.");
       recipient = "";
       agent.context.delete("bookmeeting");
       agent.context.set({ //sets a new context storing params
                 'name':'bookmeeting',
                 'lifespan': 10,
                 'parameters':{
                 'recipient': recipient,
                 'date': date,
                 'time': time
               }
       });

   }
   else if (recipient && date && time) { //if all three parameters are given (all slots filled)
   agent.add("Just to confirm. You want to book an appointment with " + recipient + " on "  + date.split('T')[0] + " at " + time.split('T')[1].split('+')[0] + "?");
   agent.context.set({  //set confirmation context
                 'name':'bookmeetingConfirm',
                 'lifespan': 1,
                 'parameters':{
                 'recipient': recipient,
                 'date': date,
                 'time': time
               }
               });
   }
   else if (recipient && date) { //if only recipient and date is given:
       agent.add("Great. What time?");
       agent.context.delete("bookmeeting");
       agent.context.set({ //reset context and wait for params to be filled by the user
                 'name':'bookmeeting',
                 'lifespan': 10,
                 'parameters':{
                 'recipient': recipient,
                 'date': date,
                 'time': time
               }
               });
   }
   else if (recipient) { //if just the recipient is given.
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
   else { //if no information is given (i.e "I'd like to book a meeting")
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


function bookMeeting(agent){ //books the meeting - creates new events in student and staff timetable collections
   //currently DOES NOT check if time's are available
   var SID = agent.context.get("sessionvars").parameters.sid;
   var docId;
   var response;
   var found = false;
   //var recAvailable = true;
   //var stuAvailable = true;
   const dateTime = convertParametersDate(agent.parameters.date, agent.parameters.time);  //converting the date and time parameters into a JS date
   var recipient = agent.parameters.recipient;
   return db.collection('Staff').get().then( (snapshot) => {
       snapshot.docs.forEach(doc => {
         if (found) {
           return;
         }
         if (recipient.toLowerCase() === doc.data().Name.toLowerCase()){ //if the member of staff exists then
           docId = doc.id; //set the document ID
           found = true;
         }
        });
        return;
   }).then( rec => {
    //agent.context.delete("bookmeeting");
    //db.collection('Staff').doc(docId).collection('Timetable').get().then( (snapshot) => {
       //snapshot.docs.forEach(doc => {
   // if (recAvailable && (doc.data().Date.toDate().getTime() ==== dateTime.getTime())) {
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
                 db.collection("Students").doc(SID.toString()).collection('Timetable').add({ //adding the meeting to the student's Timetable collection
                       Date: dateTime,
                       Description: ("Meeting with " + recipient),
                 Location: (recipient + "'s office")
                   });
         });
         return;
    }).then(eds => {
    // if (stuAvailable && recAvailable) {
        db.runTransaction(t => {
                 db.collection("Staff").doc(docId).collection('Timetable').add({ //adding the meeting to the staff's Timetable collection
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
       // agent.add("You are already booked on that date/time.");
      // } else if (!recAvailable) {
        //  agent.add("The recipient is already booked on that date/time.");
      // } else {
         agent.add("Meeting succesfully booked.");
         // ADD CODE HERE THAT CLEARS ALL BOOKING CONTEXTS, use the function to clear the context because using .delete doesn't always work
         // ADD CODE HERE
         return;
     //  }
    }).catch(err => {
     console.log(err);
   });
}

function cancelBooking(agent){ //handles cancel booking intent - just clears contexts, should use context clearing function instead for consintency
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
// 6