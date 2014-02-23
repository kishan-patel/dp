var series = [{"name":1, "data":[]}, {"name":2, "data":[]}, {"name":3, "data":[]}];
var ARM_1_CONST = 0.9;
var ARM_2_CONST = 0.5;
var ARM_3_CONST = 0.3;
var timeStep = 0;

function randomProbBetweenRange(min, max){
  var min2 = min*10;
  var max2 = max*10;

  return (Math.random() * (max2 - min2) + min2)/10;
}

function initSeries(){
  for(var i=0; i<100; i++){
    timeStep++;
    series[0]["data"].push({"x": i, "y": randomProbBetweenRange(0.8, 0.95)});
    series[1]["data"].push({"x": i, "y": randomProbBetweenRange(0.75, 0.90)});
    series[2]["data"].push({"x": i, "y": randomProbBetweenRange(0.65, 0.80)});
  }
}

$(document).ready(function(){
  var socket = io.connect('https://dp-kpatel.rhcloud.com/');
  var myId;
  var dataUpdater;

  initSeries();
  debugger;

  socket.on("connect", function(){
    socket.emit("data_client_connect");
  });

  socket.on("whats_my_id", function(id){
    myId = id;
    $("#my-id").append(id);
  });

  $("#start-send-btn").click(function(evt){
    dataUpdater = setInterval(function(){
      series[0]["data"].shift();
      series[1]["data"].shift();
      series[2]["data"].shift();

      series[0]["data"].push({"x":timeStep, "y": randomProbBetweenRange(0.8, 0.95)});
      series[1]["data"].push({"x":timeStep, "y": randomProbBetweenRange(0.75, 0.90)});
      series[2]["data"].push({"x":timeStep, "y": randomProbBetweenRange(0.65, 0.80)});
      socket.emit('live_data', {"id": myId, "series": series});
      timeStep++;
    }, 2000);
  });

  $("#stop-send-btn").click(function(evt){
    if(dataUpdater){
      clearInterval(dataUpdater);
    }
  });
});
