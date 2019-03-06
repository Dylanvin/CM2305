module.exports = {
  getS:function(agent, db, request) { //get student ID and save it into a context (sessionvars)
   var fbid = JSON.stringify(request.body.originalDetectIntentRequest.payload.data.sender.id); //get messenger FBID
   fbid = fbid.replace(/['"]+/g, '');
   var exists = false;
   return db.collection('Authenticated').get().then( (snapshot) => { //check each doc in Authenticated
        snapshot.docs.forEach(doc => { //if the user's FBID exists in a doc, get the corresponding SID
          if (doc.data().FBID === fbid) {
            agent.context.set({
                      'name':'sessionvars',
                      'lifespan': 50,
                      'parameters': {
                       'sid': doc.data().SID
                      }
          });
            exists = true;
          }

        });
     if (exists) { //if the SID has been found, return.
       return;
      }
     else { //initialising authentication with student
        agent.context.delete("sessionvars");
        agent.add("Looks like this is your first time using the bot.");
         agent.add("What is your student number?");
         agent.context.set({ //set auth context ready for next intent.
                      'name':'auth',
                      'lifespan': 3,
                      'parameters': {}
        });
     }
     return;
 });
 }
}
