var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var HttpClient = function() { //Class used to make GET http requests.
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }
}

function convertUNIX(time) { //Function that converts unix timestamp to hh:mm format.
  var a = new Date(time*1000);
  var hours = a.getHours();
  var minutes;
  if (a.getMinutes() < 10) {
    minutes = "0" + a.getMinutes();
  }
  else {
    minutes = a.getMinutes();
  }
  var formattedTime = hours + ":" + minutes;
  return formattedTime;
}

module.exports = {

  getWeather:function(agent) { //Returns weather data depending on user input.
    var client = new HttpClient();
    var weathertype = agent.parameters.weathertype.toLowerCase();
    var date = "";
    var today = new Date();
    var agentDate = new Date(agent.parameters.date);
    var sameDay = false;

    if (today.getDate() == agentDate.getDate() && today.getMonth() == agentDate.getMonth() && today.getFullYear() == agentDate.getFullYear()) {
      sameDay = true;
    }

    /*if (agent.parameters.unit_temperature){
  		unit = agent.parameters.unit_temperature.toLowerCase();
  	}*/

    //Possible // TODO: Link alerts & broadcasts.

    //If no time is specified (or the time given equals today's), current/today's weather is displayed, else weather at a given time is provided.
    //The only exception is alerts, as http requests that include time do not return any alerts.
    //Hence, alerts will instead prompt a non-time http request.
    if (agent.parameters.date && weathertype!="alert" && !sameDay) {
      var date = "," + agent.parameters.date;
    }

    client.get("https://api.darksky.net/forecast/a12b8829b95a30d78caa024f91d3e845/51.4816,3.1791" + date + "?units=si", function(response) {
      let resp = JSON.parse(response);

      switch(weathertype) {
        default:
        agent.add("Seems like something went wrong. Could you try rephrasing that?");
        return;

        case "weather":
        if (!date) {
          agent.add("Today's forecast: " + resp.hourly.summary);
        }
        else {
          agent.add("Forecast for " + agent.parameters.date + ": " + resp.hourly.summary);
        }
        return;

        case "precipitation":
        var data = resp.daily.data[0];
        if (!date){
          if (data.precipType == undefined){
            agent.add("There's no predicted precipitation of any kind today.");
          }
          else {
            agent.add("Today's precipitation forecast: " + (data.precipProbability*100) + " % chance of " + data.precipType + " at a rate of " + data.precipIntensity + " millimetres per hour, reaching a maximum at " + convertUNIX(data.precipIntensityMaxTime) + ".");
          }
        }
        else {
          if (data.precipType == undefined){
            agent.add("There's no predicted precipitation of any kind on " + agent.parameters.date + ".");
          }
          else {
            agent.add("Precipitation forecast for " + agent.parameters.date + ": " + (data.precipProbability*100) + " % chance of " + data.precipType + " at a rate of " + data.precipIntensity + " millimetres per hour, reaching a maximum at " + convertUNIX(data.precipIntensityMaxTime) + ".");
          }
        }
        return;

        case "temperature":
        var data = resp.daily.data[0];
        if (!date) {
          agent.add("Current temperature: " + resp.currently.temperature + "°C. Highest predicted temperature today: " + data.temperatureMax + "°C at " + convertUNIX(data.temperatureMaxTime) + ". Lowest: " + data.temperatureMin + "°C at " + convertUNIX(data.temperatureMinTime) + ".");
        }
        else {
          agent.add("Highest predicted temperature for " + agent.parameters.date + ": " + resp.temperatureMax + "°C at " + convertUNIX(resp.temperatureMaxTime) + ". Lowest: " + resp.temperatureMin + "°C at " + convertUNIX(data.temperatureMinTime) + ".");
        }
        return;

        case "humidity":
        if(!date) {
          agent.add("Current humidity: " + (resp.currently.humidity*100) + "%.");
        }
        else {
          agent.add("Predicted humidity for " + agent.parameters.date + ": " + (resp.daily[0].humidity*100) + "%.");
        }
        return;

        case "cloud cover":
        if (!date) {
          agent.add("Cloud cover is currently at " + (resp.currently.cloudCover*100) + "%.");
        }
        else {
          agent.add("Predicted cloud cover for " + agent.parameters.date + ": " + (resp.daily[0].cloudCover*100) + "%.");
        }
        return;

        case "wind":
        if (!date){
          agent.add("Wind speed is currently " + resp.currently.windSpeed + " m/s with gusts up to " + resp.currently.windGust + "m/s.");
        }
        else {
          agent.add("Predicted wind speed for " + agent.parameters.date + ": " + resp.daily[0].windSpeed + "m/s with gusts up to " + resp.daily[0].windGust + "m/s.");
        }
        return;

        case "sunrise":
        agent.add("The sun rises at " + convertUNIX(resp.daily.data[0].sunriseTime) + ".");
        return;

        case "sunset":
        agent.add("The sun sets at " + convertUNIX(resp.daily.data[0]) + ".");
        return;

        case "alert":
        if (resp.alerts) {
          var alerts = "";
          for (var i = 0; i < resp.alerts.length; i++) {
            alerts += resp.alerts[i].title + " at " + convertUNIX(resp.alerts[i].time) + ".\nExpires " + convertUNIX(resp.alerts[i].expires) + ".\n";
            alerts += "Description: " + resp.alerts[i].description;
          }
        }
        return;
      }
    });
  }
}


//Used for testing
/*var date = "";
var client = new HttpClient();
client.get("https://api.darksky.net/forecast/a12b8829b95a30d78caa024f91d3e845/51.4816,3.1791" + date + "?units=si", function(response) {
  let resp = JSON.parse(response);
  let string = JSON.stringify(response);
  var sunrise1 = resp.daily.data[0].sunriseTime;
  var sunrise2 = resp.daily.data[1].sunriseTime;
  if (sunrise1 > resp.currently.time){
    console.log("The sun rises at " + convertUNIX(sunrise1) + " today.");
  }
  else {
    console.log("The sun rises at " + convertUNIX(sunrise2) + " tomorrow.");
  }
  for (var i = 0; i < resp.daily.data.length; i++) {
    var rain = resp.daily.data[i];
    if (rain.precipType == undefined) {
      console.log("No precipitation.");
    }
    else {
    console.log((rain.precipProbability*100) + " % chance of " + rain.precipType + " at a rate of " + rain.precipIntensity + " millimetres per hour, reaching a maximum intensity of " + rain.precipIntensityMax + " mm/h at " + convertUNIX(rain.precipIntensityMaxTime) + ".");
    }
    console.log(rain.precipIntensity);
    console.log(rain.precipProbability);
    console.log(rain.precipType);
    console.log("The temperature is currently " + resp.currently.temperature + "°C." + "Highest temperature today: " + rain.temperatureMax + "°C at " + convertUNIX(rain.temperatureMaxTime) + ". Lowest: " + rain.temperatureLow + "°C at " + convertUNIX(rain.temperatureLowTime) + ".");
}
});
*/
