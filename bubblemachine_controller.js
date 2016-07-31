var gpio = require('rpi-gpio');
var async = require('async');

var sc1A = 3;
var sc1B = 5;
var sc2A = 7;
var sc2B = 11;
var fanPin = 13;

console.log("Pin setup");

function closePins() {
    gpio.destroy(function() {
        console.log('All pins unexported');
    });
}
closePins();

gpio.on('export', function(channel) {
    console.log('Channel set: ' + channel);
});

gpio.setup(sc1A, gpio.DIR_OUT);
gpio.setup(sc1B, gpio.DIR_OUT);
gpio.setup(sc2A, gpio.DIR_OUT);
gpio.setup(sc2B, gpio.DIR_OUT);
gpio.setup(fanPin, gpio.DIR_OUT);

console.log("Pin setup complete");

function setPin(pin, val, cb){
	var _cb = cb;
	gpio.setup(pin, gpio.DIR_OUT, function(){

		gpio.write(pin, true, function(err) {
			//console.log("---- Pin " + pin + ": " + val);
        	if (err) throw err;
	        //console.log('Written to pin');
			_cb();
	 	});

	});
	
/*
	gpio.open(pin, "output", function(err){
		gpio.write(pin, val, function(){
			gpio.close(pin);
		});
	});*/
	//cb();
}

/*setStep(1, 0, 1, 0)
    time.sleep(delay)
    setStep(0, 1, 1, 0)
    time.sleep(delay)
    setStep(0, 1, 0, 1)
    time.sleep(delay)
    setStep(1, 0, 0, 1)
    time.sleep(delay)
*/

function setStep(_1a, _1b, _2a, _2b, delay, cb){
	//var _cb = cb;
	console.log('step: ' + _1a + ' ' + _1b + ' '+ _2a + ' ' + _2b);
	
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
		var ms = 25;
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
				setPin(fanPin, false, callback);
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
			console.log("Fan off..");
		});
	}
}

module.exports = MachineController;
