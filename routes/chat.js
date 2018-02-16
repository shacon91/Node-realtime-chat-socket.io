module.exports = function(io) {
    var express = require('express');
    var router = express.Router();

    router.get('/', function(req, res, next) {
  		res.render('chat');
	});


    io.on('connection', function(socket) { 
        
    	socket.on('chat',function(data){
    		// io represents all sockets on express sockets is a property 
    		io.sockets.emit('chat', data);
    	});

    	socket.on('typing',function(data){
    		//socket is sender who is then broadcasting to everyone else
    		socket.broadcast.emit('typing', data);
    	});

    });

    return router;
}