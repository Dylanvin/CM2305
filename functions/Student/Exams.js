const {Payload} = require('dialogflow-fulfillment');
var lastChosen = "";

module.exports = {

myExams:function(agent, db, moment){
  
   var sid = agent.context.get("sessionvars").parameters.sid;
   var smodules;
   var exams = [];
   var elements = [];

   return db.collection('Students').doc(sid.toString()).get().then( (dc) => {
          smodules = dc.get("Modules");
          return;
    }).then( a => {
   return db.collection('Exams').get().then( (snapshot) => {
     snapshot.docs.forEach(doc => {
      if (smodules.includes(doc.data().Module)) {
          var eventDate = doc.data().Time.toDate();
          //var eventDateString = eventDate.toDateString();
          var eventDateTime = moment(eventDate);
          var currentTime = moment();
            if (eventDateTime.diff(currentTime, 'days') >= 0) {
               exams.push({
                title:  doc.data().Title.toString(),
                subtitle: "Module: " + doc.data().Module.toString() + "\n" +
                          "Date: " + doc.data().Time.toDate().toDateString() + "\n" +
                          "Location: " + doc.data().Location
              });
            }
          return;
          }
     });
     return;
   }).then(next => {

  for (let i = 0; i < exams.length; i++) {
      elements.push({
        "title": exams[i].title,
        "image_url": generateBanner(exams[i].title),
        "subtitle": exams[i].subtitle     
      },
    );
   }
   var payload = {
    "attachment":{
    "type":"template",
    "payload":{
      "template_type":"generic",
      "elements": elements
        }
      }
    }
    agent.add(new Payload(agent.FACEBOOK, payload, {sendAsMessage:true}) );
    return;
   });
  });
 }
}

function generateBanner(title){
  var chosen;
  var colours = ["7C329F",
            "6e3238",
            "2B3255",
            "778555",
            "BD5500",
            "085217"]
            
  do {
    chosen = colours[Math.floor(Math.random() * colours.length)]
  } while (chosen === lastChosen);

  lastChosen = chosen;
  var url = "https://dummyimage.com/764x400/" + chosen + "/FFF.png&text=" + title;
  return url;
}