var http = require('https');
var fs = require('fs');

var publicKey = '';
var privateKey = '';

var callbackURI = ''; //typically your URL + '/token';
var callbackFile = 'views/index.html';

var oauthPrefix = 'https://login.salesforce.com/services/oauth2/authorize'; //typically https://login.salesforce.com/services/oauth2/authorize
var oauthURL = oauthPrefix + '?display=touch&response_type=code&client_id='+publicKey+'&redirect_uri='+callbackURI;
var hostname = 'login.salesforce.com'; //typically login.salesforce.com


var requestToken;
var oauthResponse;

function getToken() { return requestToken; }
function getOAuth() { return oauthResponse; }

function setOAuth(oauth) {
	oauthResponse = {access_token: oauth};
}

function getLoginUrl() {
	return oauthURL;
}

function setKeys(pubKey,privKey) {
	publicKey = pubKey;
	privateKey = privKey;
	setHost(oauthPrefix,hostname);
	console.log(oauthURL);
}

function setCallback(uri,filename) {
	callbackURI = uri;
	callbackFile = filename;
	setHost(oauthPrefix,hostname);
}

function getCallbackFile() {
	return callbackFile;
}

function setHost(oauth,host) {
	oauthPrefix = oauth;
	oauthURL = oauthPrefix + '?display=touch&response_type=code&client_id='+publicKey+'&redirect_uri='+callbackURI;
	hostname = host;
}


function getRequestToken(url, res) {
	var tokenURL = unescape(url);
	requestToken = escape(tokenURL.substring(tokenURL.indexOf("code=")+5,tokenURL.length));
	console.log('Request Token:::'+requestToken);
	getAccessToken(requestToken, res);
}

function redirectUser(res) {
	console.log('RESPONSE:::'+oauthResponse);
	console.log('RESPONSE:::'+oauthResponse.access_token);
	console.log('RESPONSE:::'+oauthResponse.refresh_token);
	console.log('RESPONSE:::'+oauthResponse.instance_url);
		
	fs.readFile(callbackFile, function(err, data){
    	res.setHeader('Set-Cookie', ['refresh_token='+oauthResponse.refresh_token,
    	    'access_token='+oauthResponse.access_token,
    	    'instance_url='+oauthResponse.instance_url]); 
    	res.write(data);  
    	res.end();
  		});
}	


function getAccessToken(token, clientResonse) {
	console.log('Getting Access Token for '+token);
	
	var post_data = 'code='+token+'&grant_type=authorization_code&client_id='+publicKey+'&redirect_uri='+escape(callbackURI)+'&client_secret='+privateKey;
	console.log(post_data);
	console.log();
	console.log(publicKey);
	console.log(privateKey);
	
	var options = {
		host: hostname,
		path: '/services/oauth2/token',
		method: 'POST',
		headers: {
			'host': hostname,
			'Content-Length': post_data.length,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate'
		}
	};
	
	var req = http.request(options, function(res) {
		  console.log("statusCode: ", res.statusCode);
		  console.log("headers: ", res.headers);
		
		  res.on('data', function(data) {
		    oauthResponse = JSON.parse(data);
		    console.log("DATA::"+data);
		 	});
		
		  res.on('end', function(d) {
		  	redirectUser(clientResonse);
		  	});
		
		}).on('error', function(e) {
		  console.error(e);
		});
	
	req.write(post_data);
	req.end();
		
	}
	
function getRefreshTokenToken(token, clientResponse) {
	console.log('Getting Access Token for '+token);
	
	var post_data = 'refresh_token='+token+'&grant_type=authorization_code&client_id='+publicKey+'&redirect_uri='+escape(callbackURI)+'&client_secret='+privateKey;
	console.log(post_data);
	console.log();
	console.log(publicKey);
	console.log(privateKey);
	
	var options = {
		host: hostname,
		path: '/services/oauth2/token',
		method: 'POST',
		headers: {
			'host': hostname,
			'Content-Length': post_data.length,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate'
		}
	};
	
	var req = http.request(options, function(res) {
		  console.log("statusCode: ", res.statusCode);
		  console.log("headers: ", res.headers);
		
		  res.on('data', function(data) {
		    newResponse = JSON.parse(data);
		    oauthResponse.access_token = newResponse.access__token;
		    console.log("DATA::"+data);
		 	});
		
		  res.on('end', function(d) {
		  	redirectUser(clientResponse);
		  	});
		
		}).on('error', function(e) {
		  console.error(e);
		});
	
	req.write(post_data);
	req.end();
		
	}


module.exports = {
 oauthURL : oauthURL,
 getRequestToken : getRequestToken,
 getToken: getToken,
 getOAuth: getOAuth,
 setOAuth: setOAuth,
 getLoginUrl: getLoginUrl,
 getAccessToken: getAccessToken,
 setKeys: setKeys,
 setCallback: setCallback,
 getCallbackFile: getCallbackFile,
 setHost: setHost
 };