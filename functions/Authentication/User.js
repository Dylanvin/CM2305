module.exports = {
  
  getStudent:function(agent, db, request) { //get student ID and save it into a context (sessionvars)
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
 },

 getName:function(agent, db){ //gets the nickname of the student and stores into sessionvars context
  var nickname;
 var SID = agent.context.get("sessionvars").parameters.sid;
  return db.collection('Students').get().then( (snapshot) => { //iterating through student docs
    return snapshot.docs.forEach(doc => {
      if (doc.data().SID === SID) { //finds matching SID -- this should probably be directly referenced rather than involve looping
          nickname = doc.data().Nickname;
      }
    });
  }).then(e => {
      agent.context.set({ //updating context with nickname value
                      'name':'sessionvars',
                      'lifespan': 50,
                      'parameters': {
                        'nickname': nickname,
                     'sid': SID
                      }
        });
        return;
  }).catch(err => {
    console.log(err);
  });
},

Welcome:function(agent, db, request){ //Welcome intent ----- this intent is currently CRUCIAL for many other functions as it initialises important contexts
  return module.exports.getStudent(agent, db, request).then((e) => {  // ---- if code has recently been deployed, the sessionsvars may be wiped from messenger session
   if (agent.context.get("sessionvars")) { // ---- therefore you'll need to say 'hey'/'hi' to recall this intent/function and get back the context.
     if (agent.context.get("sessionvars").hasOwnProperty('parameters')) { // //if session vars has been initialised properly (exists and has parameters), then:
       return module.exports.getName(agent, db).then((f) => { //get student nickname
        agent.add("Welcome " + agent.context.get("sessionvars").parameters.nickname + "! What would you like to know?");
        return;
    });
   }
   }
   return;
 });
}
}
