var fs = require('fs');
var url = require('url');
var server;

var http;
var httpServer;
var port = process.env.PORT || 3000;

var oauth = require('./oauth');
var rest = require('./rest');

var snip = require('./snip');

// Use environment variables to set CLIENT_ID etc. On Heroku, set these like
// this:
// heroku config:add CLIENT_ID=somelongstring CLIENT_SECRET=somedigits etc
// Just test locally and then git to Heroku when ready to deploy (in theory)

oauth.setKeys(process.env.CLIENT_ID,process.env.CLIENT_SECRET);
oauth.setCallback('https://'+process.env.APP_DOMAIN+'/token','views/'+process.env.START_PAGE+'.html');

if(typeof(process.env.PORT) == 'undefined') {  //you are probably not on Heroku, setup your own SSL
	// This info is out of date when referring to HTTPS, but the cert gen is the same: http://www.silassewell.com/blog/2010/06/03/node-js-https-ssl-server-example/
	http = require('https');
	var options = { //sample cert setup
  		key: fs.readFileSync('../privatekey.pem').toString(),
  		cert: fs.readFileSync('../certificate.pem').toString()
	};
	console.log('SSL Configured');
	
	server = http.createServer(options,RESTHandler);
} else {
	http = require('http');
	server = http.createServer(RESTHandler);
	console.log('HTTP Configured');
}


  
server.listen(port);
console.log('REST Listening on '+port);



//RESTful API router
function RESTHandler (req, res) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;

  var cookies = {};
  req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
    var parts = cookie.split('=');
    cookies[ parts[ 0 ].trim() ] = unescape(( parts[ 1 ] || '' ).trim());
  });
  
  console.log('_____________________________________________________________________________________');
  console.log("Request::::"+req.url);
  console.log("Cookies Access Token ::::"+cookies.access_token);
  console.log("Cookies Refresh Token::::"+cookies.refresh_token);
  console.log("Cookies Instance URL ::::"+cookies.instance_url);
  
  
  
  if(req.url == '/' ) {
  	console.log('Displaying Index Page');
	fs.readFile('views/index.html', 'utf8', function(err, data){
    	res.writeHead(200, {'Content-Type':'text/html'});  
    	res.write(snip.snip(data));  
    	res.end();
  		});
  }
  //RESTful API
  
  else if(req.url == '/login') {
  	
  	if(cookies.access_token != null && typeof(cookies.access_token) != "undefined" && cookies.access_token != "undefined") { 
  		console.log('using cookie information for login');
  		oauth.setOAuth(cookies.access_token);
  		fs.readFile(oauth.getCallbackFile(), function(err, data){
    	res.writeHead(200, {'Content-Type':'text/html'});  
    	res.write(data);  
    	res.end();
  		});
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
 
  }	else if(req.url.indexOf('/get') >= 0 && typeof(oauth.getOAuth()) != "undefined" ) {
   	
   	console.log("Getting :: "+query.id);
  	rest.getObjectById(query.id,query.type,cookies.instance_url,oauth.getOAuth().access_token,res);	
  		
  } else if(req.url.indexOf('/query') >= 0 && typeof(oauth.getOAuth()) != "undefined" ) {
   	
  	console.log("Query :: "+query.q);
  	rest.query(query.q,cookies.instance_url,oauth.getOAuth().access_token,res);
  
  } else if(req.url.indexOf('/update') >= 0 && typeof(oauth.getOAuth()) != "undefined" ) {
   	
   	console.log("Updating :: "+query.id);
  	rest.update(query.o,query.id,query.type,cookies.instance_url,oauth.getOAuth().access_token,res);
  
  } else if(req.url.indexOf('/create') >= 0 && typeof(oauth.getOAuth()) != "undefined" ) {
   	
   	console.log("Creating :: "+query.type);
  	rest.create(query.o,query.type,cookies.instance_url,oauth.getOAuth().access_token,res);
  
  } else if(req.url.indexOf('/delete') >= 0 && typeof(oauth.getOAuth()) != "undefined" ) {
   	
   	console.log("Deleting :: "+query.id);
  	rest.deleteObject(query.id,query.type,cookies.instance_url,oauth.getOAuth().access_token,res);
  
  } else if(req.url.indexOf('/execute/') >= 0 && typeof(oauth.getOAuth()) != "undefined" ) {
   	
   	restData = req.url.split('/execute/')[1];
   	restData = restData.split('/');
   	console.log("Custom Apex Execute :: "+restData[0]+"."+restData[1]);
   	
  	rest.execute(restData[0],restData[1],restData[2],cookies.instance_url,oauth.getOAuth().access_token,res);
  
  } else {
  		
  		fs.readFile('views'+req.url, 'utf8', function(err, data){
  			if(data) {
    		res.writeHead(200);  
    		res.write(snip.snip(data));  
    		res.end();
    		} else if(data == "undefined" || typeof(data) == "undefined") {
    		res.writeHead(301, {'Location' : '/404.html', 'Cache-Control':'no-cache,no-store,must-revalidate'});
  			res.end();
    		} else { //Something went horribly
    		res.writeHead(301, {'Location' : '/404.html', 'Cache-Control':'no-cache,no-store,must-revalidate'});
  			res.end();
    		}
  		});
  
  }
  		
  }

 