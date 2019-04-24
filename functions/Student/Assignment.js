module.exports = {
//created by Dylan Vincent
myAssignments:function(agent, db, moment){
   var SID = agent.context.get("sessionvars").parameters.sid;
   agent.add("Here are the list of assignments to be completed:")
   return db.collection('Students').doc(SID.toString()).collection('Assignments').get().then( (snapshot) => {
     snapshot.docs.forEach(doc => {
       var eventDate = doc.data().Submission.toDate();
       var eventDateString = eventDate.toDateString();
       var eventDateTime = moment(eventDate);
       var currentTime = moment();
         if(eventDateTime.diff(currentTime, 'days') >= 0){
       agent.add("Module: " + doc.data().Module.toString() + ". Title: " + doc.data().Title.toString() + ". Date Due: " + doc.data().Submission.toDate().toDateString())
        }
       return;
     });
     return;
   })
 }
}
