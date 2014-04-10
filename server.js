var https = require('https')
  , express = require('express')
  , config = require('config.js')
  , agents = require('./static/js/agents.js').agents
  , senderModel = require('sender.js')
  , shortId = require('shortid')
  , url = require('url')

var app = express();
var httpServer = app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
var io = require('socket.io').listen(httpServer);
var senders = {};
var viewers = {};
var Sender = senderModel.Sender;
var getUCBLiveScores = agents.getUCBLiveScores;

//We have to adjust the transport method when hosting the application on openshift.
io.set('transports', ['xhr-polling']);

//Load data for all senders.
Sender.find(function(err, senderObjs){
  for(var i=0; i<senderObjs.length; i++){
    senders[senderObjs[i].sender_id] = {"viewers":[],"data":{}};
    senders[senderObjs[i].sender_id]["data"] = senderObjs[i];
  }
});

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


app.get('/custom-function-example', function(req, res){
  res.render('custom-function-example.html', {});
});

app.get('/live', function(req, res){
  var urlParams = url.parse(req.url, true);
  var query = urlParams.query;
  var senderId = query.id;
  res.render('live.html', {"senderId": senderId});
});

app.post('/send', function(req, res){
  var senderId = req.body["id"];  
  var dataSent = req.body["data"];
  var isGameClient = false;

  try{
    isGameClient = req.body["is_game_client"];
  }catch(err){
    isGameClient = false;
  }

  //Keeping track of which sender has connected.
  if(!senders[senderId]){
    senders[senderId] = {"viewers":[], "data":{}};
  }

   //If this is the first time this data client is sending data, we 
  //initialise the information for each arm. 
  if(Object.keys(senders[senderId].data).length == 0){
    var distinctArms = [];
    var alternatives = [];
   
    for(var i=0; i<dataSent.length; i++){
      if(distinctArms.indexOf(dataSent[i]["alternative"])==-1){
        distinctArms.push(dataSent[i]["alternative"]);
      }
    }
    for(var i=0; i<distinctArms.length; i++){
      alternatives.push({
        alternative: distinctArms[i],
        times_played: 0,
        rewards: 0,
        mean_scores: [],
        ucb_scores: []
      });
    }
    var senderData = new Sender({
      "sender_id": senderId,
      "times_played": 0,
      "max_score": 0,
      "alternatives": alternatives,
    });

    senders[senderId].data = senderData;
  }

  //Run the ucb formula again on the new data.
  getUCBLiveScores(dataSent, senders[senderId].data);

  //Save the data for the given sender.
  if(!isGameClient){
    senders[senderId].data.save(function (err, sender, count){
      if(err){
        console.log(err);
      }
    });
  }

  //Broadcast the information to all of the viewers.
  var viewers = senders[senderId]["viewers"];
  for(var i=0; i<viewers.length; i++){
    viewers[i].emit('update_graph', senders[senderId].data);
  }

  res.send(201);
});

app.get('/get-id', function(req, res){
  //res.render('id.html', {"id": shortId.generate());
  res.send(shortId.generate());
});

app.get('/game', function(req, res){
  res.render('game.html', {});
});

app.get('/reset-game-data', function(req, res){
  senders["game-client"]["data"] = {};
  res.send(200);
});

app.get('/api', function(req, res){
  res.render('api.html', {});
});

//When a viewer connects, add its socket to the list of listeners for a given 
//data source. 
io.sockets.on('connection', function(socket){
  console.log("established socket connection");
  socket.on('viewer_connect', function(id){
    if(senders[id]){
      senders[id]["viewers"].push(socket); 
      if(Object.keys(senders[id].data).length){
        socket.emit('update_graph',senders[id].data); 
      }
    }else{
      senders[id] = {"viewers":[], "data":{}};
      senders[id]["viewers"].push(socket);
    }
  });
});

io.configure(function(){
  io.set('close timeout', 60*60);
  io.set('hearbeat timeout', 60*60);
});
