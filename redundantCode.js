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