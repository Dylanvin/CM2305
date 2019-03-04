var email;
module.exports.email; 

module.exports = {
   theMailer:function(lecName, stuEmail, stuName, stuNum, DateTime){

    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({

      service:'gmail',
      auth: {                                //Deffine service and login info of email account.
        user: 'mytestbott@gmail.com',
        pass: 'Mypassword1'
      },
    });

    var mailOptions = {
      from: 'mytestbott@gmail.com',           //What will be sent.
      to: "vincentd1@gmail.com",
      subject: 'Hello lecName, ',                                                            //In order to use moreStuff's methods here,
      html: '<h3>Hello ' + lecName + '</h3><p>' + stuName + '(' + stuNum + ')' + ' whishes to see you at ' + DateTime + '. Their email is: ' + stuEmail + '.</p>'                                 //Use moreStuff followed by any method name in file.
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);        //Sending mail and error handling.
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
};


