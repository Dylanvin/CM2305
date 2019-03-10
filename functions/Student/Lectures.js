module.exports = {

getNextLecture:function(agent, db) {
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
}

 function zTime(n) { //used to append zeros to low numbers
  return (n < 10 ? '0' : '') + n;
 }