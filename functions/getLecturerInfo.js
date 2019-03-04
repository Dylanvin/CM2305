var lecturerEmail;
module.exports = {
//																										Get Lecturer's Email
	getLecturerEmail:function(specifiedLecturer) {
		// Search each document in the Staff table for the correct staff member ( This can be rapidly improved by replacing the document names with distinct values related to the staff and not just auto-generated keys.)
		db.collection('Staff').get().then( (snapshot) => {
			// For each loop to loop over each document in the staff table.
			snapshot.docs.forEach(doc => {
				// Get the name of the staff member of the document.
				var potentialStaffName = doc.data().Name.toLowerCase();
				// If the staff name matches the lecture name parsed, stop looping and return the email.
				if( potentialStaffName == specifiedLecturer ) {
					// If found, return the lecturer's Email.
					lecturerEmail == doc.data().Email;
					return lecturerEmail;					
				}
			})
		})
	}
//																											Get Lecturer's Location
	getLecturerLocation:function(specifiedLecturer) {
	// Search each document in the Staff table for the correct staff member. (Again this can be improved)
		db.collection('Staff').get().then( (snapshot) => {
			// For each loop to iterate over each document in the staff table.
			snapshot.docs.forEach(doc => {
				// Get the name of the staff member of the document
				var potentialStaffName = doc.data()Name.toLowerCase();
				// Compare the parsed name with the name from the document.
				if ( potentialStaffName == specifiedLecturer ) {
					// If found, return the lecturer's location
					lecturerLoc = doc.data().Location;
					return lecturerLoc;
				}
			})
		})		
	}
};