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
