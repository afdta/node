var http = require("http");
var fs = require("fs");
var draw = require("drawit");
var port = 8080;

function endSlash(s){
	var last = s.substring(s.length-1);
	return last==="/";
}

function mime(s){
	if(s.search(/\.html$/i) > -1){var t = 'text/html'}
	else if(s.search(/\.js/i) > -1){var t = 'application/javascript'}
	else if(s.search(/\.css/i) > -1){var t = 'text/css'}
	else if(s.search(/\.json/i) > -1){var t = 'application/json'}
	else{var t = 'text/html'}
	return t;
}

function requestHandler(request, response){
	var url = ".." + request.url;

	console.log("Requested url: "+url);

	if (url.search('favicon.ico') > -1) {
		response.writeHead(200, {'Content-Type': 'image/x-icon'} );
		response.end();
		console.log('Request received for favicon.ico');
		return null;
	}

	try{
		var stats = fs.statSync(url);
		var isdir = stats.isDirectory();
		var isfile = stats.isFile();
		if(isdir && !endSlash(url)){url = url+"/"}
	}
	catch(e){
		response.write("<p>No valid content</p>");
		response.end();
		return null;
	}

	console.log("Resolved url: " + url);

	if(isfile){
	    fs.readFile(url,'utf8',function (err, content){
	        response.writeHead(200, {'Content-Type': mime(url)});
	        var drawing = draw.divs([1,2,3,4,5,6,7,8,9,10,11,12,113]);
	        drawing.then(function(v){return v}, function(v){return v});

	        
	        Promise.all([content, drawing])
	        	.then(
	        	function(c){
	        		for(var i=0;i<c.length;i++){
	        			response.write(c[i]);
	        		}
	        		response.end();
	        	}
	        	);
	    	//response.write(content);
	    	//response.end();

	    });
	    console.log("**********mime type: " + mime(url));
	}
	else if(isdir){
		var dir = fs.readdir(url, function(err, files){
			if(err){
				response.write("<p>No valid content</p>");
				response.end();
				return null;
			}
			else{
				for(var i=0; i<files.length; i++){
					//response.write(files[i]);
					response.write('<p><a href=' + '"' + url + files[i] + '">' + files[i] + '</a></p>')
				}
			}
			console.log(files);

			response.end();
		});
	}
};

var server = http.createServer(requestHandler);

server.listen(port, function(){
	console.log("Listening on port " + port)
});