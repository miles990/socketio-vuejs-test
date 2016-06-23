"use strict"
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var moment = require('moment');



////////////////////////////////////////////////////////////////////////////
// http server
var http_port = 3000;

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

    // io.emit('message', m);
    
    serverSendMessage(m);
    res.send({result:true, msg:m});
  });

  var id = ""+socket.id;
  id = id.replace(/\/#/g,'');
  
  var cookie = socket.handshake.headers.cookie;
  var host = socket.handshake.headers.host;
  var address = socket.handshake.address
  // console.log(socket.handshake);
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

  

  var getTime = function(){
    var moment = require('moment');
    var t = moment().format('MMMM Do YYYY, HH:mm:ss a');
    var msg = 'Server Time';
    // console.log(socket);
    io.emit('message', {type:'server time',id:0,msg:msg,time:t}); 
  }

  setInterval(getTime,1000);
  
});

http.listen(http_port, function(){
  console.log('http listening on 0.0.0.0:'+http_port);
});

function serverSendMessage(msg){
  
  var t = moment().format('MMMM Do YYYY, HH:mm:ss a');

  io.emit('message', {type:'from server msg',id:0,msg:msg,time:t}); 
}

////////////////////////////////////////////////////////////////////////////
// tcp server
var net = require('net');
var tcp_port = 3001;

var tcp_server = net.createServer(function(tcp_socket) {
  // console.log(tcp_socket);
  // Identify this client
  tcp_socket.name = tcp_socket.remoteAddress + ":" + tcp_socket.remotePort 

  // Send a nice welcome message and announce
  console.log(tcp_socket.name + " connected to tcp server.");

  // Handle incoming messages from clients.
  tcp_socket.on('data', function (data) {
    var tcp_m = 'TCP => '+data;
    serverSendMessage(tcp_m);
    serverSendTCPMessage(""+data);
    console.log(tcp_m);
  });

  // Remove the client from the list when it leaves
  tcp_socket.on('end', function () {
    console.log(tcp_socket.name + " disconnected to tcp server.");
  });

  function serverSendTCPMessage(msg){
    tcp_socket.write(msg+'\r\n');
    tcp_socket.pipe(tcp_socket);
  }
});

tcp_server.listen(tcp_port, function(){
  console.log('tcp listening on 0.0.0.0:'+tcp_port)
});



////////////////////////////////////////////////////////////////////////////
// udp server
var dgram = require('dgram');
var udp_port = 3002;
var udp_server = dgram.createSocket('udp4');

udp_server.on('message', function (message, remote) {
  var udp_m = 'UDP => '+ message;
  serverSendMessage(udp_m);
  console.log(udp_m);
  // console.log(remote.address + ':' + remote.port +' - ' + message);
});

udp_server.bind(udp_port, function(){
  console.log('udp listening on 0.0.0.0:'+udp_port);
});

