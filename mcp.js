/*
	Author: Thomas Brasington
	What: A base namespace I use to hang off JS apps
	Experimenting with a loading mechanism for inline content
*/

// Defines the base for our mcp
var mcp = {};

// error handling

/*
	@type - 1 error, 2 warning
	@message - something went wrong
	@date - when it hmcpened
*/
mcp.error = function(message) {
	
	console.log(" --- Error ---")
	console.log(message)
	
}

/*
	An object to load modules in to

	structure 
	 
	 mcp.modules = {
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

mcp.modules = {};

// what modules we are currently lading in 
mcp.loading = {};

/*
 	Basic js and css loader
 	@object files - an object of files to load
 	@function callback - if you wish to fire an event once loaded
*/
mcp.loader = function( files, callback){
	
	var files_to_load = [], 
	number_of_files = files.length, 
	files_loaded = 0;
	

	// load each file in
	files.forEach(function(item,index)  {
		
		mcp.loading
		// what kind of file is it?
		var file_type = mcp.file_type(item.type);
		
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
mcp.file_type = function(type) {
	
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
 	Loads in modules for the mcp. or Not if they are already cached in the DOM
 	@object files - an object of files to load
 	@function callback - if you wish to fire an event once loaded
*/
mcp.script_queue = [];

mcp.load_module = function(namespace, callback,el,options) {
 	
 	var el = el || document.body;
 	var options = options || null;
 	
	// does the namespace even exists?
	if(mcp.modules[namespace] !== undefined) { 
	
		var module = mcp.modules[namespace][0];
		
		// check file isnt in queue and isnt already loaded
		if(mcp.script_queue[namespace] !== undefined && module.loaded === false) {
			
			// load each one into our script queue
			mcp.script_queue[namespace][_.size(mcp.script_queue[namespace])] = {
				"el" : el,
				"options" : options
			};
			
		} else {
			// module doesnt yet exist in the load queue so create it
			mcp.script_queue[namespace] = {};

			// module isn't in cache yet, so load it in
			if(module.loaded === false){
				
				// load the module in
				mcp.loader(module.files, function(){
				
					//the module is now loaded so don't do it again
					module.loaded = true;
					
					// fire the callback
					if(callback) callback();
				
					// run the build
					mcp.modules[namespace].run(el,options);
							
					// go over all the instances (- the one loaded) and render them
					for(var a=0; length = _.size(mcp.script_queue[namespace]), a<length; a++) {
					
						var instance_to_run = mcp.script_queue[namespace][a];
						// use the module namesapce here and use the cached el and options of instance_to_run
						mcp.modules[namespace].run(instance_to_run.el, instance_to_run.options);
					} 
				});
				
			} else { 
				
				// the files are already loaded so fire any callback
				if(callback) callback();
					mcp.modules[namespace].run(el,options);
			}
			
			return mcp.modules[namespace];	
		}
		
	} else {
		// throw some sort of error
		mcp.error({
			type : 1,
			message : namespace + "  module doesn't exist",
			date : new Date().getTime()
		})
	}
};