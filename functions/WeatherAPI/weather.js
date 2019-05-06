module.exports = {

  getWeather:function(agent) { //Returns weather data depending on user input.

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
        
    var client = new HttpClient();
    var weathertype = agent.parameters.weathertype;
    var date = "";
    var today = new Date();
    var agentDate = new Date(agent.parameters.date);
    var sameDay = false;
    var agentResponse = "Default 2";

    if (today.getDate() === agentDate.getDate() && today.getMonth() === agentDate.getMonth() && today.getFullYear() === agentDate.getFullYear()) {
      sameDay = true;
    }

    //Possible // TODO: Link alerts & broadcasts.

    //If no time is specified (or the time given equals today's), current/today's weather is displayed, else weather at a given time is provided.
    //The only exception is alerts, as http requests that include time do not return any alerts.
    //Hence, alerts will instead prompt a non-time http request.
    if (agent.parameters.date && weathertype!=="alert" && !sameDay) {
      date = "," + agent.parameters.date;
    }

    console.log("Weathertype:" + weathertype);

    client.get("https://api.darksky.net/forecast/a12b8829b95a30d78caa024f91d3e845/51.4816,3.1791" + date + "?units=si", function(response) {
      let resp = JSON.parse(response);

      switch(weathertype) {
        default:
        agentResponse = "Seems like something went wrong. Could you try rephrasing that?";
        break;

        case "Weather":
        if (!date) {
          agentResponse = "Today's forecast: " + resp.hourly.summary;
        }
        else {
          agentResponse= "Forecast for " + agent.parameters.date + ": " + resp.hourly.summary;
        }
        break;

        case "Precipitation":
        var dataPrec = resp.daily.data[0];
        if (!date){
          if (dataPrec.precipType === undefined){
            agentResponse = "There's no predicted precipitation of any kind today.";
          }
          else {
            agentResponse = "Today's precipitation forecast: " + (dataPrec.precipProbability*100) + " % chance of " + dataPrec.precipType + " at a rate of " + dataPrec.precipIntensity + " millimetres per hour, reaching a maximum at " + convertUNIX(dataPrec.precipIntensityMaxTime) + ".";
          }
        }
        else {
          if (dataPrec.precipType === undefined){
            agentResponse = "There's no predicted precipitation of any kind on " + agent.parameters.date + ".";
          }
          else {
            agentResponse = "Precipitation forecast for " + agent.parameters.date + ": " + (dataPrec.precipProbability*100) + " % chance of " + dataPrec.precipType + " at a rate of " + dataPrec.precipIntensity + " millimetres per hour, reaching a maximum at " + convertUNIX(dataPrec.precipIntensityMaxTime) + ".";
          }
        }
        break;

        case "Temperature":
        var data = resp.daily.data[0];
        if (!date) {
          agentResponse = "Current temperature: " + resp.currently.temperature + "°C. Highest predicted temperature today: " + data.temperatureMax + "°C at " + convertUNIX(data.temperatureMaxTime) + ". Lowest: " + data.temperatureMin + "°C at " + convertUNIX(data.temperatureMinTime) + ".";
        }
        else {
          agentResponse = "Highest predicted temperature for " + agent.parameters.date + ": " + resp.temperatureMax + "°C at " + convertUNIX(resp.temperatureMaxTime) + ". Lowest: " + resp.temperatureMin + "°C at " + convertUNIX(data.temperatureMinTime) + ".";
        }
        break;

        case "Humidity":
        if(!date) {
          agentResponse = "Current humidity: " + (resp.currently.humidity*100) + "%.";
        }
        else {
          agentResponse = "Predicted humidity for " + agent.parameters.date + ": " + (resp.daily[0].humidity*100) + "%.";
        }
        break;

        case "Cloud cover":
        if (!date) {
          agentResponse = "Cloud cover is currently at " + (resp.currently.cloudCover*100) + "%.";
        }
        else {
          agentResponse = "Predicted cloud cover for " + agent.parameters.date + ": " + (resp.daily[0].cloudCover*100) + "%.";
        }
        break;

        case "Wind":
        if (!date){
          agentResponse = "Wind speed is currently " + resp.currently.windSpeed + " m/s with gusts up to " + resp.currently.windGust + "m/s.";
        }
        else {
          agentResponse = "Predicted wind speed for " + agent.parameters.date + ": " + resp.daily[0].windSpeed + "m/s with gusts up to " + resp.daily[0].windGust + "m/s.";
        }
        break;

        case "Sunrise":
        agentResponse = "The sun rises at " + convertUNIX(resp.daily.data[0].sunriseTime) + ".";
        break;

        case "Sunset":
        agentResponse = "The sun sets at " + convertUNIX(resp.daily.data[0]) + ".";
        break;

        case "Alert":
        if (resp.alerts) {
          for (var i = 0; i < resp.alerts.length; i++) {
            agentResponse += resp.alerts[i].title + " at " + convertUNIX(resp.alerts[i].time) + ".\nExpires " + convertUNIX(resp.alerts[i].expires) + ".\n";
            agentResponse += "Description: " + resp.alerts[i].description;
          }
        }
        else {
          agentResponse = "No weather alerts.";
        }
        break;
      }
    });
    agent.add(agentResponse);
    return;
  }
}


//Used for testing
/*var date = "";
var client = new HttpClient();
client.get("https://api.darksky.net/forecast/a12b8829b95a30d78caa024f91d3e845/51.4816,3.1791" + date + "?units=si", function(response) {
  let resp = JSON.parse(response);
  let string = JSON.stringify(response);
  console.log(resp.hourly.summary);
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
);
*/
