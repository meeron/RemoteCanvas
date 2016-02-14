var express = require('express');
var http = require('http');
var WebSocketServer = require('websocket').server;

var app = express();

var presenter;
var viewers = [];

var server = http.createServer(app);
server.listen(3000, function() {
	console.log('Listening on port 3000...');
});

var ws = new WebSocketServer({
	httpServer: server,
	path: '/remotecanvas'
});

//TODO: exception handling
ws.on('request', function(request) {

	var conn = request.accept('remote-canvas', "*");
	conn.on("message", function(msg) {
		var datamsg = JSON.parse(msg.utf8Data);
		switch(datamsg.code) {
			case 1: //connect
				handleConnectCode(conn, datamsg);
				break;
			case 2: //send
				handleSendCode(datamsg);
				break;
			default:
				console.log('Invalid code.');
				break;
		}
	});

});

function handleConnectCode(conn, msg) {
	switch(msg.msg) {
		case 'presenter':
			if (!presenter) {
				presenter = conn;
				console.log('presenter connected.');
				presenter.on('close', function (reasonCode, description) {
					console.log('presenter disconnected: ', reasonCode);
					presenter = null;
					for (var i = 0; i < viewers.length; i++) {
						viewers[i].drop(1000, 'presenter disconnected');
					}
				});					
			}
			break;
		case 'viewer':
			if (presenter) {
				viewers.push(conn);
				console.log("viewer connected.");
				conn.on('close', function (reasonCode, description) {
					console.log('viewer disconnected: ', reasonCode);
					//TODO: remove object from array
				});						
			}
			else {
			}
			break;
		default:
			break;
	}
}

function handleSendCode(msgobj) {
	for (var i = 0; i < viewers.length; i++) {
		viewers[i].send(JSON.stringify({ code: 3, msg: msgobj.msg }));
	}
}

app.use(express.static('public'));