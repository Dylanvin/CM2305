var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var HttpClient = function() { //Class used to make GET http requests.
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }
}

module.exports = {

  getWeather:function() {
    var client = new HttpClient();

    if (agent.parameters.unit_temperature){
  		unit = agent.parameters.unit_temperature.toLowerCase();
  	}
    client.get('https://api.darksky.net/forecast/a12b8829b95a30d78caa024f91d3e845/51.4816,3.1791', function(response) {
      let resp = JSON.parse(response);
      return resp.hourly.summary;
    });
  }
}
