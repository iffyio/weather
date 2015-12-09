
'use strict'

var forecast = require('./lib/forecast'),
    args =require('minimist')(process.argv.slice(2)),
    color = require('colors')

var units = {
  "si": {
    degrees:        "°C",
    speed:          "m/s",
    length:         "km",
    pressure:       "hPa",
    precipitation:  "mm/h"
  },
  "us": {
    degrees:        "°F",
    speed:          "mph",
    length:         "miles",
    pressure:       "mbar",
    precipitation:  "in/h"
  },
  "ca": {
    degrees:        "°C",
    speed:          "km/h",
    length:         "km",
    pressure:       "hPa",
    precipitation:  "mm/h"
  },
  "uk2": {
    degrees:        "°C",
    speed:          "mph",
    length:         "miles",
    pressure:       "hPa",
    precipitation:  "mm/h"
  }
}

var options = {
  location: "london",
  unit: "si",
  hourly: false,
  daily: false,
}

var degrees, speed, length, pressure, precipitation // values for chosen unit

// Repeat a string
function repeat(x, n) {
  var s = '';
  for (;;) {
    if (n & 1) s += x;
    n >>= 1;
    if (n) x += x;
    else break;
  }
  return s;
}

function parseUnit(unit) {
  options.unit = units[unit]? unit : options.unit  //if not valid unit then use default
  unit = units[options.unit]
  degrees = unit.degrees
  speed = unit.speed
  length = unit.length
  pressure = unit.pressure
  precipitation = unit.precipitation
}
function date(timestring) {
  return new Date(timestring * 1000)
}

function format_time(timestamp) {
  var date_ = date(timestamp)
  var hr = date_.getHours()
  var min = date_.getMinutes()
  hr = hr<10? "0"+hr : hr
  min = min<10? "0"+min : min
  return hr + ":" + min
}

//display attributes not particular to any forecast
function print_additional_info(forecast) {
  console.log("The wind speed is ", (forecast.windSpeed + " " + speed).cyan)
  console.log("The cloud coverage is ", ((forecast.cloudCover * 100).toFixed(0) + " %").cyan)
  console.log("The pressure is ", (forecast.pressure.toFixed(0) + " " + pressure).cyan)
}

//display current forecast
var print_current = function(forecast) {
  var location = options.location
  console.log((date(forecast.time) + "").cyan)
  console.log("Current weather is ", forecast.summary.rainbow, " for ",
  location.cyan, forecast.geocode.area.cyan )
  console.log("The temperature is ", (forecast.temperature + "" +  degrees + "").cyan, ", but it feels like ",
      (forecast.apparentTemperature +  "" + degrees + "").cyan)
  print_additional_info(forecast)
  console.log(repeat("-", 30).green)
}

//A data block object represents the various weather phenomena... see the forecast API for more details
var print_data_block = function(block, days) {
  console.log(block.header, block.summary)
  var forecasts = block.data //list of daily/hourly forecasts
  for(var i = 0; i < days; i++) {
    var forecast = forecasts[i]
    if (!forecast) continue
    console.log(repeat("-", 30).green)
    console.log("Forecast for ", date(forecast.time))
    console.log(forecast.summary)
    if (block.is_daily) //Only daily blocks have min / max temperature values
    console.log("The minimum temperature will be ", forecast.temperatureMin, degrees,
                " at around ", format_time(forecast.temperatureMinTime),
                ",\n", "  ", "while the maximum will be ", forecast.temperatureMax, degrees,
                " at around ", format_time(forecast.temperatureMaxTime))
    print_additional_info(forecast)
    console.log(repeat("-", 30).magenta)
  }
}

var print_alert = function (alerts) {
  alerts.forEach(function (alert) {
    console.log(alert.title)
    console.log(alert.description)
    console.log("\tExpires: ", date(alert.expires))
  })
}

function weather (geocode) {
  forecast.get_forecast(options, function (err, result) {
    if (err) return console.log(err)
    var currently = result.currently
    currently.geocode = result.geo_data
    print_current(currently)

    if (result.alerts)
      print_alert(result.alerts)

    if (options.daily && result.daily){
      result.daily.header = "Daily forecast:\n".red
      result.daily.is_daily = true // if to print max / min temperatures
      print_data_block(result.daily, options.daily)
    }
    if (options.hourly && result.hourly) {
      result.hourly.header = "Hourly forecast:\n".yellow
      result.hourly.is_daily = false
      print_data_block(result.hourly, options.hourly)
    }
  }, geocode)
}

(function (){
  //set requested options
  options.daily = args.d || options.daily
  options.hourly = args.h || options.hourly
  parseUnit(args.u || options.unit)

  //then requested location

  if (process.argv.length == 3 && !args.ignore_alerts) {
    options.location =  process.argv[2] || options.location
  }else if (!args.l) { // no specified location the autolocate
    var geocode = require('./lib/geocode')

    return geocode.auto_locate(function (err, geo_data) {
      if (err)
        return console.log(err)
      options.location = geo_data.location
      weather(geo_data)
    })
  }else {
    options.location = args.l || options.location
  }
  weather()
})()

/*usage

  -l: Location to display forecast for. Defaults to auto locating from your ip

  -d: Days of forecast to display

  -h: Hours of forecast to display

  -u: Unit system used. Defaults to si. options are us, si, uk2, ca. see forecast.io

  --ignore_alerts: Don't show alerts if any. Defaults to false



  show current weather for your location based on your ip address
  weather

  current weather for stockholm sweden
  weather 'stockholm sweden'

  show current weather for stockholm without alerts and 4 days' forecast for stockholm
  weather -l 'stockholm sweden' -d 4 --ignore_alerts

  current weather for your location plus forecast for the next 3 hours and 4 days
  weather -d 4 -h 3 -u us

 */
