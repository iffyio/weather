/* globals console, require*/
'use strict'

var config = require('../config')
var net = require('./net')

/**
 * Auto locate user based on their ip address
 * Uses freegeoip.net for this purpose
 * @param callback - calls back this function with the geo code information
 */
exports.auto_locate = function (callback) {
  net.get({
    host: "http://freegeoip.net",
    port: 80,
    path: "/json/"
  }, function (err, result) {
    if (err || !result.latitude || !result.longitude)
      return callback("Unable to autolocate geographical info")
    callback(null, {
      lat:  result.latitude,
      lng:  result.longitude,
      location: result.city,
      //adds extra info about location. See parse_geocode()
      area: " in " + result.region_name + " City " +
            " '" + result.country_code + "'"
    })
  })
}

/**
 * Extracts a geocode object from the result of the api call
 * chooses the first location from an array of locations then -
 * returns an object containing latitude and longitude values plus
 * string 'area' containing extra location info
 * @param result - json object from mapquest containing geo code information
 * @param callback called with final parsed geo object containing 'lat', 'lng' fields
 */
var parse_geocode = function(result, callback) {
  var locations = result.results[0].locations
  var location = locations[0]
  var latlng = location.latLng //latitude and longitude
  //add possible additional info about location
  var country_code = " '" + location.adminArea1 + "'"
  latlng.area = location.adminArea5? " in " + location.adminArea5 +
                " " + location.adminArea5Type + country_code
                : country_code
  callback(null, latlng)
}

/**
 * retrieve geo code from mapquest info using the net module
 * 'config.geocode_opts' already contains the host but 'config.path()' -
 * is used to construct path for location.
 * concat and press send (using the net module ofc)
 * @param location - place to be converted to geocode
 * @param callback - function called with final geo code result or error if any
 */
exports.get_geocode = function(location, callback) {
  var opts = config.geocode_opts
  opts.path = opts.path(location)
  net.get(opts, function (err, gcode_response) {
    if (err) return callback("failed to get geo code")
    parse_geocode(gcode_response, callback)
  })
}
