"use strict"
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('views', __dirname + '/views');
var ejs = require('ejs');
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// app.use(require('express').static('views'));

app.get('/', function(req, res){
  res.render('index');
  // res.sendFile('index.html');
});


io.on('connection', function(socket){

  var id = ""+socket.id;
  id = id.replace(/\/#/g,'');
  
  var cookie = socket.handshake.headers.cookie;
  var address = socket.handshake.address
  console.log(socket.handshake.address);
  console.log('a user connected', 'cookie',cookie, 'id',id, 'remoteAddress', address);
  io.emit('init', {id:id, remoteAddress:address}); 

  socket.on('disconnect', function(){
    console.log('user disconnected', id);
    io.emit('remove', id);
  });

  socket.on('chat message', function(data){
    
    if(data.id){
      // console.log(data);
      io.emit('chat message', data);
    }
  });

  var getTime = function(){
  	var moment = require('moment');
  	var t = moment().format('MMMM Do YYYY, HH:mm:ss a');
    var msg = t;
    // console.log(socket);
  	io.emit('chat message', {type:'server',id:0,msg:msg});	
  }

  setInterval(getTime,1000);
});

http.listen(3000, () => {
  console.log('listening on *.:3000');
});
