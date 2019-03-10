const captureWebsite = require('capture-website');
const cloudify = require('base64-cloudify');
const {Image} = require('dialogflow-fulfillment');

var poptions = {
key: {
"type": "service_account",
"project_id": "fir-61465",
"private_key_id": "449282fa24117fea326f677fe3a08ef91cbf3748",
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDaKD18pTqbtJbP\nD5Jh35qRv8Oi6NFr719i8lwktxZo83Km+Uuq8bPlqFEOPzlOR3RCCPaKMHnxCzd1\nWQUmSOqIGNA/i8ghgoyvqzy1NvG0q4YaeljQU/oUyUgREwU3QdmB7XvD3+gL7zz+\npL/oXze3G21QePTYVEgs41MP94AAp7gQL5imBbgRoNNmjydH17ald9jjhLwGl3Z1\nb544TMsjwz3jATa1TfEIuATqHtFPU918UNHrLBgWRR9SUwcCku5vbnw2JIAPvORR\n4aVUHELxiqXHIfGYnGUxJbHi5Y3IwPN2XJyrSBgXln7xIAZjkpyf6xY6fgXDbqp1\nV2Yyu5cLAgMBAAECggEAHDzC1KxDB/NvOnGethTDb45y7AEXAPxfYYcoU8eaWs75\nbfvCW705rAYbfmzC5fXMFQi5offArj667hwDKspGXS5aX4H1eheT+TWranNTBC/Y\nGvuaHQEO/iYdh2Q/CRYjaV9hZTWeq1N17Cn2qG+8CPM/tNUAhYhx59QsJLAZp+Z7\nGQPzQorJuJGHpA7PEYqIH53Xq5QW3KOQimHY9wKT3E2QXzXiO0iuBrqoKHFlE+y2\nvnk5O6BvZOZsemnEiLgYYGXttwO3/iA0/nf2EEibwqO3b6wtkvx9xnCQ6e0li5y8\nMHiZtlw1IKVDzd9Osujc9Fj/Ef2a74fIEZuyp6KxCQKBgQD03liF03UY1olfMsdh\nedZQiBetQMALkU8PVBHc549pFazAWaANyr5kFwdLrDJ9JkhwVY7bKpXFU2Au33kZ\nNYI9SmCmafX2V392NZzhk1JeQm6Fe2KVKHK7Nb3jSgYMKMIv7Aeuwt73PJHyq1Wc\nOz7SYqJNsY25UCNsxX5EcYH3QwKBgQDkEwqa8DLo1fINITEeCAVSeVxuAYa8A8IY\n/+Lu0F0glMWtR+ysFRw2tNweaaFW3y3CbjJIShDVKbfgUCNzWg5CfCzrtDT3PhS+\n6dD+Wj8kDn67gLKK9qqx2xBZTaGHyeefchB/tPVkz+Zzisppm5Zp0UQ733SVbZ0g\nqdg6hsDwmQKBgDSxkE0kJwO0TxV8YOl6BYOI9cdjsrAKkf/TcJCgB/1uG6G857Nw\nGK6DQh+nq6nAzj/WOYqyTE6NVZpgnretCxzTX58QGEztoVE30k28nTIJi60P0zQT\n4zSkKPu7VzfQoZEccr7J0p9TmnilJCQdn7Q4Y4LinYPuWeEzUqu53WTvAoGAU9pI\nWOSc4wvdvUQJye/K/SKPgAZhofiDwSs7JPBIfPUVpHrAIhh00gw2rZvKbKULLuPS\n6s8IV0bKStdL4VonyfvbjCEqJAiYGgTfCNTnR/toTsmnWv4Lje5rmVm4XLM3zGBk\nfn9qhVEGek550tAYQflla9nhBBtT3LF1RTdL8mkCgYEAviaOboI00TahgzMa0+hz\nb05Og+4GyiSuJdDsitbSSnE1vsdrKqeEUleTseM6ix6A8JbV8Ykv5XnUg5qgNbst\nBumjjXuQj8q05gLGJ4puDc8ufFIcXZ4hl/UNxrEy2aXzF6QTtxf7VLL/QmUKJox3\n7SYno/yLIFdeezs/5n9tMxY=\n-----END PRIVATE KEY-----\n",
"client_email": "firebase-adminsdk-wbprd@fir-61465.iam.gserviceaccount.com",
"client_id": "111466098732197741123",
"auth_uri": "https://accounts.google.com/o/oauth2/auth",
"token_uri": "https://oauth2.googleapis.com/token",
"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wbprd%40fir-61465.iam.gserviceaccount.com"
  },
  projectId: 'fir-61465',
  bucketName: 'fir-61465.appspot.com',
  filenamePrefix: 'timetable',
  img: ""
};

module.exports = {
getTimetable:function(agent){
    console.log("started");
    const coptions = {
    height: 500,
    width: 1000,
    launchOptions: {
    	args: ['--no-sandbox']
  	},
    scaleFactor: 1,
    type: 'jpeg',
    quality: 1
	};
    
	var url = "http://joemerk.github.io/timetable/?id="+agent.context.get("sessionvars").parameters.sid;
  	return captureWebsite.base64(url, coptions).then(out => {
      poptions['img'] = "data:image/jpeg;base64," + out.toString('base64');                                                  
      return cloudify(null, poptions).then( url => {
        console.log("got" + url);
        agent.add(new Image(url.toString()));
        return;
 	});
    });
  }

}
