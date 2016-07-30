var gpio = null;// require('pi-gpio');
var async = require('async');

var sc1A = 1;
var sc1B = 2;
var sc2A = 3;
var sc2B = 4;
var fanPin = 5;


function setPin(pin, val, cb){
	/*gpio.open(pin, "output", function(err){
		gpio.write(pin, val, function(){
			gpio.close(pin);
		});
	});*/
	console.log("---- Pin " + pin + ": " + val);
	cb();
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
	setTimeout(function(){
		//setPin(sc1A, _1a);
		//setPin(sc1B, _1b);
		//setPin(sc2A, _2a);
		//setPin(sc2B, _2b);
		
		console.log(`step: ${_1a} ${_1b} ${_2a} ${_2b}`);
		cb();
	}, delay);
	
}

function moveStepper(steps, callback){

	var step_calls = [];
	for (var i = 0; i < steps; i++) {
		var ms = 100;
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