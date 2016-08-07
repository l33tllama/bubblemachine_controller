//var gpio = require("pi-gpio");
socketOptions = {
    "transports" : [ "websocket" ],
    "try multiple transports" : false,
    "reconnect" : true,
    "force new connection" : true,
    "connect timeout" : 1000
};

var socket = require('socket.io-client')('http://localhost:8080');
var bm = require('./bubblemachine_controller');

var serverAck = false;
var ready = true;
var connected = false;

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

socket.on('event', function (data) {
	console.log(data);
});

socket.on('bubble-request', function(data){
	if(ready){
		ready = false;
		socket.emit('machine-status', ready);
		bm.emit(data, function(){
			ready = true;
			socket.emit('machine-status', ready);
		});
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
