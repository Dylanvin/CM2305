module.exports = {

getModuleLecturer:function(agent, db) { // Who lectures this module
    const moduleNo = agent.parameters.Modules;

    return db.collection('Modules').doc(moduleNo).get().then( (snapshot) => {
           agent.add(snapshot.data().Module_Leader + " is the module leader for this module.");
         return;
    });
  }

}