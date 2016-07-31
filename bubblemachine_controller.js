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
			setTimeout(function(){
				setPin(sc1A, _1a, callback);
			}, ms);
		},
		function(callback){
			setTimeout(function(){
				setPin(sc1B, _1b, callback);
			}, ms);
		},
		function(callback){
			setTimeout(function(){
				setPin(sc2A, _2a, callback);
			}, ms);
		},
		function(callback){
			setTimeout(function(){
				setPin(sc2B, _2b, callback);
			}, ms);
		}], 
		function(err, results){
			cb();
		}
	);
/*
	setTimeout(function(){
		setPin(sc1A, _1a);
		setPin(sc1B, _1b);
		setPin(sc2A, _2a);
		setPin(sc2B, _2b);
		
		console.log('step: ' + _1a + ' ' + _1b + ' '+ _2a + ' ' + _2b);
		_cb();
	}, delay); */
	
}

function moveStepper(steps, callback){

	var step_calls = [];
	for (var i = 0; i < steps; i++) {
		var ms = 100;
		step_calls.push.apply(step_calls, [
			function(callback){
				setStep(0, 1, 1, 0, 0, callback);
			},
			function(callback){
				setStep(0, 1, 0, 1, 0, callback);
			},
			function(callback){
				setStep(1, 0, 0, 1, 0, callback);
			},
			function(callback){
				setStep(1, 0, 1, 0, 0, callback);
			}, function(callback){
				setTimeout(callback, ms)
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
				setPin(fanPin, 1, callback);
			},
			function(callback){
				moveStepper(qty, callback);
			},
			function(callback){
				setPin(fanPin, 0, callback);
			}], function(err, results){
				if(err) throw err;
				callback();
			}
		);
	}
}

module.exports = MachineController;
