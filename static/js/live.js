var socket; 
var dataClientId; 
var graph; 
var graphCreated = false; 
var graphSeries = [];

function initEvents(){
  socket.on("connect", function(){
    socket.emit("browser_connect", dataClientId);
  });

  socket.on('update_graph', function(series){
    if(!graphCreated){
      var palette = new Rickshaw.Color.Palette();
      for(var i=0; i<series.length; i++){
        graphSeries.push({"name":series[i].name, "color":palette.color(), "data":series[i].data});     
      }
      $("#live-graph").empty();
      $("#live-legend").empty();
      graph = GraphUtil.createGraph("line", graphSeries, "standard", "live-graph","live-legend");
      graph.render();
      graphCreated = true;
    }else{
      for(var i=0; i<series.length; i++){
        for(var j=0; j<graphSeries.length; j++){
          if(series[i].name == graphSeries[j].name){
            graphSeries[j].data = series[i].data;
            break;
          }
        }
      }
      graph.update();
    }
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
