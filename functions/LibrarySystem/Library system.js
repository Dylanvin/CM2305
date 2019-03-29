module.exports = {

  getBookLocation:function(agent, db) {
  	var Book;
  	var found = false;

  	if (agent.parameters.Book){
  		Book = agent.parameters.Book.toLowerCase();
  	}
  	if (!agent.parameters.Book) {
  		agent.add("Sorry I can't help.");
  		return;
  	}

  	return db.collection('Books').get().then( (snapshot) => {
  		snapshot.docs.forEach(doc => {
  			if (doc.data().Book.toLowerCase() === Title) {
  				var response = doc.data().Title + " is in " + doc.data().Library;
  				agent.add(response);
  				found = true;
  			}
  		});

  		if (!found){
  		agent.add("Sorry I can't find the book you are talking about");
  	  }
  	  return;
  	});
  },
  getBookAvailability:function(agent, db) {
  	var Book;
  	var found = false;

  	if (agent.parameters.Book){
  		Book = agent.parameters.Book.toLowerCase();
  	}
  	if (!agent.parameters.Book) {
  		agent.add("Sorry I can't help.");
  		return;
  	}

  	return db.collection('Books').get().then( (snapshot) => {
  		snapshot.docs.forEach(doc => {
  			if (doc.data().Book.toLowerCase() === Title) {
  				var response = doc.data().Title + " is in " + doc.data().Library;
  				agent.add(response);
  				found = true;
  			}
  		});

  		if (!found){
  		agent.add("Sorry I can't find the book you are talking about");
  	  }
  	  return;
  	});
  },
}
