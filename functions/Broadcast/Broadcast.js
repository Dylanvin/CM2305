//Created by Dylan Vincent
module.exports = {
  broadcastMsg:function(db, request, messenger, moment) {
    return db.collection('Events').get().then( (snapshot) => {
      snapshot.docs.forEach(doc => {
        var eventDate = doc.data().Date.toDate();
        var eventDateString = eventDate.toDateString();
        var eventDateTime = moment(eventDate);
        var currentTime = moment();
        if(eventDateTime.diff(currentTime, 'days') >= 0 && eventDateTime.diff(currentTime, 'days') < 5){
        return db.collection('Authenticated').get().then( (snapshot) => { //check each doc in Authenticated
               snapshot.docs.forEach(docID => { //if the user's FBID exists in a doc, get the corresponding SID
                 var id = docID.data().FBID;
                 if(!(doc.data().Announcement)){
                 messenger.sendTextMessage({id: id, text: "The event " + doc.data().Title + " is happening on " + eventDateString + " at " + doc.data().Location + "!"})
                // messenger.sendTextMessage({'2288655187875159', text: "The event " + doc.data().Title + " is havening on the " + doc.data().Date + "!"})
                }
                if(doc.data().Announcement){
                 messenger.sendTextMessage({id: id, text: doc.data().Description})
                }
               });
               return;
          });
        }
      });
      return;
     });
  //return;
  }
}
