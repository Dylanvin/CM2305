module.exports = {

eventDetails:function(agent, db){
   var event;
   var ID = false;
   var IDmap = {};
   var found = false;

   if (agent.parameters.eventListNumber) { //if the user mentioned the event number ("tell me more about event 1")
       event = agent.parameters.eventListNumber; //get the number
       ID = true;
       IDmap = agent.context.get('events').parameters; //get the IDmap array from previous intent
   }
   else if (agent.parameters.eventTitle) { //if the user mentioned the event title ("tell me about carol singing")
       event = agent.parameters.eventTitle.toLowerCase();
   }
   else {
       agent.add("Sorry I don't know about that event.");
   }

   return db.collection('Events').get().then( (snapshot) => {
        snapshot.docs.forEach(doc => {
            // checks if either the ID exists in the ID map or if the title of the event matches
            if (ID && doc.data().ID === IDmap[event.toString()] || !ID && doc.data().Title.toLowerCase().indexOf(event) !== -1) {
                agent.add(doc.data().Title);
                agent.add(doc.data().Description);
                agent.add(new Date(doc.data().Date).toLocaleDateString('en', { year: 'numeric', month: 'numeric', day: 'numeric' }));
                found = true;
            }
        });
        if (!found) {
            agent.add("Sorry I don't know anything about that event.");
        }
        return;
   });
},


searchEvents:function(agent, db){ //searches for upcoming events
    var numToID = {};
    agent.add("Upcoming events: \n");
    var count = 1;
    return db.collection('Events').get().then( (snapshot) => {
        snapshot.docs.forEach(doc => { //loops through all events (would be way too many events in real life application so maybe improve)
            agent.add(count + ". " + doc.data().Title + '\n'); //lists the events using arbitrary numbers starting at 1.
            numToID[count.toString()] = doc.data().ID; //link the above number with the event ID, stored in an array [used later]
            count++;
        });
        agent.context.set({
                 'name':'events',
                 'lifespan': 5,
                 'parameters': numToID
        });
        return;
    });

}

}