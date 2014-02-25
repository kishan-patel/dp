var socket; 
var dataClientId; 
var graph; 
var graphCreated = false; 
//var graphSeries = [];

function initEvents(){
  socket.on("connect", function(){
    socket.emit("viewer_connect", dataClientId);
  });

  socket.on('update_graph', function(series){
    var palette = new Rickshaw.Color.Palette();
    var names = Object.keys(series);
    var graphSeries = [];
    for(var arm in series){
      if(arm != "times_played" && arm != "max_score")
        graphSeries.push({"name":arm, "color":palette.color(), "data":series[arm]["data"]});
    }
    $("#live-graph").empty();
    $("#live-legend").empty();
    graph = GraphUtil.createGraph("line", graphSeries, "standard", "live-graph","live-legend", series["max_score"]+0.5);
    graph.render();
    graphCreated = true;
  });
}

$(document).ready(function(){
  graph = GraphUtil.createGraph("line", [{data:[{x:0, y:0}]}], "standard", "live-graph", "live-legend");
  graph.render();

  $("#connect-button").click(function(evt){
    dataClientId = $("#live-id")[0].value;
    if(dataClientId != ""){
      socket = io.connect('https://dp-kpatel.rhcloud.com/');
      initEvents();
    }
  });
});
