/*
	Author: Thomas Brasington
	What: A base namespace I use to hang off JS apps
	Experimenting with a loading mechanism for inline content
*/

// Defines the base for our mcp
var mcp = function() {


var that = this;

// error handling

/*
	@type - 1 error, 2 warning
	@message - something went wrong
	@date - when it hmcpened
*/
that.error = function(message) {
	
	console.log(" --- Error ---")
	console.log(message)
	
}

/*
	An object to load modules in to

	structure 
	 
	 that.modules = {
		"namespace" : [{
				"loaded" : false,
				"files" : [
				{
					"id" : "namespace js",
					"file" : "apps/namespace/css/base.css",
					"type" : "css"
				},
				{
					"id" : "namespace CSS",
					"file" : "apps/namespace/js/base.js",
					"type" : "js"
				}
				]
			}]
		};
*/

that.modules = {};

// what modules we are currently lading in 
that.loading = {};

/*
 	Basic js and css loader
 	@object files - an object of files to load
 	@function callback - if you wish to fire an event once loaded
*/
that.loader = function( files, callback){
	
	var files_to_load = [], 
	number_of_files = files.length, 
	files_loaded = 0;
	

	// load each file in
	files.forEach(function(item,index)  {
		
		that.loading
		// what kind of file is it?
		var file_type = that.file_type(item.type);
		
		files_to_load[index] = document.createElement(file_type.element);
		
		// CSS files need a specific attribute
		if(item.type==="css") { 
			files_to_load[index].setAttribute("rel", "stylesheet");
		}
		
		files_to_load[index].addEventListener("load", function(evt){
			
			console.log(item.id + ' file loaded ');
			// increase load count
			files_loaded++;
			// if the files are all loaded and a callback has been set, fire it
			if(files_loaded>=number_of_files && callback) callback(); 
		});
		
		// basic file type 
		files_to_load[index].setAttribute("charset", "utf-8");
		files_to_load[index].setAttribute("type", file_type.string)
		files_to_load[index].setAttribute(file_type.src, item.file);
	
		// inject to the head
		document.getElementsByTagName("head")[0].appendChild(files_to_load[index]);

  
	});
}
/*
 	discerning what kind of file you need to load
 	@string type - js/css/??? 
*/
that.file_type = function(type) {
	
	var file_type =  {
		string : "",
		element : ""
	};
	
	switch(type) {
		case "js":
			file_type.element = "script";
			file_type.src = "src";
			file_type.string = "text/javascript";
		break;
		case "css":
			file_type.element = "link";
			file_type.src = "href";
			file_type.string = "text/css";
		break;
	}
	
	return file_type;
}


/*
 	Loads in modules for the that. or Not if they are already cached in the DOM
 	@object files - an object of files to load
 	@function callback - if you wish to fire an event once loaded
*/
that.script_queue = [];

that.load_module = function(namespace, callback,el,options) {
 	
 	var el = el || document.body;
 	var options = options || null;
 	
	// does the namespace even exists?
	if(that.modules[namespace] !== undefined) { 
	
		var module = that.modules[namespace][0];
		
		// check file isnt in queue and isnt already loaded
		if(that.script_queue[namespace] !== undefined && module.loaded === false) {
			
			// load each one into our script queue
			that.script_queue[namespace][_.size(that.script_queue[namespace])] = {
				"el" : el,
				"options" : options
			};
			
		} else {
			// module doesnt yet exist in the load queue so create it
			that.script_queue[namespace] = {};

			// module isn't in cache yet, so load it in
			if(module.loaded === false){
				
				// load the module in
				that.loader(module.files, function(){
				
					//the module is now loaded so don't do it again
					module.loaded = true;
					
					// fire the callback
					if(callback) callback(el,options);
				 
				});
				
			} else { 
				
				// the files are already loaded so fire any callback
				if(callback) callback(el,options);
			}
			
			return that.modules[namespace];	
		}
		
	} else {
		// throw some sort of error
		that.error({
			type : 1,
			message : namespace + "  module doesn't exist",
			date : new Date().getTime()
		})
	}
};
	return that;
};