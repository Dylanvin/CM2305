

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