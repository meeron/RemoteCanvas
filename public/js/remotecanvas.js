var presenterWS, viewerWS;
var canvas = this.__canvas = new fabric.Canvas('workspace', {
	width: 500,
	height: 500
  });

$('#presenter').click(function () {
	if (!presenterWS && !viewerWS) {
		createSocket(function(ws) {
			presenterWS = ws;
			presenterWS.send(JSON.stringify({ code: 1, msg: 'presenter'}));
			canvas.isDrawingMode = true;
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
canvas.on('mouse:move', function(fevent) {
	var e = fevent.e;
	if (fevent.e.buttons == 1 && presenterWS) {
		var offset = $("#workspace").offset();
		var pos = {
			x: e.pageX - offset.left,
			y: e.pageY - offset.top
		}
		$('#position').text(pos.x + 'x' + pos.y);
		presenterWS.send(JSON.stringify({ code: 2, msg: pos }));
	}
});
$("#workspace").mousemove(function(e) {

});

function createSocket(callback) {
	changeStatus(STATUS.Connecting);
	var ws = new WebSocket('ws://localhost:3000/remotecanvas', 'remote-canvas');
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

	//TODO: do proper drawing
	// create a rectangle object
	var rect = new fabric.Rect({
	  left: data.msg.x,
	  top: data.msg.y,
	  fill: 'red',
	  width: 1,
	  height: 1
	});	
	canvas.add(rect);

}

var STATUS = {
	Disconnected: 0,
	Connecting: 1,
	Connected: 2
}