const captureWebsite = require('capture-website');
const {Image} = require('dialogflow-fulfillment');
var rp = require('request-promise');

module.exports = {
getTimetable:function(agent, poptions){
    const coptions = {
    height: 500,
    width: 1000,
    waitForElement: ".syncscroll",
    launchOptions: {
    	args: ['--no-sandbox']
  	},
    scaleFactor: 1,
    type: 'png'
  };
  
    var url = "http://joemerk.github.io/timetable/?id="+agent.context.get("sessionvars").parameters.sid;
  	return captureWebsite.base64(url, coptions).then(out => {
        var options = {
          method: 'POST',
          uri: 'https://b64-image-url.herokuapp.com/images.json',
          body: {
                 'image': { 'data_uri': out.toString('base64')}
          },
          json: true
        };

        return rp(options)
        .then(function (parsedBody) {
            //console.log(parsedBody['url']);
            agent.add(new Image(parsedBody['url']));
            return Promise.all([]);
        })
        .catch(function (err) {
            console.log(err);
            return Promise.all([]);
        });                                         
    });
  }

}
