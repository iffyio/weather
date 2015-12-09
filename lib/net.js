/* globals console, module, require */
'use strict'

var request = require('request') //npm install request

/**
 * retrieves data from the network
 * results are expected to be in JSON format otherwise the alarm bells go off
 * @param options containing at least 'host' and 'path' fields.
 * @param callback
 */
var get = function(options, callback) {
    request(options.host + options.path, function(err, res, body) {
      if (err || res.statusCode > 200)
        return callback("Network error")
      res.setEncoding('utf8')
      var result;
      try {
        result = JSON.parse(body);
      }catch (parse_error) {
        callback("Invalid file format")
      }
      callback(null, result)
    })
}

module.exports =  {
  get: get
}
