'use strict'

//Assign API keys
var mapquest_key  = ""
var forecast_key = ""

if (  !mapquest_key || mapquest_key.length < 1
   || !forecast_key || forecast_key.length < 1){
  console.log("No api keys provided!")
  process.exit(-1)
}


/**
 * options for making api requests within the app
 * mapquestapi.com is used for geo code information while
 * forecast.io holds actual weather info for given geo code
 */
module.exports = {
  geocode_opts : {
    host: "http://mapquestapi.com",
    port: 80,
    path: function(location) {
      return "/geocoding/v1/address?key=" +
          mapquest_key + "&location=" + location + "&outputFormat=json"
    }
  },
  forecast_opts: {
    host: "https://api.forecast.io/forecast",
    port: 80,
    path: function(lat, lng, options) {
      //configurable options for forecast query
      var hr = options.hourly? "" : ",hourly"
      var daily = options.daily? "" : ",daily"
      var unit = options.unit || "si"
      //hourly and daily flags are configurable while minute is not because no one is that paranoid(?)
      return "/" + forecast_key + "/" + lat + "," + lng + "/?"
              + "exclude=flags,minute"+ hr + daily + "&units=" + unit
    }
  }
}
