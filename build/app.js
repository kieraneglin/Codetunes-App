(function () { 'use strict';

	// Here is the starting point for code of your own application.
	// All stuff below is just to show you how it works. You can delete all of it.

	// Modules which you authored in this project are intended to be
	// imported through new ES6 syntax.
	// import { albumInfo } from './js/get_json.js';
	// var parseInfo = require("../app/js/get_json.js");
	// Node.js modules and those from npm
	// are required the same way as always.
	var os = require('os');
	var app = require('electron').remote.app;
	var jetpack = require('fs-jetpack').cwd(app.getAppPath());

	//app.commandLine.appendSwitch("disable-renderer-backgrounding");
	app.commandLine.appendSwitch("disable-http-cache");
	// Holy crap! This is browser window with HTML and stuff, but I can read
	// here files like it is node.js! Welcome to Electron world :)
	console.log(jetpack.read('package.json', 'json'));

	document.addEventListener('DOMContentLoaded', function() {

	});

})();
//# sourceMappingURL=app.js.map