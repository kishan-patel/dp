var simltr;

function simulator(){
  var agnts = new agents();
  var bndts = new bandits();
  var palette = new Rickshaw.Color.Palette();
  var color = palette.color();
  
  function getStepsInfo(){
    return $("#sim-steps")[0].value;
  }

  function getArmsInfo(){
    var armsHtml = $("#sim-arms select, #sim-arms input");
    var armType, armProb;
    var arms=[];

    for(var i=0; i<armsHtml.length; i+=2){
      armType = armsHtml[i].value;
      armProb = armsHtml[i+1].value;
      arms.push({"type": armType, "prob":armProb});
    }
    return arms;
  }

  function getAgentsInfo(){
    var agentsHtml = $('#sim-agents select');
    var agentType;
    var agents=[];
    var options = [];

    for(var i=0; i<agentsHtml.length; i++){
      options = agentsHtml[i].children; 
      for (var j=0; j<options.length; j++){
        if(options[j].selected){
          agents.push({"type": options[j].value});
        }
      }
    }
    return agents;
  }

  this.runSimulation = function(){
    var graphData = [];

    var steps = getStepsInfo();
    
    //For each arm/bandit, we run the simulation. 
    //E.g. Bernoulli 0.9 with 500 steps
    var armsInfo = getArmsInfo();
    for(var i=0; i<armsInfo.length; i++){
      graphData.push(bndts.runSim(steps, armsInfo[i].type, armsInfo[i].prob, i+1, color));    
    }
    
    //For each agent, we run the simulation.
    //E.g. UCB1
    var agentsInfo = getAgentsInfo();
    var simColor;
    for(var i=0; i<agentsInfo.length; i++){
      simColor = palette.color();
      graphData.push(agnts.runSim(agentsInfo[i].type, steps, armsInfo.length, 
                                     graphData, simColor));
    }

    //Create the graph representing the simulation
    $('#sim-graph').empty();
    $('#sim-legend').empty();
    graph = GraphUtil.createGraph("line", graphData, 
                                         "standard", "sim-graph", "sim-legend");
    graph.render();
    
  }
};


$(document).ready(function(){
  simltr = new simulator(); 
  //simltr.runSimulation();
  
  var graph = GraphUtil.createGraph("line", [{data:[{x:0, y:0}]}],
                                      "standard", "sim-graph", "sim-legend");
  graph.render();

  $('#sim-run').click(function(evt){
    simltr.runSimulation();
  });
});
