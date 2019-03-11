module.exports = {
 checkToken:function(agent, db, request){ //checks token given by user in token intent
 var studentDocID;
 var token = agent.parameters.token; //get token value from most recent context (token)
 var SID = agent.context.get("sid").parameters.sid; //get student ID from SID context
 var fbid = JSON.stringify(request.body.originalDetectIntentRequest.payload.data.sender.id); //get FBID from messenger
 fbid = fbid.replace(/['"]+/g, '');
 var valid = false;
  return db.collection('Students').get().then( (snapshot) => { //check each student document
       snapshot.docs.forEach(doc => {
         if ((doc.data().SID === SID) && doc.data().Token === token){ //if the SID and token match, correct student has been found
           valid = true;
           studentDocID = doc.id;
         }
       });
       return;
  }).then(t => {
           db.runTransaction(t => { //run firebase transaction:
                 db.collection("Authenticated").doc(SID.toString()).set({ //create a new document in Authenticated using verified values
                       SID: SID,
                       FBID: fbid,
                   });
               });
               return;
    }).then(t => {
         db.runTransaction(t => {
                 db.collection("Students").doc(studentDocID.toString()).update({ //generate a new random token for the student
                       Token: module.exports.generateToken(8),
                   });
               });
               return;
     }).then(t => {
          agent.context.set({ //set sessionvars context storing the SID
            'name':'sessionvars',
            'lifespan': 50,
            'parameters': {
              'sid': SID
            }
            });
        agent.context.delete("auth"); //reset contexts
        agent.context.delete("token");
        agent.context.delete("sid");
          agent.add("Uni account linked successfully.");
          return;
     }).catch(function(err) {
        console.log(err);
      });
    },

    generateToken:function(length){
      var token = "";
      var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < length; i++)
          token += chars.charAt(Math.floor(Math.random() * chars.length));
      
      return token;
    }
};