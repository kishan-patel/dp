var https = require('https')
  , express = require('express')
  , config = require('config.js')
  
var app = express();
var httpServer = app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
var io = require('socket.io').listen(httpServer);
var senders = {};
var viewers = {};
var senderCount = 1;
var prevData = {};

var updateUCBScores = function(newData, oldData){
    var totalTimesPlayed = oldData["times_played"];
    var maxScore = oldData["max_score"];
    var armPlayed, result, ucbScore;

    for(var i=0; i<newData.length; i++){
      totalTimesPlayed++;
      armPlayed = newData[i]["alternative"];
      result = newData[i]["rewards"];

      oldData[armPlayed]["times_played"]+=1;
      oldData[armPlayed]["rewards"]+=result;
      for(var arm in oldData){
        if(arm == "times_played")
          break;
        if(oldData[arm]["times_played"]==0)
          ucbScore = 0
        else
          ucbScore = oldData[arm]["rewards"]/oldData[arm]["times_played"] + 2*Math.sqrt(Math.log(totalTimesPlayed)/oldData[arm]["times_played"]);
        if(ucbScore > maxScore)
          maxScore = ucbScore;
        oldData[arm]["data"].push({"x":totalTimesPlayed-1, "y":ucbScore});
      }
    }

    oldData["times_played"] = totalTimesPlayed;
    oldData["max_score"] = maxScore;
    
    return oldData;
  }

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

app.post('/send', function(req, res){
  var senderId = req.body["sender_id"];  
  var dataSent = req.body["data"];
  
  //Keeping track of which sender has connected.
  if(!senders[senderId]){
    senders[senderId] = {"viewers":[]};
  }

   //If this is the first time this data client is sending data, we 
  //initialise the information for each arm. 
  if(!prevData[senderId]){
    var arms = [];
    var currentArm;
   
    prevData[senderId] = {"times_played":0, "max_score":0};
    for(var i=0; i<dataSent.length; i++){
      if(arms.indexOf(dataSent[i]["alternative"])==-1){
        arms.push(dataSent[i]["alternative"]);
      }
    }
    for(var i=0; i<arms.length; i++){
      prevData[senderId][arms[i]] = {
        "times_played":0,
        "rewards":0,
        "data":[]
      }
    }
  }
  
  //Run the ucb formula again on the new data.
  debugger;
  prevData[senderId] = updateUCBScores(dataSent, prevData[senderId]);

  //Broadcast the information to all of the viewers.
  var viewers = senders[senderId]["viewers"];
  for(var i=0; i<viewers.length; i++){
    viewers[i].emit('update_graph',prevData[senderId]);
  }

  res.send(200);
});

app.get('/get-id', function(req, res){
  res.render('id.html', {"senderCount": senderCount});
  senderCount++;
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

//When a viewr connects, add its socket to the list of listeners for a given 
//data source. 
io.sockets.on('connection', function(socket){
  socket.on('viewer_connect', function(id){
    if(senders[id]){
      senders[id]["viewers"].push(socket); 
      socket.emit('update_graph',prevData[id]);
    }
  });
});
