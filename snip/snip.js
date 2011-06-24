var fs = require('fs');

function snip(data) {
	data = data.replace(/<!-- snip:[/]?([^> ]+)[^>]* -->/g, function(match, submatch){
		console.log("File to snip out:"+submatch);
		return fs.readFileSync('snips/'+submatch, 'utf8');
		});
	
//	console.log(data);
	
	return data;
}

module.exports = {
	snip: snip
}