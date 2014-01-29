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


