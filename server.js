#!/bin/env node
var express = require('express');
var fs      = require('fs');



var hours1 = 6837;
var hours2 = 82963;
var minutes1 = 0;
var minutes2 = 0;
var seconds1 = 0;
var seconds2 = 0;

var tick1 = 0;
var tick2 = 0;


var highLvl=0;
var overload1=0;
var overload2=0;
var statorFire1=0;
var statorFire2=0;

var start1 = 0;
var start2 = 0;
var startIn = 0;


function run1() {

	if (tick1!=0) {
	
			if ((Math.random()*1000000)<=1) { overload1=1;}
			if ((Math.random()*1000000)<=1) { highLvl=1;}
			if ((Math.random()*1000000)<=1) { statorFire1=1;}

			
		seconds1++;

		if (seconds1>=60) {
			seconds1=0;
			minutes1++;

			if (minutes1>=60) {
				minutes1=0;
				hours1++;}
		}
		console.log(hours1+":"+minutes1+":"+seconds1);
	}

}


function run2() {

	if (tick2!=0) {
	
		if ((Math.random()*1000)<=1) { statorFire2=1;}
		if ((Math.random()*1000)<=1) { overload2=1;}
	
		seconds2++;

		if (seconds2>=60) {
			seconds2=0;
			minutes2++;

			if (minutes2>=60) {
				minutes2=0;
				hours2++;}
		}

	}

}


setInterval(run1, 1000);
setInterval(run2, 1000);



/**
*  Define the sample application.
*/
var SampleApp = function() {

	//  Scope.
	var self = this;


	/*  ================================================================  */
	/*  Helper functions.                                                 */
	/*  ================================================================  */

	/**
	*  Set up server IP address and port # using env variables/defaults.
	*/
	self.setupVariables = function() {
		//  Set the environment variables we need.
		self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
		self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

		if (typeof self.ipaddress === "undefined") {
			//  Log errors on OpenShift but continue w/ 127.0.0.1 - this
			//  allows us to run/test the app locally.
			console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
			self.ipaddress = "127.0.0.1";
		};
	};


	/**
	*  Populate the cache.
	*/
	self.populateCache = function() {
		if (typeof self.zcache === "undefined") {
			self.zcache = { 'index.html': '' };
		}

		//  Local cache for static content.
		self.zcache['index.html'] = fs.readFileSync('./index.html');
	};


	/**
	*  Retrieve entry (content) from cache.
	*  @param {string} key  Key identifying content to retrieve from cache.
	*/
	self.cache_get = function(key) { return self.zcache[key]; };


	/**
	*  terminator === the termination handler
	*  Terminate server on receipt of the specified signal.
	*  @param {string} sig  Signal to terminate on.
	*/
	self.terminator = function(sig){
		if (typeof sig === "string") {
			console.log('%s: Received %s - terminating sample app ...',
			Date(Date.now()), sig);
			process.exit(1);
		}
		console.log('%s: Node server stopped.', Date(Date.now()) );
	};


	/**
	*  Setup termination handlers (for exit and a list of signals).
	*/
	self.setupTerminationHandlers = function(){
		//  Process on exit and signals.
		process.on('exit', function() { self.terminator(); });

		// Removed 'SIGPIPE' from the list - bugz 852598.
		['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
		'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
		].forEach(function(element, index, array) {
			process.on(element, function() { self.terminator(element); });
		});
	};


	/*  ================================================================  */
	/*  App server functions (main app logic here).                       */
	/*  ================================================================  */

	/**
	*  Create the routing table entries + handlers for the application.
	*/
	self.createRoutes = function() {
		self.routes = { };

		self.routes['/'] = function(req, res) {
			res.setHeader('Content-Type', 'text/html');
			res.send(self.cache_get('index.html') );
		};
		
		self.routes['/init'] = function(req, res) {
			//=============================================	
			
			r={};

			r.start1 = start1;
			r.start2 = start2;
			r.startIn = startIn;

			res.setHeader('Content-Type', 'application/json');
			res.send(r);
			
			//=============================================	
		};
		
		}

	self.createRoutes2 = function() {
		self.routes2 = { };
		self.routes2['/update'] = function(req, res) {
			//=============================================	
			
			start1 = req.body.start1;
			start2 = req.body.start2;
			startIn = req.body.startIn;
			
			r={};

			
			
			if (req.body.startIn==0) {
				r.powerLamp=0;
				r.ampers1=0;
				r.ampers2=0;
				
				highLvl=0;
				overload1=0;
				overload2=0;
				statorFire1=0;
				statorFire2=0;
				tick1=0;
				tick2=0;}
			
			else {
				
				r.powerLamp=1;			
				
				if (highLvl==1 || overload1==1 || statorFire1==1) {
					tick1=0;
					if (req.body.start1==0) { overload1=0; statorFire1=0; }}
				else tick1=req.body.start1;
				
				if (highLvl==1 || overload2==1 || statorFire2==1) { 
					tick2=0;
					if (req.body.start2==0) { overload2=0; statorFire2=0; }}
				else tick2=req.body.start2;
				
				if (req.body.start1>0) {
					if (overload1==1) r.ampers1=Math.round(Math.random() * (180 - 170) + 170);
					else r.ampers1=Math.round(Math.random() * (55 - 45) + 45);}
				else r.ampers1=0;

				if (req.body.start2>0) {
					if (overload2==1) r.ampers2=Math.round(Math.random() * (180 - 170) + 170);
					else r.ampers2=Math.round(Math.random() * (55 - 45) + 45);}
				else r.ampers2=0;

			}
			
			r.highLvl=highLvl;
			r.overload1=overload1;
			r.overload2=overload2;
			r.statorFire1=statorFire1;
			r.statorFire2=statorFire2;
			
			r.hours1 = hours1;
			r.hours2 = hours2;
			r.minutes1_1 = Math.floor(minutes1/10);
			r.minutes1_2 = minutes1%10;
			r.minutes2_1 = Math.floor(minutes2/10);
			r.minutes2_2 = minutes2%10;
			

			res.setHeader('Content-Type', 'application/json');
			res.send(r);

			//=============================================	
		};
		

	};


	/**
	*  Initialize the server (express) and create the routes and register
	*  the handlers.
	*/
	self.initializeServer = function() {
		self.createRoutes();
		self.createRoutes2();
		self.app = express.createServer();
		self.app.use(express.bodyParser());
		self.app.use("/", express.static(__dirname));

		//  Add handlers for the app (from the routes).
		for (var r in self.routes) {
			self.app.get(r, self.routes[r]);
		}
		
		for (var r in self.routes2) {
			self.app.post(r, self.routes2[r]);
		}
	};


	/**
	*  Initializes the sample application.
	*/
	self.initialize = function() {
		self.setupVariables();
		self.populateCache();
		self.setupTerminationHandlers();

		// Create the express server and routes.
		self.initializeServer();
	};


	/**
	*  Start the server (starts up the sample application).
	*/
	self.start = function() {
		//  Start the app on the specific interface (and port).
		self.app.listen(self.port, self.ipaddress, function() {
			console.log('%s: Node server started on %s:%d ...',
			Date(Date.now() ), self.ipaddress, self.port);
		});
	};

};   /*  Sample Application.  */



/**
*  main():  Main code.
*/
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

//============================================
