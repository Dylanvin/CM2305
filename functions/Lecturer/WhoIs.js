// Created by Rhys Douglas. Last Modified 25/03/19
module.exports = {
	query : function(agent,db) {
		// Get the school being queried and the role being queried from the parameters.
		const schoolType = agent.parameters.Schools;
		const specifiedRole = agent.parameters.Roles;
		// Switch case to query the database for what role 
		switch(specifiedRole) {
			case "Head of School":
				return db.collection('Responsibilities').doc(schoolType).get().then( (snapshot) => {
					agent.add(snapshot.data().HeadOfSchool + " is the " + specifiedRole + " for " + schoolType + ".");
					return;
				});
			case "Something else" :
				return db.collection('Responsibilities').doc(schoolType).get().then( (snapshot) => {
					agent.add(snapshot.data().HeadOfSchool + " is the " + specifiedRole + " for " + schoolType + ".");
					return;
				});
		}
		return;
	}
}