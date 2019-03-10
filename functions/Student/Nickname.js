module.exports = {

changeNickname:function(agent, db){ //change the student's nickname
   //verify(agent);
   var nickname = agent.parameters.name;
   var SID = agent.context.get("sessionvars").parameters.sid;
   const databaseEntry = agent.parameters.databaseEntry;
   return db.runTransaction(t => {
     db.collection('Students').doc(SID.toString()).update({ //updates the nickname value using the one given by user
                               Nickname: nickname
   });
   agent.context.delete("sessionvars");
   agent.context.set({'name': 'sessionvars', 'lifespan': 0});
   agent.context.set({
                 'name':'sessionvars',
                 'lifespan': 50,
                 'parameters': {
                    'nickname': nickname,
                    'sid': SID
                 }
   });
     return Promise.resolve('Write complete');
   }).then(doc => {
     agent.add("Okay. I'll call you " + nickname + " from now on!"); //successful
     return;
   }).catch(err => {
     agent.add("Sorry I can't do that right now."); //not successful, 98% caused by the sessionvars context no longer being active because of reset
     console.log(err);
   });
}

}
