const {Payload} = require('dialogflow-fulfillment');

module.exports = {

searchLibrary:function(agent, db){ //searches for a book in the Library collection
   var books = [];
   var elements = [];
   var found = false;
   var bookname, author;
   var booknameGiven = false;
   var authorGiven = false;

   if (agent.parameters.bookname && agent.parameters.bookname !== "") {
       booknameGiven = true;
       bookname = agent.parameters.bookname.toLowerCase();
   }
   if (agent.parameters.author && agent.parameters.author !== "") {
       authorGiven = true;
       author = agent.parameters.author.toLowerCase();
    }

    if (!booknameGiven && !authorGiven) {
        agent.add("What book are you looking for? (Title and/or author)");
        agent.context.set({ //set sessionvars context storing the SID
            'name':'booksearch',
            'lifespan': 1,
            });
        return;
    }

   return db.collection('Books').get().then( (snapshot) => {
          snapshot.docs.forEach(doc => {
              if (authorGiven && !booknameGiven) {
                if (doc.data().Authors.toLowerCase().includes(author)) {
                    found = true;
                    if (doc.data().Availability === true || doc.data().Availability === "true") {
                        books.push({
                            title:  doc.data().Title.toString(),
                            subtitle: "Available in the " + doc.data().Library + " library." + "\n" + 
                                      "Authors: " + doc.data().Authors,
                            cover: doc.data().Cover
                        });
                    } else {
                        books.push({
                            title: doc.data().Title.toString(),
                            subtitle: "Unavailable." + "\n" +
                                      "Authors: " + doc.data().Authors,
                            cover: doc.data().Cover
                        });
                    }
               } 
             }
             else if (!authorGiven && booknameGiven) {
                if (doc.data().Title.toLowerCase().includes(bookname)) {
                    found = true;
                    if (doc.data().Availability === true || doc.data().Availability === "true") {
                        books.push({
                            title:  doc.data().Title.toString(),
                            subtitle: "Available in the " + doc.data().Library + " library." + "\n" + 
                                      "Authors: " + doc.data().Authors,
                            cover: doc.data().Cover
                        });
                    } else {
                        books.push({
                            title: doc.data().Title.toString(),
                            subtitle: "Unavailable." + "\n" +
                                      "Authors: " + doc.data().Authors,
                            cover: doc.data().Cover
                        });
                    }
               } 
             }
             else if (authorGiven && booknameGiven) {
                if (doc.data().Authors.toLowerCase().includes(author) && doc.data().Title.toLowerCase().includes(bookname)) {
                    found = true;
                    if (doc.data().Availability === true || doc.data().Availability === "true") {
                        books.push({
                            title:  doc.data().Title.toString(),
                            subtitle: "Available in the " + doc.data().Library + " library." + "\n" + 
                                      "Authors: " + doc.data().Authors,
                            cover: doc.data().Cover
                        });
                    } else {
                        books.push({
                            title: doc.data().Title.toString(),
                            subtitle: "Unavailable." + "\n" +
                                      "Authors: " + doc.data().Authors,
                            cover: doc.data().Cover
                        });
                    }
               } 
             }
          });

          if (!found){
            agent.add("Book could not be found.");
            return;
          }

          for (let i = 0; i < books.length; i++) {
            elements.push({
              "title": books[i].title,
              "image_url": books[i].cover,
              "subtitle": books[i].subtitle     
            },
          );
         }
         var payload = {
          "attachment":{
          "type":"template",
          "payload":{
            "template_type":"generic",
            "elements": elements
              }
            }
          }
          agent.add(new Payload(agent.FACEBOOK, payload, {sendAsMessage:true}) );
          return;
   });
   }

}