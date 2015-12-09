'use strict'

var geocode = require('./geocode')
var net = require('./net')

/**
 * Helper function to get_forecast()
 * Return the forecast given a set of options and optional geo code information
 * Assumes geo code info is provided otherwise and error is thrown
 * see get_forecast() below
 */
var forecast = function (options, callback, geo_data) {
  if (!geo_data) return callback("Geo data must be provided")
  var opts = require('../config').forecast_opts
  opts.path = opts.path(geo_data.lat, geo_data.lng, options)
  net.get(opts, function(err, result) {
    if (err) return callback(err)
    result.geo_data = geo_data
    callback(null, result)
  })
}

/**
 * Return the forecast given a set of options and optional geo code information
 * if geo code is provided, then a simple api forecast request is made
 * otherwise, the geo code info is fetched from mapquest before making the forecast request
 * @param options options for customizing api forecast data. see options variable in weather.js
 * @param callback called with final forecast data once retrieved. or you know, error if any
 * @param geo_data optional argument. If provided, then it must contain lat, lng fields
 */
exports.get_forecast = function (options, callback, geo_data) {
  if (geo_data)
    return forecast(options, callback, geo_data)
  geocode.get_geocode(options.location,
    function(err, geo_data) {
      if (err) return callback(err)
      return forecast(options, callback, geo_data)
    })
}
