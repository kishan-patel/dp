var socket; 
var senderId; 
var graph; 

function initEvents(){
  socket.on("connect", function(){
    socket.emit("viewer_connect", senderId);
  });

  socket.on('update_graph', function(series){
    var palette = new Rickshaw.Color.Palette();
    var graphSeries = [];
    var alternatives = series.alternatives
    for(var i=0; i<alternatives.length; i++){
      graphSeries.push({
        "name": alternatives[i].alternative+" (UCB1)", 
        "color": palette.color(), 
        "data": alternatives[i].ucb_scores
      });
      graphSeries.push({
        "name": alternatives[i].alternative+" (mean)",
        "color": palette.color(),
        "data": alternatives[i].mean_scores
      });
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

  senderId = $("#sender-id").text();
  socket = io.connect('https://dp-kpatel.rhcloud.com/');
  initEvents();
});
