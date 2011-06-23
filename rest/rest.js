var http = require('https');
var fs = require('fs');

var access_token;
var instance_url;
var response;
var api = process.env.API || '22.0';
var data;
	
var callBackFunction;

function redirectUser() {
	response.write(data);  
    response.end();
}



function execute(endpoint,method,reqData,url,token,_res){
	response = _res;
	data = '';
	var host = (require('url').parse(url))['host'];
	
	console.log(':::: EXECUTE REQUEST ::::::');
	
	console.log(endpoint);
	console.log(method);
	console.log(reqData);
	console.log(url);
	console.log(token);
		
	if(method == 'GET' || method == 'DELETE') {
		endpoint += reqData;
	}
	
	console.log('APEX ENDPOINT::'+endpoint);
	
	var options = {
		host: host,
		path: '/services/apexrest/'+endpoint,
		method: method,
		headers: {
			'Host': host,
			'Authorization': 'OAuth '+token,
		//	'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate'
		}
		
	}
	console.log(options.headers);
	var req = http.request(options, function(res) {
		  console.log("statusCode: ", res.statusCode);
		  console.log("headers: ", res.headers);
		
		  res.on('data', function(_data) {
		  //  console.log("DATA"+_data);
		    data += _data;
		 	});
		
		  res.on('end', function(d) {
		  //	console.log("END"+data);
		  	redirectUser(res);
		  	});
		
		}).on('error', function(e) {
		  console.log(e);
		//  errorCallback(e);
		})
	if(method != 'GET' && method != 'DELETE') {
		console.log('POSTDATA::'+unescape(reqData));
		req.write(unescape(reqData));
	}
	req.end();			
	}

function query(soql,url,token,_res) {
	response = _res;
	data = '';
	var host = (require('url').parse(url))['host'];
	var options = {
		host: host,
		path: '/services/data/v'+api+'/query?q='+escape(soql),
		method: 'GET',
		headers: {
			'Host': host,
			'Authorization': 'OAuth '+token,
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate'
		}
		
	}
	console.log(options.headers);
	var req = http.request(options, function(res) {
		  console.log("statusCode: ", res.statusCode);
		  console.log("headers: ", res.headers);
		
		  res.on('data', function(_data) {
		    console.log("DATA"+_data);
		    data += _data;
		 	});
		
		  res.on('end', function(d) {
		  //	console.log("END"+data);
		  	redirectUser(res);
		  	});
		
		}).on('error', function(e) {
		  console.log(e);
		//  errorCallback(e);
		})
	
	req.end();
		
	}


function getObjectById(id,type,url,token,_res) {
	response = _res;
	data = '';
	var host = (require('url').parse(url))['host'];

	var options = {
		host: host,
		path: '/services/data/v'+api+'/sobjects/'+type+'/'+id,
		method: 'GET',
		headers: {
			'Host': host,
			'Authorization': 'OAuth '+token,
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate',
			'Content-type':'application/json; charset=UTF-8'
		}
		
	}
	console.log(options.headers);
	var req = https.request(options, function(res) {
		  console.log("statusCode: ", res.statusCode);
		  console.log("headers: ", res.headers);
		
		  res.on('data', function(_data) {
		  //  console.log("DATA"+_data);
		    data += _data;
		 	});
		
		  res.on('end', function(d) {
		  //	console.log("END"+data);
		  	redirectUser(res);
		  	});
		
		}).on('error', function(e) {
		  console.log(e);
		//  errorCallback(e);
		})
	req.write()
	req.end();
		
	}
	
function update(object,id,type,url,token,_res) {
	response = _res;
	data = '';
	var host = (require('url').parse(url))['host'];

	var options = {
		host: host,
		path: '/services/data/v'+api+'/sobjects/'+type+'/'+id,
		method: 'PATCH',
		headers: {
			'Host': host,
			'Authorization': 'OAuth '+token,
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate',
			'Content-type':'application/json; charset=UTF-8'
		}
		
	}
	console.log(options.headers);
	var req = http.request(options, function(res) {
		  console.log("statusCode: ", res.statusCode);
		  console.log("headers: ", res.headers);
		
		  res.on('data', function(_data) {
		    console.log("DATA"+_data);
		    data += _data;
		 	});
		
		  res.on('end', function(d) {
		  	console.log("END"+data);
		  	redirectUser(res);
		  	});
		
		}).on('error', function(e) {
		  console.log(e);
		//  errorCallback(e);
		})
	req.write(object)
	req.end();
		
	}

function create(object,type,url,token,_res) {
	response = _res;
	data = '';
	var host = (require('url').parse(url))['host'];
	var options = {
		host: host,
		path: '/services/data/v'+api+'/sobjects/'+type,
		method: 'POST',
		headers: {
			'Host': host,
			'Authorization': 'OAuth '+token,
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate',
			'Content-type':'application/json; charset=UTF-8'
		}
		
	}
	console.log(options.headers);
	var req = http.request(options, function(res) {
		  console.log("statusCode: ", res.statusCode);
		  console.log("headers: ", res.headers);
		
		  res.on('data', function(_data) {
		    console.log("DATA"+_data);
		    data += _data;
		 	});
		
		  res.on('end', function(d) {
		  	console.log("END"+data);
		  	redirectUser(res);
		  	});
		
		}).on('error', function(e) {
		  console.log(e);
		//  errorCallback(e);
		})
	req.write(object)
	req.end();
		
	}
	
function deleteObject(id,type,url,token,_res) {
	response = _res;
	data = '';
	var host = (require('url').parse(url))['host'];
	var options = {
		host: host,
		path: '/services/data/v'+api+'/sobjects/'+type+'/'+id,
		method: 'DELETE',
		headers: {
			'Host': host,
			'Authorization': 'OAuth '+token,
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate',
			'Content-type':'application/json; charset=UTF-8'
		}
		
	}
	console.log(options.headers);
	var req = http.request(options, function(res) {
		  console.log("statusCode: ", res.statusCode);
		  console.log("headers: ", res.headers);
		
		  res.on('data', function(_data) {
		    console.log("DATA"+_data);
		    data += _data;
		 	});
		
		  res.on('end', function(d) {
		  	console.log("END"+data);
		  	redirectUser(res);
		  	});
		
		}).on('error', function(e) {
		  console.log(e);
		//  errorCallback(e);
		})
	req.end();
		
	}
	

module.exports = {
 access_token : access_token,
 instance_url : instance_url,
 getObjectById : getObjectById,
 query : query,
 update : update,
 create : create,
 deleteObject : deleteObject,
 execute: execute,
 response : response,
 };