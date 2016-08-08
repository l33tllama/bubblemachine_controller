var gpio = require('rpi-gpio');
var async = require('async');

var sc1A = 3;
var sc1B = 5;
var sc2A = 7;
var sc2B = 11;
var fanPin = 13;
var rLEDPin = 15;
var gLEDPin = 16;
var bLEDPin = 18;

console.log("Pin setup");

function closePins() {
    gpio.destroy(function() {
        console.log('All pins unexported');
    });
}
closePins();

gpio.setup(sc1A, gpio.DIR_OUT);
gpio.setup(sc1B, gpio.DIR_OUT);
gpio.setup(sc2A, gpio.DIR_OUT);
gpio.setup(sc2B, gpio.DIR_OUT);
gpio.setup(fanPin, gpio.DIR_OUT, function(){
	gpio.write(fanPin, false, function(err){
		if(err) throw err;
	});
});

console.log("Pin setup complete");

function setPin(pin, val, cb){
	//var _cb = cb;
	gpio.setup(pin, gpio.DIR_OUT, function(){

		gpio.write(pin, val, function(err) {
			//console.log("---- Pin " + pin + ": " + val);
        	if (err) throw err;
	        if(cb){
	        	cb();	
	        }
			
	 	});

	});
}

function setRed(r, cb){
	if(r){
		setPin(rLEDPin, 1, cb);
	} else {
		setPin(rLEDPin, 0, cb);
	}
}

function setGreen(g, cb){
	if(g){
		setPin(gLEDPin, 1, cb);
	} else {
		setPin(gLEDPin, 0, cb);
	}
}

function setBlue(b, cb){
	if(b){
		setPin(bLEDPin, 1, cb);
	} else {
		setPin(bLEDPin, 0, cb);
	}
}

function _setRGBLED(r, g, b, cb){
	setRed(r,setGreen(g, setBlue(b, cb)));
}

/*	Adafruit Python stepper code reference
	setStep(1, 0, 1, 0)
    time.sleep(delay)
    setStep(0, 1, 1, 0)
    time.sleep(delay)
    setStep(0, 1, 0, 1)
    time.sleep(delay)
    setStep(1, 0, 0, 1)
    time.sleep(delay)

	Random dude on the net on some forum reference..
    Red=-+ve, Brown=-ve, Yellow=0, Orange=0
	Red=0, Brown=0, Yellow=+ve, Orange=-ve
	Red=--ve, Brown=+ve, Yellow=0, Orange=0
	Red=0, Brown=0, Yellow=-ve, Orange=+ve
*/

function setStep(_1a, _1b, _2a, _2b, delay, cb){

	//console.log('step: ' + _1a + ' ' + _1b + ' '+ _2a + ' ' + _2b);
	
	var ms = delay; 

	async.series([
		function(callback){
			setPin(sc1A, _1a, callback);
		},
		function(callback){
			setPin(sc1B, _1b, callback);
		},
		function(callback){
			setPin(sc2A, _2a, callback);
		},
		function(callback){
			setPin(sc2B, _2b, callback);
		},	function(callback){
			setTimeout(callback, ms);
		}], 
		function(err, results){
			cb();
		}
	);	
}

function moveStepper(steps, callback){

	var step_calls = [];
	for (var i = 0; i < steps; i++) {
		var ms = 2;
		step_calls.push.apply(step_calls, [
			function(callback){
				setStep(1, 0, 1, 0, ms, callback);
			},
			function(callback){
				setStep(0, 1, 1, 0, ms, callback);
			},
			function(callback){
				setStep(0, 1, 0, 1, ms, callback);
			},
			function(callback){
				setStep(1, 0, 0, 1, ms, callback);
			}
		]);
	}
	async.series(step_calls, function(err, results){
		if(err) throw err;
		callback();
	});
}

var MachineController = {
	emit : function(qty, callback){
		
		
		async.series([
			function(callback){
				setPin(fanPin, true, callback);
			},
			function(callback){
				moveStepper(qty, callback);
			},
			function(callback){
				setPin(fanPin, false, callback);
			}], function(err, results){
				if(err) throw err;
				callback();
			}
		);
	},
	off : function(){
		setPin(fanPin, false, function(){
			console.log("Fan off..?");
			gpio.destroy(function(){
				console.log("Everything off");
			});
			
		});
	},
	setRGBLED : _setRGBLED
}

module.exports = MachineController;
