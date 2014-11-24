var myRouter = function(){
	this.routes = {};
};

myRouter.prototype = {
	add : function(route, callbacks, errorHandler){
		this.routes[route] = {
			'callbacks' : callbacks,
			'errorHandler' : errorHandler,
		};
	},

	remove : function(route){
		delete this.routes[route];
	},

	handleRequest : function(request, response){
		var route = '';
		var found = false;
		for(var pattern in this.routes){
			if(checkMatching(request.url, pattern)){
				route = pattern;
				found = true;
				break;
			}
		}
		if(!found){
			response.writeHead(404, {"Content-type": "text/plain"});
			response.write("Error 404! Page not found");
			response.end();
			return;
		}
		if(!(request.method in this.routes[route].callbacks)){
			response.writeHead(405, {"Content-Type": "text/plain"});
            response.write("Error 405! Method Not found");
            response.end();
			return;
		}
		this.routes[route].callbacks[request.method](request, response, 
			getRequestParams(request.url, route));
	}
};
function getRequestParams(route, pattern){
	var params = {};
	for(var i = 0, j = 0; true; i++, j++){
		if(pattern[i] === '{'){
			params[pattern.substring(i + 1, pattern.indexOf(":", i))] = 
				route.substring(j, (route.indexOf('/', j) === -1) ? route.length : route.indexOf('/', j));
		}
		i = pattern.indexOf('/', i);
		j = route.indexOf('/', j);
		if(i === -1 || j === -1)
			break;
	}
	return params;
}

function checkMatching(route, pattern){
	for(var i = 0, j = 0; true; i++, j++){
		if(i === pattern.length && j !== route.length)
			return false;
		if(j === route.length && i !== pattern.length)
			return false;
		if(j === route.length && i === pattern.length)
			return true;
		if(pattern[i] === '{'){
			if(pattern.substring(i, pattern.indexOf('}', i)).indexOf(':n') !== -1){
				if(hasAllDigits(route, j)){
					i = pattern.indexOf('/', i);
					j = route.indexOf('/', j);
					if(j === -1 && i === -1)
						return true;
				}
				else{
					return false;
				}
			}
			else{
				i = pattern.indexOf('/', i);
				j = route.indexOf('/', j);
				if(j === -1 && i === -1)
					return true;
			}
		}
		if(route[j] !== pattern[i]){
			return false;
		}
	}
}

function hasAllDigits(line, index){
	for(var i = index; i < line.length; i++){
		if(line[i] === '/')
			break;
		if(line[i] < '0' || line[i] > '9')
			return false;
	}
	return true;
}
module.exports = new myRouter();