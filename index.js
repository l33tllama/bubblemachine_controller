//var gpio = require("pi-gpio");
socketOptions = {
    "transports" : [ "websocket" ],
    "try multiple transports" : false,
    "reconnect" : true,
    "force new connection" : true,
    "connect timeout" : 1000
};

var serverUrl = 'http://138.68.31.203';

var socket = require('socket.io-client')(serverUrl);
var bm = require('./bubblemachine_controller');

var serverAck = false;
var ready = true;
var connected = false;

// https://www.airnow.gov/
function getQualityRating(ppm){
	// healthy, no risk
	if(ppm > 0 & ppm < 50){
		return 0;
	} // only harmfult to small number of people 
	else if (ppm > 51 && ppm < 100){
		return 1;
	} // unsafe for sensitive grpups
	else if (ppm > 101 && ppm < 150){
		return 2;
	} // unhealthy
	else if(ppm > 151 && ppm < 200){
		return 3;
	} // very bad
	else if(ppm > 201 && ppm < 300){
		return 4;
	} // hazardous
	else if (ppm > 301 && ppm < 500){
		return 5;
	}
}

bm.setRGBLED(0,0,1, function(){
	console.log("LED set!");
});

function updateStatus(){
	if(ready){
		console.log("Machine ready emit: " + ready);
	}
	socket.emit('machine-status', ready);
	setTimeout(updateStatus, 1000);
}

setTimeout(updateStatus, 1000);

socket.on('connect',function(){                                
    connected = true;
    console.log("Hello!");
    socket.emit('machine-status', true);
});

function blowBubbles(amt){
	bm.emit(data, function(){
		ready = true;
		socket.emit('machine-status', ready);
	});
}

socket.on('bubble-request', function(data){
	if(ready){
		ready = false;
		socket.emit('machine-status', ready);
		socket.emit('machine-active', data);
		var rating = getQualityRating(data.pm_2_5);
		switch(rating){
			case 0:
				bm.setRGBLED(0, 1, 0, blowBubbles(5 - rating));
				break
			case 1:
				bm.setRGBLED(1, 1, 0, blowBubbles(5 - rating));
				break;
			case 2:
				bm.setRGBLED(1, 0, 0, blowBubbles(5 - rating));
				break;
			case 3:
			case 4:
			case 5:
				bm.setRGBLED(1, 0, 0, blowBubbles(5 - rating));
				break;
			default:
				bm.setRGBLED(0,0,1, blowBubbles(5 - rating));
				break;
		}
	}
});

socket.on('hello', function(){
	console.log("Hi server!!");
});

socket.on('error', function (err) {
	console.log("Connection error: " + err);
	bm.off();
});

socket.on('connect_timeout', function(){
    console.log("socket.io-client 'connect_failed'");
});

socket.on('reconnect_attempt', function(){
	console.log("reconnect_attempt");
	bm.off();
});
