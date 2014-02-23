function fileUpload(){
  var agnts = new agents();
  var lineInfo = {};
  var barInfo = {};
  var fuInfo = {};
  var fuSeries = []; 
  var armToColor = {};
  var graph;
  var palette;
  
  //Filter values
  var graphType="line";
  var armsToDisplay=[];
  var agent = "UCB1";
  var showAU = false;
  var armForAU = "1";

  
  var updateArmsHolderHtml = function(noArms){
    var armCheckboxes = '';
    var armOptions = '';

    for(var i=0; i<noArms; i++){
      if(i < (noArms-1)){
        armCheckboxes += '<input checked type="checkbox"'+ 
                                  'name="fu-show-arms" value="'+(i+1)+'">Arm '+(i+1)+' <br/>'; 
      }else{
        armCheckboxes += '<input checked type="checkbox"'+
                                  'name="fu-show-arms" value="'+(i+1)+'">Arm '+(i+1);
      }
      armOptions += '<option value="'+(i+1)+'">'+(i+1)+'</option>';
    }

    //Add to DOM
    $("#fu-arm-checkboxes-holder").empty();
    $("#fu-arm-checkboxes-holder").append(armCheckboxes);
    $("#fu-arm-select-holder").append(armOptions);
  }

  var assignColorToArms = function(noArms){
    armToColor = {};
    palette = new Rickshaw.Color.Palette();  
    var color;

    for(var i=0; i<fuSeries.length; i++){
      color = palette.color();
      fuSeries[i].color = color; 
      armToColor[fuSeries[i].name] = color;
    }

    armToColor["sim"] = palette.color();
  }

  this.setFuInfo = function(lineI, barI){
    lineInfo = lineI;
    barInfo = barI;
    if(graphType == "line"){
      fuInfo = lineI;
      fuSeries = lineI.data;
    }else if(graphType == "bar"){
      fuInfo = barI;
      fuSeries = barI.data;
    }
  }

  this.setGraph = function(g){
      graph = g;
  }

  this.applyFilters = function(){
    //Gather all the values in the filter panel
    var graphOptions, armCheckboxes, agentOptions, auArmOptions;

    graphOptions = $(".fu-graph-type");
    for (var i=0; i<graphOptions.length; i++){
      if(graphOptions[i].checked){
        graphType = graphOptions[i].value;
        break;
      }
    }
    if(graphType == "line"){
      fuInfo = lineInfo;
      fuSeries = lineInfo.data;
    }else if(graphType == "bar"){
      fuInfo = barInfo;
      fuSeries = barInfo.data;
    }    
    assignColorToArms(fuInfo.arms);

    armCheckboxes = $("#fu-arm-checkboxes-holder").children();
    armsToDisplay = [];
    for (var i=0; i<armCheckboxes.length; i++){
      if(armCheckboxes[i].checked){
        armsToDisplay.push(armCheckboxes[i].value);
      }
    }

    agentOptions = $("#fu-agent").children();
    for (var i=0; i<agentOptions.length; i++){
      if(agentOptions[i].selected){
        agent = agentOptions[i].value;
        break;
      }
    }
    
    showAU = $("#fu-active-unactive")[0].checked;
    acArmOptions = $("#fu-arm-select-holder").children();
    for(var i=0; i<acArmOptions.length; i++){
      if(acArmOptions[i].selected){
        armForAU = acArmOptions[i].value;
        break;
      }
    }
    
    var filteredSeries = [];
    var simData;

    //Only include those arms that are checked
    for(var i=0; i<fuSeries.length; i++){
      if(armsToDisplay.indexOf(fuSeries[i].name) != -1){
        filteredSeries.push(fuSeries[i]);
      }
    }
    debugger;
    //Run the agent
    if(graphType == "line"){
      simData = agnts.runSim(agent, fuInfo.steps, fuInfo.arms, fuSeries, armToColor["sim"]);
      filteredSeries.push(simData);
    }

    //If the show active/unactive option is checked, apply this to the give arm
    if(graphType == "line"){
      if(showAU){
        //TODO
        alert("Showing the active/unactive region feature is being worked on");
      }
    }

    $("#fu-graph").empty();
    $("#fu-legend").empty();
    graph = GraphUtil.createGraph(graphType, filteredSeries, "standard", "fu-graph", "fu-legend");
    graph.render();
  }

  this.runSimulation = function(){
    if(fuInfo.arms == 0){
      return;
    }

    updateArmsHolderHtml(fuInfo.arms);
    assignColorToArms(fuInfo.arms);
    $('#fu-graph').empty();
    $('#fu-legend').empty();
    graph = GraphUtil.createGraph(graphType, fuSeries, "standard", "fu-graph", "fu-legend");
    graph.render();
  }
}

$(document).ready(function(){
  var fu = new fileUpload(); 

  //Empty graph to begin things
  var graph = GraphUtil.createGraph("line", [{data:[{x:0, y:0}]}], 
                                      "standard", "fu-graph", "fu-legend");
  graph.render();
  
  //A graph instance is needed to allow re-rendering when a filter is applied.
  fu.setGraph(graph);

  //Event handler for filters.
  $("#fu-run").click(function(evt){
    fu.applyFilters();
  });

  //Once a file is uploaded, the graph will be re-rendered
  $("#file-upload").change(function(evt){
    FR.readFile(evt, 'line', function(fileString){
      var lineInfo = DataUtil.getLineData(fileString);
      var barInfo = DataUtil.getBarData(fileString);
      fu.setFuInfo(lineInfo, barInfo);
      fu.runSimulation();
    });
  });
});
