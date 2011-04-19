/**
 * Expresso Unit Tests
 * 
 */

var util = require('util');
var assert = require('assert');
var config = require('./config.js');

var simplegeo = require('../lib/simplegeo.js');


if (!config.key || !config.secret) {
    console.log('Please set api key and secret in config.js.');
    return;
}

function create() {
    return new simplegeo.SimpleGeo(config.key,config.secret);
}

module.exports = {
    createClient: function() {
        var sg = create();
        assert.isNotNull(sg);
    }
}
