// const messenger = new FBMessenger({token: 'EAAYy6wrtLUEBAI68xZAZCqvmrwkxBtbTUgL3gZAAHiHSGA0126LSQh6UM3HoYnVYMG7wDb4CdsUCKhZAf7raOKldczVNTMnxZBeMbv4OZBUemxnCNKU88QVEdkM0uop92HpuDveUvRZCKg4gZB0K98ZCz4wCHchCRTyACpLArcL4ZAWwZDZD'}) // Will always use this page's token for request unless sent on each method
// //Created by Dylan Vincent
// module.exports = {
//   broadcastMsg:function(db, request) {
//     db.collection('Events').get().then( (snapshot) => {
//       snapshot.docs.forEach(doc => {
//         var eventDate = moment(doc.data().Date);
//         var currentTime = moment();
//         if(currentTime.diff(eventDate, 'weeks') <= 1){
//           db.collection('Authenticated').get().then( (snapshot) => { //check each doc in Authenticated
//                snapshot.docs.forEach(doc => { //if the user's FBID exists in a doc, get the corresponding SID
//                  var id = doc.data().FBID;
//                  messenger.sendTextMessage({id, text: "The event " + doc.data().Title + " is havening on the " + doc.data().Date + "!"})
//                });
//           });
//         }
//       });
//      });
//   return;
//   }
// }
