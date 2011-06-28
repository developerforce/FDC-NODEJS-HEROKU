var http = require('https');
var fs = require('fs');
var url = require('url');
var oauth = require('./../oauth');

var api = process.env.API || '22.0';
var oauth;

var endpoints = ['login','token','refresh','get','query','update','create','delete','execute'];

var pendingRequests = new Array();

function setOAuthEnv() {
	oauth.setKeys(process.env.CLIENT_ID,process.env.CLIENT_SECRET);
	oauth.setCallback('https://'+process.env.APP_DOMAIN+'/token',process.env.START_PAGE); //TODO - probably should not have view / .html embedded here
}

function redirectUser(response,data) {
	response.write(data);  
    response.end();
}

function clearOAuth() {
	oauth.clearOAuth();
}

function corruptOAuth() {
	oauth.setOAuth('foo');
}

function addToPendingAndRefresh(fallbackRequest) {
	pendingRequests.push(fallbackRequest);	
	oauth.getRefreshToken(oauth.getOAuth().refresh_token,null,refreshPendingRequests);
}

function refreshPendingRequests() {
	for(var i =0; i < pendingRequests.length; i++) {
		pendingRequests[i].refresh();
	}
	pendingRequests = new Array();
}

function checkValidSession(data) {
	data = JSON.parse(data);
	console.log('CHECKING FOR ERRORS::'+typeof(data));
	console.log('CHECKING FOR ERRORS::'+data[0]);
	
	if(typeof(data[0]) != "undefined" && typeof(data[0].errorCode) != "undefined") { //
		console.log("ERROR FOUND::"+data[0].errorCode); //Oddly, this seems to be either INVALID SESSION or INVALID CROSS REFERENCE
		if(data[0].errorCode.indexOf('INVALID') >= 0) { //we need either a new access token or to refresh the existing
			return false;
		}
	}
	
	return true;
}

function checkEndpoint(req) {
	for(var i = 0; i < endpoints.length; i++) {
		if(req.url.indexOf('/'+endpoints[i]) == 0) { return true; }
	}
	
	return false;
}


function execute(endpoint,method,reqData,_res,_callback,fallback){
	var data = '';
	var host = (require('url').parse(oauth.getOAuth().instance_url))['host'];
	
	console.log(':::: EXECUTE REQUEST ::::::');
		
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
			'Authorization': 'OAuth '+oauth.getOAuth().access_token,
		//	'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate'
		}
		
	}
	console.log(options.headers);
	var req = http.request(options, function(res) {
		  console.log("statusCode: ", res.statusCode);
		  console.log("headers: ", res.headers);
		
		  res.on('data', function(_data) {
		  //  console.log("EXECUTE DATA"+_data);
		    data += _data;
		 	});
		
		  res.on('end', function(d) {
		  	if(!checkValidSession(data)) {
		   		addToPendingAndRefresh(fallback);
		   	}
		   	else if(_res) {redirectUser(_res,data);}
		   	else if(_callback) {_callback(data); console.log('Sent Query Callback');}
		  	});
		
		}).on('error', function(e) {
		    console.log("ERROR"+e)
		    console.log(e);
		//  errorCallback(e);
		})
	if(method != 'GET' && method != 'DELETE') {
			console.log('POSTDATA::'+unescape(reqData));
			req.write(unescape(reqData));
		}
	req.end();			
	}

function query(soql,_res,_callback,fallback) {
//	response = _res;
	var data = '';
	var host = (require('url').parse(oauth.getOAuth().instance_url))['host'];
	var options = {
		host: host,
		path: '/services/data/v'+api+'/query?q='+escape(soql),
		method: 'GET',
		headers: {
			'Host': host,
			'Authorization': 'OAuth '+oauth.getOAuth().access_token,
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate'
		}
		
	}
	console.log(options.headers);
	var req = http.request(options, function(res) {
		  console.log("statusCode: ", res.statusCode);
		  console.log("headers: ", res.headers);
		
		  res.on('data', function(_data) {
		    data += _data;
		 	});
		
		  res.on('end', function(d) {
		   	if(!checkValidSession(data)) {
		   		addToPendingAndRefresh(fallback);
		   	}
		   	else if(_res) {redirectUser(_res,data);}
		   	else if(_callback) {_callback(data); console.log('Sent Query Callback');}
		  	});
		
		}).on('error', function(e) {
		  console.log(e);
		//  errorCallback(e);
		});
		
	req.end();
		
	}


function getObjectById(id,type,_res,_callback,fallback) {
//	response = _res;
	var data = '';
	var host = (require('url').parse(oauth.getOAuth().instance_url))['host'];

	var options = {
		host: host,
		path: '/services/data/v'+api+'/sobjects/'+type+'/'+id,
		method: 'GET',
		headers: {
			'Host': host,
			'Authorization': 'OAuth '+oauth.getOAuth().access_token,
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
		    if(!checkValidSession(data)) {
		   		addToPendingAndRefresh(fallback);
		   	}
		   	else if(_res) {redirectUser(_res,data);}
		   	else if(_callback) {_callback(data); console.log('Sent Query Callback');}
		  	});
		
		}).on('error', function(e) {
		  console.log(e);
		//  errorCallback(e);
		})
	req.write()
	req.end();
		
	}
	
function update(object,id,type,_res,_callback,fallback) {
//	response = _res;
	var data = '';
	var host = (require('url').parse(oauth.getOAuth().instance_url))['host'];

	var options = {
		host: host,
		path: '/services/data/v'+api+'/sobjects/'+type+'/'+id,
		method: 'PATCH',
		headers: {
			'Host': host,
			'Authorization': 'OAuth '+oauth.getOAuth().access_token,
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
		  	if(!checkValidSession(data)) {
		   		addToPendingAndRefresh(fallback);
		   	}
		   	else if(_res) {redirectUser(_res,data);}
		   	else if(_callback) {_callback(data); console.log('Sent Query Callback');}
		  	});
		
		}).on('error', function(e) {
		  console.log(e);
		//  errorCallback(e);
		})
	req.write(object)
	req.end();
		
	}

function create(object,type,_res,_callback,fallback) {
//	response = _res;
	data = '';
	var host = (require('url').parse(oauth.getOAuth().instance_url))['host'];
	var options = {
		host: host,
		path: '/services/data/v'+api+'/sobjects/'+type,
		method: 'POST',
		headers: {
			'Host': host,
			'Authorization': 'OAuth '+oauth.getOAuth().access_token,
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
		  	if(!checkValidSession(data)) {
		   		addToPendingAndRefresh(fallback);
		   	}
		   	else if(_res) {redirectUser(_res,data);}
		   	else if(_callback) {_callback(data); console.log('Sent Query Callback');}
		  	});
		
		}).on('error', function(e) {
		  console.log(e);
		//  errorCallback(e);
		})
	req.write(object)
	req.end();
		
	}
	
function deleteObject(id,type,_res,_callback,fallback) {
//	response = _res;
	data = '';
	var host = (require('url').parse(oauth.getOAuth().instance_url))['host'];
	var options = {
		host: host,
		path: '/services/data/v'+api+'/sobjects/'+type+'/'+id,
		method: 'DELETE',
		headers: {
			'Host': host,
			'Authorization': 'OAuth '+oauth.getOAuth().access_token,
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
		  	if(!checkValidSession(data)) {
		   		addToPendingAndRefresh(fallback);
		   	}
		   	else if(_res) {redirectUser(_res,data);}
		   	else if(_callback) {_callback(data); console.log('Sent Query Callback');}
		  	});
		
		}).on('error', function(e) {
		  console.log(e);
		//  errorCallback(e);
		})
	req.end();
		
	}
	
	
function RESTRouter(req, res) {
	
	console.log('_____________________________________________________________________________________');
  	
	if(checkEndpoint(req)) {
		var cookies = {};
  			req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
    		var parts = cookie.split('=');
    		cookies[ parts[ 0 ].trim() ] = unescape(( parts[ 1 ] || '' ).trim());
  		});
  		
  		console.log("REST Request::::"+req.url);
  		console.log("Cookies Access Token ::::"+cookies.access_token);
  		console.log("Cookies Refresh Token::::"+cookies.refresh_token);
  		console.log("Cookies Instance URL ::::"+cookies.instance_url);
  		
  		/*Can we maybe not reset this constantly? */
  		if(cookies.access_token != null && typeof(cookies.access_token) != "undefined" && cookies.access_token != "undefined") { 
  			oauth.setOAuth(cookies.access_token, cookies.instance_url, cookies.refresh_token);
  			console.log('OAuth set :'+oauth.getOAuth().access_token);
  		} else {
  			oauth.clearOAuth();
  		}
  		
  		//OAuth Endpoints	
	  if(req.url == '/login') {
	  	console.log('OAuth defined :'+typeof(oauth.getOAuth()));
	  	console.log('OAuth defined :'+oauth.getOAuth());
	  	
	  	if(typeof(oauth.getOAuth()) != "undefined" && oauth.getOAuth() != null) { 
	  		console.log('Logged in.  Redirecting.');
	  		console.log(oauth.getCallbackFile());
	  		res.writeHead(301, {'Location' : oauth.getCallbackFile(), 'Cache-Control':'no-cache,no-store,must-revalidate'});
	  		res.end();
	  	} else {  
	  	    console.log('Logging In with OAuth at:');
	  		console.log(oauth.getLoginUrl());
	  		res.writeHead(301, {'Location' : oauth.getLoginUrl(), 'Cache-Control':'no-cache,no-store,must-revalidate'});
	  		res.end();
	  	}
	  	
	  } else if(req.url.indexOf('/token') >= 0) {
	  	
	  	oauth.getRequestToken(req.url,res);
	  
	  } else if(req.url.indexOf('/refresh') >= 0 && typeof(cookies.refresh_token) != "undefined") {
	  	
	  	oauth.getRefreshToken(cookies.refresh_token,res);
	 
	  } else if(req.url.indexOf('/refresh') >= 0 && typeof(cookies.refresh_token) == "undefined") {
	  	
	  	console.log('No refresh token, logging normally');
	  	console.log(oauth.getLoginUrl());
	  	res.writeHead(301, {'Location' : oauth.getLoginUrl(), 'Cache-Control':'no-cache,no-store,must-revalidate'});
	  	res.end();
	 
	  }	else if(typeof(oauth.getOAuth()) != undefined ) {
  	
  		var r = new RESTRequest(req,res);
		
	  }
	  
	  	return true;
	  
	  } else {
		
		return false;
	}
}	

function RESTRequest(_req, _response, _callback) {
  
  var callback;
  var res;
  var req;

  if(_callback) { callback = _callback; }
  if(_response) { res = _response; }
  if(_req) { req = _req; }

  var url_parts = url.parse(req.url, true);
  var req_query = url_parts.query;
  
  this.refresh = function() {new RESTRequest(req,res,callback);}
  	
  console.log('REST Request for :'+req.url);
  console.log('REST Request res :'+typeof(res));
  console.log('REST Request call:'+typeof(callback));
  console.log('REST Request w/  :'+typeof(oauth.getOAuth()));
  
  //RESTful API
  if(req.url.indexOf('/get') >= 0 && typeof(oauth.getOAuth()) != "undefined" ) {
   	
   	console.log("Getting :: "+req_query.id);
  	getObjectById(req_query.id,req_query.type,res,callback,this);	
  		
  } else if(req.url.indexOf('/query') >= 0 && typeof(oauth.getOAuth()) != "undefined" ) {
   	
  	console.log("Query :: "+req_query.q);
  	query(req_query.q,res,callback,this);
  
  } else if(req.url.indexOf('/update') >= 0 && typeof(oauth.getOAuth()) != "undefined" ) {
   	
   	console.log("Updating :: "+req_query.id);
  	update(req_query.o,req_query.id,req_query.type,res,callback,this);
  
  } else if(req.url.indexOf('/create') >= 0 && typeof(oauth.getOAuth()) != "undefined" ) {
   	
   	console.log("Creating :: "+req_query.type);
  	create(req_query.o,req_query.type,res,this);
  
  } else if(req.url.indexOf('/delete') >= 0 && typeof(oauth.getOAuth()) != "undefined" ) {
   	
   	console.log("Deleting :: "+req_query.id);
  	deleteObject(req_query.id,req_query.type,res,callback,this);
  
  } else if(req.url.indexOf('/execute/') >= 0 && typeof(oauth.getOAuth()) != "undefined" ) {
   	
   	restData = req.url.split('/execute/')[1];
   	restData = restData.split('/');
   	console.log("Custom Apex Execute :: "+restData[0]+"."+restData[1]);
   	
  	execute(restData[0],restData[1],restData[2],res,callback,this);
  
  }   
}	
	

module.exports = {
 getObjectById : getObjectById,
 query : query,
 update : update,
 create : create,
 deleteObject : deleteObject,
 execute: execute,
 setOAuthEnv : setOAuthEnv,
 RESTRouter : RESTRouter,
 RESTRequest : RESTRequest,
 clearOAuth : clearOAuth,
 corruptOAuth : corruptOAuth
 };