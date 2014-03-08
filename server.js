var https = require('https')
  , express = require('express')
  , config = require('config.js')
  , agents = require('./static/js/agents.js').agents
  , senderModel = require('./models/sender.js')
  , shortId = require('shortid')
  , url = require('url')

  //console.log(agent.UCB1());
  
var app = express();
var httpServer = app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
var io = require('socket.io').listen(httpServer);
var senders = {};
var viewers = {};
var Sender = senderModel.Sender;
var getUCBScores = agents.getUCBScores;

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

app.get('/live', function(req, res){
  var urlParams = url.parse(req.url, true);
  var query = urlParams.query;
  var senderId = query.id;
  res.render('live.html', {"senderId": senderId});
  //When a viewr connects, add its socket to the list of listeners for a given 
  //data source. 
  console.log("about to create connection event");
  io.sockets.on('connection', function(socket){
    console.log("established socket connection");
    socket.on('viewer_connect', function(id){
      if(senders[id]){
        senders[id]["viewers"].push(socket); 
        socket.emit('update_graph',senders[id].data);
      }
    });
  });
});

app.post('/send', function(req, res){
  var senderId = req.body["sender_id"];  
  var dataSent = req.body["data"];
  
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
      "alternatives": alternatives
    });

    senders[senderId].data = senderData;
  }
  
  //Run the ucb formula again on the new data.
  getUCBScores(dataSent, senders[senderId].data);

  //Save the data for the given sender.
  senders[senderId].data.save(function (err, sender, count){
    if(err){
      console.log(err);
    }
  });

  //Broadcast the information to all of the viewers.
  var viewers = senders[senderId]["viewers"];
  for(var i=0; i<viewers.length; i++){
    viewers[i].emit('update_graph', sender[senderId].data);
  }

  res.send(200);
});

app.get('/get-id', function(req, res){
  //res.render('id.html', {"id": shortId.generate());
  res.send(shortId.generate());
});

app.get('/api', function(req, res){
  res.render('api.html', {});
});

//Handling viewers here. Whenever data comes in from a particular data source, 
//all viewers listenting to that data source should be updated automatically.
function broadcastToAllViewers(id, data){
  if(latestData[i]){
    
  }
  for(var i=0; i<viewersSocks.length; i++){
    console.log("emitting");
    viewerSocks.emit('update_graph', {"id":id, "data":data});;
  }
}

