var https = require('https')
  , express = require('express')
  , config = require('config.js');
  
var app = express();
var httpServer = app.listen(config.APP_PORT);
var io = require('socket.io').listen(httpServer);

//App configurations
app.set('views', __dirname +'/views');
app.engine('.html', require('ejs-locals'));
app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname+'/static'));
  app.use(express.static(__dirname+'/lib'));
});

//Routes
app.get('/', function(req, res){
  res.render('file.html', {});
});

app.get('/file', function(req, res){
  res.render('file.html', {});
});

app.get('/simulator', function(req, res){
  res.render('simulator.html', {});
});

app.get('/live', function(req, res){
  res.render('live.html', {});
});

app.get('/send', function(requ, res){
  res.render('send.html', {});
});


//Handling connections from the data client (program that sends json data)
//and the user's browser (where the graphs will be updated in realtime)
var dataClients = [];
var connectionsCounter = 0;

io.sockets.on('connection', function(socket){

  socket.on('data_client_connect', function(){
    dataClients.push({"id":connectiosnCounter, "dataSocket":socket, "browserSockets":[]});
    socket.emit('whats_my_id', id);
    connectionsCounter++;
  });

  socket.on('browser_connect', function(id){
    var found = false;

    for(var i=0; i<dataClients.length; i++){
      if(dataClients[i].id == id){
        dataClients[i].browserSockets.push(socket);
        found = true;
        break;
      }
    }

    if(!found){
      alert("There is no data client connected with this id");
    }
  });

  socket.on('live_data', function(dataObj){
    //Update appropriate browsers when the come in
    var browserSockets;

    for(var i=0; i<dataClients.length; i++){
      if(dataClients[i].id == dataObj.id){
        browserSockets = dataClients[i].browserSockets;
        for(var j=0; j<browserSockets.length; j++){
          browserSockets[j].emit('update_graph', dataObj.data);
        }
        break;  
      }
    }
  });

  socket.on("close", function(){
    //Remove the appropriate sockets
  });
});