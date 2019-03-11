module.exports = {

getLecturerEmail:function(agent, db) {
	var lecturer;
	var found = false;
	
	if (agent.parameters.lecturer){
		lecturer = agent.parameters.lecturer.toLowerCase();
	}
	if (!agent.parameters.lecturer) {
		agent.add("Sorry I can't help.");
		return;
	}
	
	return db.collection('Staff').get().then( (snapshot) => {
		snapshot.docs.forEach(doc => {
			if (doc.data().Name.toLowerCase() === lecturer) {
				var response = doc.data().Name + "'s email is " + doc.data().Email;
				agent.add(response);
				found = true;
			}
		});
		
		if (!found){
		agent.add("Sorry I don't know who you're talking about.");
	  }
	  return;
	});
},
getLecturerLocation:function(agent, db) {
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

}