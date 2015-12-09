var http = require("http");
var fs = require("fs");
var draw = require("drawit");
var port = 8080;

function endSlash(s){
	var last = s.substring(s.length-1);
	return last==="/";
}

function mime(s){
	if(s.search(/\.html$/i) > -1){var t = 'text/html'; var b=false;}
	else if(s.search(/\.js/i) > -1){var t = 'application/javascript'; var b=false;}
	else if(s.search(/\.css/i) > -1){var t = 'text/css'; var b=false;}
	else if(s.search(/\.json/i) > -1){var t = 'application/json'; var b=false;}
	else if(s.search(/\.png/i) > -1){var t = 'image/png'; var b=true;}
	else if(s.search(/\.jpe?g/i) > -1){var t = 'image/jpeg'; var b=true;}
	else{var t = null; var b = null}
	return {t:t, b:b};
}

function requestHandler(request, response){
	var url = request.url;
	if(url == "/"){url = "/home/alec/Projects/"} //default directory is the projects folder. previously the url was set to the current directory, but this was causing problems in nested folders. now it's always relative to the root of the filesystem. probably not secure, but OK for local testing...

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
		console.log(e);
		response.write("<p>No valid content</p>");
		response.end();
		return null;
	}

	console.log("Resolved url: " + url);

	var MM = mime(url);
	if(isfile && !MM.b){
	    fs.readFile(url,'utf8',function (err, content){
	    	
	    	if(MM.t){
	    		response.writeHead(200, {'Content-Type': MM.t});
	    	}
	    	else{
	    		//mime only has cases for a small subset of types -- let browser figure it out rather than adding bad mime types that may cause items to render improperly
	    		response.writeHead(200);
	    	}
	        
	        
	        if(MM.t==="text/html"){
	        	var drawing = draw.divs([1,2,3,4,5,6,7,8,9,10,11,12,113]);
	        	//drawing.then(function(v){return v}, function(v){return v});
	        }
	        else{
		        //var drawing = new Promise(function(resolve, reject){
		        //	resolve('');
		        //});
		        var drawing = Promise.resolve('');	        	
	        }

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
	}
	else if(isfile && MM.b){
		fs.readFile(url,function (err, content){
			response.writeHead(200, {'Content-Type': MM.t});
			response.write(content);
			response.end();
		})
	}
	else if(isdir){
		var dir = fs.readdir(url, function(err, files){
			if(err){
				console.log(err);
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