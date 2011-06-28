var fs = require('fs');
var url = require('url');
var rest = require('./rest');
var snip = require('snip'); //not really needed, just used for this demo.  npm install snip to grab this one.

var server;

var http;
var httpServer;
var port = process.env.PORT || 3000;

// Use environment variables to set CLIENT_ID etc. On Heroku, set these like
// this:
// heroku config:add CLIENT_ID=somelongstring CLIENT_SECRET=somedigits etc
// Just test locally and then git to Heroku when ready to deploy (in theory)
rest.setOAuthEnv(); //set ENV variables to OAuth (LoginURL, Keys, Etc.)

if(typeof(process.env.PORT) == 'undefined') {  //you are probably not on Heroku, setup your own SSL
	// This info is out of date when referring to HTTPS, but the cert gen is the same: http://www.silassewell.com/blog/2010/06/03/node-js-https-ssl-server-example/
	http = require('https');
	var options = { //sample cert setup
  		key: fs.readFileSync('../privatekey.pem').toString(),
  		cert: fs.readFileSync('../certificate.pem').toString()
	};
	console.log('SSL Configured');
	
	server = http.createServer(options,HTTPHandler);
} else {
	http = require('http');
	server = http.createServer(HTTPHandler);
	console.log('HTTP Configured');
}
  
server.listen(port);
console.log('REST Listening on '+port);


//Handler function
function HTTPHandler(req,res) {
	if(req.url == '/' ) {
  	console.log('Displaying Index Page');
	fs.readFile('views/index.html', 'utf8', function(err, data){
    	res.writeHead(200, {'Content-Type':'text/html'});  
    	res.write(snip.snip(data));  
    	res.end();
  		});
  		
  } else if(req.url == '/testconsole' ) {
  	console.log('Displaying Index Page w/ testconsole');
	
	
	fs.readFile('views/index.html', 'utf8', function(err, data){
    	res.writeHead(200, {'Content-Type':'text/html'});  
    	res.write(snip.snip(data));  
    	res.end();
  		});
  		
  } else if(req.url == '/testconsole2' ) {
  	console.log('Displaying Index Page w/ testconsole2');
	
	rest.query('SELECT ID FROM ACCOUNT',null,console.log);
	
	fs.readFile('views/index.html', 'utf8', function(err, data){
    	res.writeHead(200, {'Content-Type':'text/html'});  
    	res.write(snip.snip(data));  
    	res.end();
  		});
  		
  } else if(req.url == '/clear' ) {
  	console.log('Displaying Index Page w/ clear');
	
	fs.readFile('views/index.html', 'utf8', function(err, data){
    	res.writeHead(200, {'Content-Type':'text/html'});  
    	res.write(snip.snip(data));  
    	res.end();
  		});
  		
  } else if(req.url == '/corrupt' ) {
  	console.log('Displaying Index Page w/ corrupt');
	rest.corruptOAuth();
	fs.readFile('views/index.html', 'utf8', function(err, data){
    	res.setHeader('Set-Cookie', ['access_token=undefined']); 
    	res.writeHead(301, {'Location' : '/query?q=SELECT+ID+FROM+ACCOUNT', 'Cache-Control':'no-cache,no-store,must-revalidate'});
  		res.end();
  		});
  	
  		
  } else if(rest.RESTRouter(req,res)) {
  
  	console.log('REST Request Routed');
  
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
 