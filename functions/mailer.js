module.exports = {
   theMailer:function(){

    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({

      service:'gmail',
      auth: {                                //Deffine service and login info of email account.
        user: '',
        pass: ''
      },
    });

    var mailOptions = {
      from: '',           //What will be sent.
      to: '',
      subject: 'You got mail! Free money', //In order to use moreStuff's methods here,
      text: 'That was easy!'                                 //Use moreStuff followed by any method name in file.
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
