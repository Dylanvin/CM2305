const {Text, Card, Suggestion, Payload} = require('dialogflow-fulfillment');

module.exports = {

bookMeetingInfo:function(agent, db){ //handles slot filling for the booking functionality
   var recipient = null;
   var date = null;
   var time = null; //this will be constantly recalled until all the required parameters are given by the user (date/time/recipient)
   var pendingChange = false;
   var changeRecipient = false;
   var changeDate = false;
   var changeTime = false;

   if (agent.context.get("bookmeeting")) {

        if (agent.parameters.modifier && agent.parameters.recipientsyn && (!agent.parameters.recipient || agent.parameters.recipient === agent.parameters._recipient)) {
            changeRecipient = true;
            pendingChange = true;
        }
        else if (agent.parameters.modifier && agent.parameters.datesyn && (!agent.parameters.date || agent.parameters.date === agent.parameters._date)) {
            changeDate = true;
            pendingChange = true;
        }
        else if (agent.parameters.modifier && agent.parameters.timesyn && (!agent.parameters.time || agent.parameters.time === agent.parameters._time)) {
            changeTime = true;
            pendingChange = true;
        }

       if (agent.parameters.recipient && !changeRecipient) {
           let oldvar = agent.parameters._recipient; //uses special parameters values '_param' to store previous values
           //this allows the user to change set parameters half way through the process, such as ("change the date to tomorrow", "set the time to 5pm")
           if ((agent.parameters.recipient !== oldvar && agent.parameters.modifier && agent.parameters.recipientsyn) || (oldvar === "")) {
               recipient = agent.parameters.recipient;
           }
           else {
               recipient = oldvar;
           }
       }
       if (agent.parameters.date && !changeDate) {
           let oldvar = agent.parameters._date;
           if ((agent.parameters.date !== oldvar && agent.parameters.modifier && agent.parameters.datesyn) || (oldvar === "")) {
             var d = new Date();  //added by Dylan Vincent date and time validation
             if(d <= Date.parse(agent.parameters.date)){
                date = agent.parameters.date;
             }
             else{
               var dateInv = true;
               module.exports.clearContext(agent, "bookmeeting");
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
           }
           else {
               date = oldvar;
           }
       }

       if (agent.parameters.time && !changeTime) {
           let oldvar = agent.parameters._time;
           if ((agent.parameters.time !== oldvar && agent.parameters.modifier && agent.parameters.timesyn) || (oldvar === "")) {
             var hours = new Date(agent.parameters.time).getHours();
             if(hours >= 8 && hours <= 19){
               time = agent.parameters.time;
             }
             else{
               var timeInv = true;
               module.exports.clearContext(agent, "bookmeeting");
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
           }
           else {

               time = oldvar;
           }
       }
   }
   else { //if no context exists yet (only triggered during bookmeeting-init intent)
       if (!agent.parameters.Appointment) {
           agent.add("Sorry I don't understand.");
           return Promise.all([]);
       }
       if (agent.parameters.recipient){
           recipient = agent.parameters.recipient;
       }
       if (agent.parameters.time) {
         var hour = new Date(agent.parameters.time).getHours();
         if(hour >= 8 && hour <= 19){
           time = agent.parameters.time;
         }
         else{
           agent.add("Sorry you can only book appointments between the hours of 9am and 6pm.")
           return Promise.all([]);
         }
       }
       if (agent.parameters.date){
         var da = new Date();  //added by Dylan Vincent date and time validation
         if(da <= Date.parse(agent.parameters.date)){
            date = agent.parameters.date;
         }
         else{
           agent.add("Sorry that date has passed!");
           return Promise.all([]);
         }
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
   if (recipient && !found && !pendingChange){ //if the recipient is given but cannot be found in the database:
       agent.add("Recipient does not exist! Please enter a valid name.");
       recipient = "";
       module.exports.clearContext(agent, "bookmeeting");
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
   else if (recipient && date && time && !pendingChange ) { //if all three parameters are given (all slots filled)
   var text = "Just to confirm. You want to book an appointment with " + recipient + " on "  + date.split('T')[0] + " at " + time.split('T')[1].split('+')[0] + "?";

   var payload = generatePayload(text, ["Confirm", "Change the recipient", "Change the date", "Change the time"]);
   agent.add(new Payload(agent.FACEBOOK, payload, {sendAsMessage:true}));

   //module.exports.clearContext(agent, "bookmeeting");
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
   else if (recipient && date && !pendingChange) { //if only recipient and date is given:
        if(timeInv){
        agent.add("Sorry you can only book appointments between the hours of 9am and 6pm.")
        timeInv = false;
        }
        else{
        text = randomResponse(["Great, what time?", "Okay, and what time?", "What time would you like?", "What time?"]);
        payload = generatePayload(text, ["Change the recipient", "Change the date"]);
        agent.add(new Payload(agent.FACEBOOK, payload, {sendAsMessage:true}));
      }
       module.exports.clearContext(agent, "bookmeeting");
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
   else if (recipient && !pendingChange) { //if just the recipient is given.

       //agent.add("Great. What date?");
       //agent.add(new Suggestion('Change the recipient'));
       if(dateInv){
       agent.add("Sorry that date has passed!");
       dateInv = false;
       }
       else{
        text = randomResponse(["Great, what date?", "Okay, and what date?", "Okay, and what day?", "What date would you like?"]);
        payload = generatePayload(text, ["Change the recipient"]);
        agent.add(new Payload(agent.FACEBOOK, payload, {sendAsMessage:true}));
      }
       module.exports.clearContext(agent, "bookmeeting", );
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
   else if (changeRecipient) {

        recipient = null;
        agent.add("Who would you like to change the recipient to?");
        module.exports.clearContext(agent, "bookmeeting");
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
   else if (changeDate) {

    date = null;
    agent.add("What would you like to change the date to?");
    module.exports.clearContext(agent, "bookmeeting");
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
    else if (changeTime) {

        time = null;
        agent.add("What would you like to change the time to?");
        module.exports.clearContext(agent, "bookmeeting");
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
       text = randomResponse(["Great, who with?", "Who would you like to book with?", "Great, who will be the recipient?", "Who with?", "Let's get started, who would you like to book with?"]);
       agent.add(text);
       module.exports.clearContext(agent, "bookmeeting");
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
     return Promise.all([]);
  });
},

bookMeeting:function(agent, db){ //books the meeting - creates new events in student and staff timetable collections
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
          db.runTransaction(t => {
                  db.collection("Students").doc(SID.toString()).collection('Timetable').add({ //adding the meeting to the student's Timetable collection
                        Date: dateTime,
                        Description: ("[Unconfirmed] Meeting with " + recipient),
                  Location: (recipient + "'s office")
                    });
          });
          return;
     }).then(eds => {
     // if (stuAvailable && recAvailable) {
         db.runTransaction(t => {
                  db.collection("Staff").doc(docId).collection('Timetable').add({ //adding the meeting to the staff's Timetable collection
                        Date: dateTime,
                        Description: ("[Unconfirmed] Meeting with " + agent.context.get("sessionvars").parameters.nickname),
                  Location: (recipient + "'s office")
                    });
                });
                return;
    }).then(fin => {
          module.exports.mailer(recipient, "RECIPIENT@gmail.com", "mailboy@gmail.com", agent.context.get("sessionvars").parameters.nickname, SID, dateTime)
          agent.add("Meeting request succesfully sent.");
          module.exports.clearContext(agent, "bookmeeting");
          module.exports.clearContext(agent, "bookmeetingConfirm");
          return;
      //  }
     }).catch(err => {
      console.log(err);
    });
 },

 cancelBooking:function(agent){ //handles cancel booking intent - just clears contexts, should use context clearing function instead for consintency
    var name = "";
    if (agent.context.get("sessionvars")) {
        name = ", " + agent.context.get("sessionvars").parameters.nickname;
        module.exports.clearContext(agent, "bookmeeting");
        module.exports.clearContext(agent, "bookmeetingConfirm");
        agent.add("Okay" + name + ".");
    }
    else {
        module.exports.clearContext(agent, "bookmeeting");
        module.exports.clearContext(agent, "bookmeetingConfirm");
        agent.add("Okay.");
    }
 },

  clearContext:function(agent, contextname) { //used to clear contexts properly, this should always be used instead of just using .delete
    agent.context.set({
                        'name': contextname,
                        'lifespan': 0,
                        'parameters': {}
    });
    agent.context.delete(contextname);
   },

   mailer:function(lecName, lecEmail, stuEmail, stuName, stuNum, dateTime){

    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({

      service:'gmail',
      auth: {                                //Deffine service and login info of email account.
        user: 'mytestbott@gmail.com',
        pass: 'Mypassword1'
      },
    });

    var mailOptions = {
      from: 'mytestbott@gmail.com',           //What will be sent.
      to: lecEmail,
      subject: 'Booking',                                                            //In order to use moreStuff's methods here,
      html: '<h3>Hello ' + lecName + '</h3><p>' + stuName + '(' + stuNum + ')' + ' whishes to see you at ' + dateTime + '. Their email is: ' + stuEmail + '.</p>'                                 //Use moreStuff followed by any method name in file.
    };

    transporter.sendMail(mailOptions);
  }
}

function convertParametersDate(date, time){ //conerts date and time into JS date object
    var newDate = new Date(Date.parse(date.split('T')[0] + 'T' + time.split('T')[1]));
    return newDate;
 }


 function generatePayload(text, reps){

    replies = [];
    for (var i = 0; i < reps.length; i++) {
        replies.push(
            {
                "content_type":"text",
                "title": reps[i],
                "payload": reps[i]
            }
        );
    }
    payload = {
        "text": text,
        "quick_replies": replies
    };
    return payload;
 }


function randomResponse(responses) {
    return responses[ (Math.floor(Math.random() * (responses.length))) ];
}

 //function addHours(dateObj, hoursToAdd){ //unused
 //   return new Date(new Date(dateObj).setHours(dateObj.getHours() + hoursToAdd));
 //}

 //function getLocaleTimeString(dateObj){ //unused
  //return dateObj.toLocaleTimeString('en', { hour: 'numeric', hour12: true });
 //}

 //function getLocaleDateString(dateObj){ //unused
  //return dateObj.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
 //}
