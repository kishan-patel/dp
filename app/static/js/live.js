
function connectionMngr(){
  var connections = {};
  var idCounter = 0;

  function addConnection(id, socket){
    connections[id] = socket;
  }

  function removeConnection(id){
    delete connections[id];
  }

  this.connection = function(){
    var socket;
    var id;
    var graph;

    function updateGraph(){
    }

    this.start = function(id){
    }
  }
}

function listen(io){

}

$(document).ready(function(){
  var cMngr = new connectionMngr();
  var graph = GraphUtil.createGraph("line", [{data:[{x:0, y:0}]}], "standard", "live-graph", "live-legend");
  graph.render();

  $("#connect-button").click(function(evt){
    debugger;
    var id = $("#live-id")[0].value;
  });
});
