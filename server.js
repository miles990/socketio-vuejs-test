"use strict"
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var moment = require('moment');

app.set('views', __dirname + '/views');
var ejs = require('ejs');
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.get('/', function(req, res){
  res.render('index');
});



io.on('connection', function(socket){

  app.post('/', function(req, res){
    var post_data = req.body;
    var m = 'POST => '+JSON.stringify(post_data);
    console.log(m);

    io.emit('message', m);
    
    serverSendMessage(m);
    res.send({result:true, msg:m});
  });

  var id = ""+socket.id;
  id = id.replace(/\/#/g,'');
  
  var cookie = socket.handshake.headers.cookie;
  var host = socket.handshake.headers.host;
  var address = socket.handshake.address
  console.log(socket.handshake);
  console.log('a user connected', 'cookie',cookie, 'id',id, 'address', address, 'host', host);
  
  io.emit('message', {type:'init',id:0, host:host, address:address}); 


  socket.on('disconnect', function(){
    console.log('user disconnected', id);
    io.emit('remove', id);
  });

  socket.on('message', function(data){
    
    if(data.id){
      // console.log(data);
      io.emit('from server msg', data);
    }
  });

  var serverSendMessage = function(msg){
  
    var t = moment().format('MMMM Do YYYY, HH:mm:ss a');
  
    io.emit('message', {type:'from server msg',id:0,msg:msg,time:t}); 
  }

  var getTime = function(){
    var moment = require('moment');
    var t = moment().format('MMMM Do YYYY, HH:mm:ss a');
    var msg = 'Server Time';
    // console.log(socket);
    io.emit('message', {type:'server time',id:0,msg:msg,time:t}); 
  }

  setInterval(getTime,1000);
  
});



http.listen(3000, () => {
  console.log('listening on *.:3000');
});
