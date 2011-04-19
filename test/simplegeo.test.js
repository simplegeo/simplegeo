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

function createAuthClient() {
    return new simplegeo.SimpleGeo(config.key,config.secret);
}

function createUnauthClient() {
    return new simplegeo.SimpleGeo();
}

module.exports = {
    createClient: function() {
        var sg = createAuthClient();
        assert.isNotNull(sg);

        var sg = createUnauthClient();
        assert.isNotNull(sg);
    },

    unauthClient: function () {
        var sg = createUnauthClient();
        assert.throws(function(){
            sg.getLayers();    
        });
    },

    testDataErrorCallback: function () {
        var sg = createUnauthClient();
        assert.throws(function(){
            sg.getFeatureDetails();
        });
        sg.getFeatureDetails('fail',function (e,d,r) {
            assert.isNotNull(e);
            assert.isNull(d);
        });
        sg.getFeatureDetails('SG_2AziTafTLNReeHpRRkfipn',function (e,d,r) {
            assert.isNotNull(d);
            assert.isNull(e);
        });
    }
}
