var presenterWS, viewerWS;

$('#presenter').click(function () {
	if (!presenterWS && !viewerWS) {
		createSocket(function(ws) {
			presenterWS = ws;
			presenterWS.send(JSON.stringify({ code: 1, msg: 'presenter'}));
		});
	}
});
$('#viewer').click(function () {
	if (!presenterWS && !viewerWS) {
		createSocket(function(ws) {
			viewerWS = ws;
			viewerWS.send(JSON.stringify({ code: 1, msg: 'viewer'}));
			viewerWS.onmessage = handleMessage;
		});
	}
});
$('#stop').click(function() {
	if (presenterWS) {
		presenterWS.close();
		presenterWS = null;
	}
	if (viewerWS) {
		viewerWS.close();
		viewerWS = null;
	}
	changeStatus(STATUS.Disconnected);	
});
$("#workspace").mousemove(function(e) {
	if (presenterWS) {
		$('#position').text(e.pageX + 'x' + e.pageY);
		presenterWS.send(JSON.stringify({ code: 2, msg: { x: e.pageX, y: e.pageY } }));	
	}
});

function createSocket(callback) {
	changeStatus(STATUS.Connecting);
	var ws = new WebSocket('ws://localhost:3000/remotecanvas');
	ws.onopen = function() {
		changeStatus(STATUS.Connected);
		callback(ws);
	};	
}

function changeStatus(status) {
	var statusEl = $('#status');
	switch(status) {
		case STATUS.Disconnected:
			statusEl.attr('class', 'label label-danger');
			statusEl.text('Disconnected');
			break;
		case STATUS.Connecting:
			statusEl.attr('class', 'label label-info');
			statusEl.text('Connecting');			
			break;
		case STATUS.Connected:
			statusEl.attr('class', 'label label-success');
			statusEl.text('Connected');			
			break;
		default:
			break;
	}
}

function handleMessage(e) {
	var data = JSON.parse(e.data);
	$('#position').text(data.msg.x + 'x' + data.msg.y);
}

var STATUS = {
	Disconnected: 0,
	Connecting: 1,
	Connected: 2
}