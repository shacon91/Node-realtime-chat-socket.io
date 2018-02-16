window.addEventListener('load',function(){
	var output = document.getElementById('output'),
		status = document.getElementById('status'),
		handler = document.getElementById('handler'),
		msg = document.getElementById('msg'),
		send = document.getElementById('send');



	var socket = io.connect('http://localhost:3000');


	send.addEventListener('click',function(){
		var data = {
			msg: msg.value,
			handler: handler.value
		};

		socket.emit('chat',data);
	});

	msg.addEventListener('keydown',function(){
		
		var data = {
			handler: handler.value
		};

		socket.emit('typing',data);
	})




	//listen for events
	socket.on('chat', function(data){
		var div = document.createElement('div'),
			span = document.createElement('span');

		div.className = 'msg';
		span.innerHTML= data.handler +": ";
		div.appendChild(span);
		div.innerHTML += data.msg;
		output.appendChild(div);
	})

	socket.on('typing', function(data){
		status.innerHTML= data.handler +" is typing....";
	})

	



});