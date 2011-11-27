# simplegeo

A NodeJS library for [SimpleGeo](http://simplegeo.com) with convenience methods for 
SimpleGeo api endpoints. 

    var SimpleGeo = require('simplegeo').SimpleGeo;

    var sg = new SimpleGeo('key','secret');
    sg.getLayers(function (err,data) { 
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                console.log(data[i]);
            }
        }
    });

For SimpleGeo Places 1.0 and 1.2, you must make separate calls:

    var SimpleGeo = require('simplegeo').SimpleGeo;
    var sg_places12 = new SimpleGeo.Places12('key', 'secret');
    sg_places12.getNearbyPlacesText('Stanford University', function(err,data) {
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                console.log(data[i]);
            }
        }
    });