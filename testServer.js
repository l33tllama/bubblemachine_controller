var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var jsonfile = require('jsonfile');
var schedule = require('node-schedule');
var Converter = require("csvtojson").Converter;
var converter = new Converter({constructResult:false}); 
var request = require('request');


var connected = false;
var machineReady = false;

var viewsPath = "views/";
var epa_data_url = "http://epa.tas.gov.au/air/live/epa_tas_latest_particle_data.txt";
var epa_data_json_file = "epa_data.json";

server.listen(8080);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/' + viewsPath + '/index.html');
}); 

// Convert to JSON when completed converting!
converter.on("record_parsed", function(jsonObj){
	jsonfile.writeFile(epa_data_json_file, jsonObj, function(err){
		console.log(err);
	});
});

// Update the database task
function updateDB(){
	console.log("Getting EPA data and converting to JSON..");
	request(epa_data_url, function(err, resp, body){
		if(err)
			return console.log(err)
		var bodyLines = body.split('\n');
		var onlyDataLines = bodyLines.splice(8, bodyLines.length - 8);
		var rejoinedData = onlyDataLines.join('\n');
		// https://www.npmjs.com/package/csvtojson
		//converter.fromString(rejoinedData, function
	}
}

// schedule DB updates every minute
var j = schedule.scheduleJob('0 * * * * *', updateDB);

setTimeout(updateLoop, 1000);
updateDB();

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