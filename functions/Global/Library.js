module.exports = {

searchLibrary:function(agent, db){ //searches for a book in the Library collection
   if (agent.parameters.bookname){
       var bookname = agent.parameters.bookname;
       var found = false;
   return db.collection('Books').get().then( (snapshot) => {
          snapshot.docs.forEach(doc => {
           if (doc.data().Title.toLowerCase() === bookname.toLowerCase()) {
               found = true;
               if (doc.data().Availability === true || doc.data().Availability === "true") {
                   agent.add(doc.data().Title + " is available in the " + doc.data().Library + " library");
               }
               else {
                   agent.add(doc.data().Title + " is not available.");
               }
           }
          });
          if (!found){
              agent.add("Book could not be found.");
          }
          return;
   });
   }

}

}