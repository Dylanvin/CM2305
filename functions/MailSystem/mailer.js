var email;
// created by Dylan Vincent
module.exports = {
   theMailer:function(lecName, lecEmail, stuEmail, stuName, stuNum, dateTime){

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
      to: lecEmail,
      subject: 'Booking',                                                            //In order to use moreStuff's methods here,
      html: '<h3>Hello ' + lecName + '</h3><p>' + stuName + '(' + stuNum + ')' + ' whishes to see you at ' + dateTime + '. Their email is: ' + stuEmail + '.</p>'                                 //Use moreStuff followed by any method name in file.
    };

    transporter.sendMail(mailOptions);
  }
};
