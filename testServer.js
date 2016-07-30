var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var connected = false;
var machineReady = false;

server.listen(8080);

/*
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
}); */

setTimeout(updateLoop, 1000);

io.on('connection', function (socket) {
	connected = true;
  	console.log("Connection!");

  	socket.on('machine-status', function(data){
  		console.log("Machine is ready? " + data);
  		machineReady = data;
	});
});

io.on('disconnect', function(){
	connected = false;
});

function updateLoop(){
	if(connected){
		//io.emit('hello');
		console.log("Hello client(s)");
		if(machineReady){
			io.emit('bubble-request', 5);
		} else {
			console.log("Machine not ready");
		}
	} else {
		console.log("Waiting for connection");
	}
	setTimeout(updateLoop, 100);
}