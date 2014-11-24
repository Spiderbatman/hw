var myRouter = require('./myRouter');
var http = require('http');
var fileSystem = require('fs');

myRouter.add('/file/{name:s}', {
	GET : function(request, response, params){
		//console.log('GET');
		var f = 'file/' + params['name'];
		fileSystem.exists(f, function(found){
			if(found){
				fileSystem.readFile(f, 'binary', function(errorMsg, file){
					if(errorMsg){
						response.writeHead(500, {"Content-type": "text/plain"});
						response.write(errorMsg);
						response.end();
					}
					else{
						response.writeHead(200, getFileType(f));
						response.write(file, 'binary');
						response.end();
					}
				});
			}
			else{
				response.writeHead(404, {"Content-type": "text/plain"});
				response.write('Error 404! Page not found');
				response.end();
			}
		});
	},
	POST : function(request, response, params){
		response.writeHead(200, {"Content-type": "text/plain"});
		response.write("Success");
		response.end();
		//console.log('POST');
	},
	DELETE : function(request, response, params){
		response.writeHead(200, {"Content-type": "text/plain"});
		response.write("Success");
		response.end();
		//console.log('DELETE');
	}
});

function getFileType(name){
	var last = name.substr(name.indexOf('.') + 1);
	if(last === 'png')
		return 'images/png';
	if(last === 'html')
		return 'text/html';
	if(last === 'js')
		return 'text/js';
	if(last === 'css')
		return 'text/css';
	if(last === 'jpg')
		return 'image/jpg';
}

http.createServer(function(request, response){
	myRouter.handleRequest(request, response);
}).listen(8000);

