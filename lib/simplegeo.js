var OAuth = require('oauth').OAuth,
    QueryString = require('querystring'),
    Http = require('http');

function emptyFn () {}

var SimpleGeo = exports.SimpleGeo = function(key,secret) {
    var endpoint = "api.simplegeo.com";

    var oauth = false;
    if (key && secret) {
        //Create bare oauth object for SimpleGeo Two-Legged OAuth
        oauth = new OAuth('','',key,secret,'1.0',null,'HMAC-SHA1');
    }

    this.call = function (version,path,method,callback) {
        var headers = {
            "Host": endpoint,
            "Content-Type": "application/json; charset=utf-8"
        };

        var options = {
            host: endpoint,
            path: '/' + version + path,
            method: method,
            headers: headers
        };

        Http.request(options, function (res) {
            var data = '';
            var err = null;

            res.addListener('data', function (chunk) {
                data += chunk.toString();
            });

            res.addListener('end', function () {
                if (res.statusCode >= 400) {
                    err = {statusCode:res.statusCode,data:JSON.parse(data)};
                    data = null;
                } else {
                    data = JSON.parse(data);
                }
                callback(err,data,res);
            });
        }).end();
    }

    this.secure_call = function (version,path,method,callback,obj) {
        if (!oauth) throw "RuntimeException: oauth was not instantiated";
        callback = callback || emptyFn;

        var resource = 'http://' + endpoint + '/' + version + path;

        var cb = function (e,d,r) {
            //Sanitize
            if (typeof e == 'string') 
                e = JSON.parse(e);
            else if (typeof e.data == 'string')
                e.data = JSON.parse(e.data);

            if (typeof d == 'string') d = JSON.parse(d);

            callback(e,d,r);
        }

        switch (method) {
            case 'GET':
                oauth.get(resource,'','',cb);
                break;
            case 'PUT':
            case 'POST':
                oauth.post(resource,'','',JSON.stringify(obj),null,cb);
                break;
            case 'DELETE':
                oauth.delete(resource,'','',cb);
                break;
        }
    }
}

SimpleGeo.Layer = function (params,client) {
    params = params || {};

    this.name = params.name || "";
    this.title = params.title || "";
    this.description = params.description || "";
    this.public = params.public || false;
    this.created = params.created || null;
    this.updated = params.updated || null;

    this.client = client;
}

SimpleGeo.Record = function (params) {
}

SimpleGeo.Feature = function (params) {
}

/**
 * SimpleGeo Storage: Layer Management
 * Get Layers
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-storage#layer-management
 */
SimpleGeo.prototype.getLayers = function (params,callback) {
    if (typeof params == 'function') {
        callback = params;
        params = [];
    }

    var qs = QueryString.stringify(params);
    this.secure_call('0.1','/layers.json?'+qs,'GET',function (e,d,r) {
        if (!e) {
            for (i in d.layers) {
                if (d.layers.hasOwnProperty(i)) {
                    d.layers[i] = new SimpleGeo.Layer(d.layers[i],this);
                }
            }
        }

        callback(e,d,r);
    });
}

/**
 * SimpleGeo Storage: Layer Management, cont.
 * Get Layer Details
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-storage#layer-management
 */
SimpleGeo.prototype.getLayerDetails = function (name,callback) {
    if (!name) throw "InvalidArgument: name is required";
    this.secure_call('0.1','/layers/'+name+'.json','GET',function (e,d,r) {
        if (!e) {
            d = new SimpleGeo.Layer(d);
        }

        callback(e,d,r);
    });
}

/**
 * SimpleGeo Storage: Layer Management, cont
 * Create or Update Layer
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-storage#layer-management
 */
SimpleGeo.prototype.putLayerDetails = function (name,layer,callback) {
    if (!name) throw "InvalidArgument: name is required";
    if (!layer instanceof Object) throw "InvalidArgument: layer is required and must be object";
    this.secure_call('0.1','/layers/'+name+'.json','PUT',callback,layer);
}
SimpleGeo.prototype.createLayer = SimpleGeo.prototype.putLayerDetails;
SimpleGeo.prototype.updateLayer = SimpleGeo.prototype.putLayerDetails;

/**
 * SimpleGeo Storage: Layer Management, cont
 * Delete Layer
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-storage#layer-management
 */
SimpleGeo.prototype.deleteLayer = function (name,callback) {
    if (!name) throw "InvalidArgument: name is required";
    this.secure_call('0.1','/layers/'+name+'.json','DELETE',callback);
}

/**
 * SimpleGeo Storage: Record Management
 * Create Single Record
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-storage#single-record
 */
SimpleGeo.prototype.putRecord = function (id,layer,record,callback) {
    if (!id) throw "InvalidArgument: id is required";
    if (!layer) throw "InvalidArgument: layer is required";
    this.secure_call('0.1','/records/'+layer+'/'+id+'.json','PUT',callback,record);
}
SimpleGeo.prototype.createRecord = SimpleGeo.prototype.putRecord;
SimpleGeo.prototype.updateRecord = SimpleGeo.prototype.putRecord;

/**
 * SimpleGeo Storage: Record Management
 * Get Single Record
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-storage#single-record
 */
SimpleGeo.prototype.getRecord = function (id,layer,callback) {
    if (!id) throw "InvalidArgument: id is required";
    if (!layer) throw "InvalidArgument: layer is required";
    this.secure_call('0.1','/records/'+layer+'/'+id+'.json','GET',callback);
}

/**
 * SimpleGeo Storage: Record Management
 * Delete Single Record
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-storage#single-record
 */
SimpleGeo.prototype.deleteRecord = function (id,layer,callback) {
    if (!id) throw "InvalidArgument: id is required";
    if (!layer) throw "InvalidArgument: layer is required";
    this.secure_call('0.1','/records/'+layer+'/'+id+'.json','DELETE',callback);
}

/**
 * SimpleGeo Storage: Record Management
 * Post Multiple Records
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-storage#single-record
 */
SimpleGeo.prototype.postRecords = function (layer,records,callback) {
    if (!layer) throw "InvalidArgument: layer is required";
    this.secure_call('0.1','/records/'+layer+'.json','POST',callback,records);
}

/** 
 * SimpleGeo Storage: Record Management
 * Query Nearby Records
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-storage#nearby
SimpleGeo.prototype.getNearbyRecords = function (layer,param,params,callback) {
    var param_string = "";
    var qs = "";

    if (typeof params == 'function') {
        callback = params;
        params = {};
    }

    qs = QueryString.stringify(params);

    this.secure_call('0.1','/records/'+layer+'/nearby/'+param_string+'.json?'+qs,'GET',callback);
}
 */

/**
 * SimpleGeo Storage: Record Management
 * Get Record History
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-storage#record-history
 */
SimpleGeo.prototype.getRecordHistory = function (id,layer,limit,callback) {
    if (!id) throw "InvalidArgument: id is required";
    if (!layer) throw "InvalidArgument: layer is required";

    if (typeof limit == 'function') {
        callback = limit;
        limit = 10;
    }

    this.secure_call('0.1','/records/'+layer+'/'+id+'/history.json?limit='+limit,'GET',callback);
}

/** 
 * SimpleGeo Features: Get Feature Details
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-features#get-detailed-information
 */
SimpleGeo.prototype.getFeatureDetails = function (handle,callback) {
    if (!handle) throw "InvalidArgument: handle is required";
    this.call('1.0','/features/'+handle+'.json','GET',callback);
}

/**
 * SimpleGeo Features: List of Feature Categories
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-features#list-feature-categories
 */
SimpleGeo.prototype.getFeatureCategories = function (callback) {
    this.call('1.0','/features/categories.json','GET',callback);
}

/**
 * SimpleGeo Features: Annotating Features
 * Get Feature Annotations
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-features#list-feature-categories
 */
SimpleGeo.prototype.getFeatureAnnotations = function (handle,callback) {
    if (!handle) throw "InvalidArgument: handle is required";
    this.call('1.0','/features/'+handle+'/annotations.json','GET',callback);
}

/**
 * SimpleGeo Features: Annotating Features, cont.
 * Post Feature Annotations
 * @see https://simplegeo.com/docs/api-endpoints/simplegeo-features#list-feature-categories
 */
SimpleGeo.prototype.postFeatureAnnotations = function (handle,annot,callback) {
    if (!handle) throw "InvalidArgument: handle is required";
    if (!annot instanceof Object) throw "InvalidArgument: annot is required and must be an Object";
    this.secure_call('1.0','/features/'+handle+'/annotations.json','POST',callback,annot);
}



//////////////////////////////////////////
/**** SimpleGeo Layer Object Methods ****/
//////////////////////////////////////////

/**
 *
 */
SimpleGeo.Layer.prototype.getRecord = function (id,callback) {
}
