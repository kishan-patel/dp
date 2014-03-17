function filters(){
  this.fileFilter = {
    "createSingleGraph": createSingleGraph,
    "createMutlipleGraphs": createMultipleGraphs,
    "addArmsToFilter": addArmsToFilter,
    "lineSeries": [],
    "barSeries": [],
    "setGraphSeries": function(lineSeries, barSeries){
      this.barSeries = barSeries.data;
      this.lineSeries = lineSeries.data;
      var armsToAddToFilter = [];

      for(var i=0; i<lineSeries.data.length; i++){
        armsToAddToFilter.push(lineSeries.data[i].name);;
      }

      //Update the checkboxes of arms shown in the filter.
      addArmsToFilter(armsToAddToFilter, "#arm-checkboxes-holder"); 
    },
    "displaySingleGraph": true,
    "displayLine": true,
    "armsToDisplay": [],
    "agents": new agents(),
    "init": function(){
       var me = this;
       $("#apply-filters").click(function(){
        me.applyFilters();
       });
     },
    "applyFilters": function(){
       var filteredSeries = [];
       //Bar or line chart
       var displayLineGraph = $(".graph-type")[0].checked;
       if(displayLineGraph){
         this.displayLine = true;
       }else{
         this.displayLine = false;
       }
       
       //Which arms to display
       var armCheckboxes = $("#arm-checkboxes-holder").children();
       var armsToDisplay = [];
       for(var i=0; i<armCheckboxes.length; i++){
         if(armCheckboxes[i].checked)
           armsToDisplay.push(armCheckboxes[i].value);
       }
       this.armsToDisplay = armsToDisplay;

       //How many graphs to display
       this.displaySingleGraph = $(".number-graphs")[1].checked;
       
       //Which agent to applly
       var agentType = "none";
       var agents = $("#agent").children();
       for(var i=0; i<agents.length; i++){
         if(agents[i].selected){
           agentType = agents[i].value;
           break;
         }
       }

       //Apply the filters 
       var lineSeries = this.lineSeries;
       var barSeries = this.barSeries;
       var tmp = [];
       if(this.displayLine){
         for(var i=0; i<lineSeries.length; i++){
           if(armsToDisplay.indexOf(lineSeries[i].name) != -1)
             if(!this.displaySingleGraph){
               tmp = [];
               tmp.push(lineSeries[i]);
               if(agentType != "none"){
                 var agentData = this.agents.getScores(agentType, lineSeries[i].data);
                 tmp.push({
                   name:  lineSeries[i].name + "-" + agentType,
                   data: agentData
                 })
               }
               filteredSeries.push(tmp);
             }else{
               filteredSeries.push(lineSeries[i]);
               if(agentType != "none"){
                 var agentData = this.agents.getScores(agentType, lineSeries[i].data);
                 filteredSeries.push({
                   name: lineSeries[i].name + "-" + agentType,
                   data: agentData
                 });
               }
             }
         }
         if(this.displaySingleGraph){
           createSingleGraph(filteredSeries, 1.2, "line");
         }else{
           createMultipleGraphs(filteredSeries, 1.2);
         }
       }else{
         for(var i=0; i<barSeries.length; i++){
           if(armsToDisplay.indexOf(barSeries[i].name) != -1)
             filteredSeries.push(barSeries[i]);
         }
         createSingleGraph(filteredSeries, 1.2, "bar");
       }
    }
  }

  this.simulatorFilter = {
    "createSingleGraph": createSingleGraph,
    "createMultipleGraphs": createMultipleGraphs,
    "getStepsInfo": function(){
      return $("#steps")[0].value;
    },
    "getArmsInfo": function(){
      var armsHtml = $("#arms select, #arms input");
      var armType, armProb;
      var arms=[];

      for(var i=0; i<armsHtml.length; i+=2){
        armType = armsHtml[i].value;
        armProb = armsHtml[i+1].value;
        arms.push({"type": armType, "prob":armProb});
      }

      return arms; 
    },
    "getAgentsInfo": function(){
      var agentsHtml = $('#agents select');
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
    },
    "singleGraphSeries": [],
    "agents": new agents(),
    "bandits": new bandits(),
    "armCounter": 2,
    "agentCounter": 2,
    "addArms": function(){
      this.armCounter++;
      var html = "Arm "+this.armCounter+":&nbsp&nbsp"+
                 "<select>"+
                   "<option value='Bernoulli' selected>Bernoulli</option>"+
                 "</select>&nbsp"+
                 "<input type='text' value='0.5' size='1'><br/>";
      $("#add-arm").before(html);
    },
    "addAgents": function(){
      this.agentCounter++;
      var fun = $("#custom-function")[0].value;
      var html = "Agent "+this.agentCounter+":&nbsp <p style='display:inline' id='"+this.agentCounter+"'>"+fun+"</p><br/>";
      $("#custom-function").before(html);
    },
    "init": function(){
      var me = this;
      $("#add-arm").click(function(){
        me.addArms();
      });
      $("#add-agent").click(function(){
        me.addAgents();
      });
      $("#apply-filters").click(function(){
        me.applyFilters();
      });
    },
    "applyFilters": function(){
      this.singleGraphSeries = [];

      //How many graphs to display
      this.displaySingleGraph = $(".number-graphs")[1].checked;

      //How many time steps we should run the simulation for
      var steps = this.getStepsInfo();
 
      //We run the simulation for each arm/bandit
      var bandits = [];
      var armsInfo = this.getArmsInfo();
      for(var i=0; i<armsInfo.length; i++){
        bandits.push(this.bandits.getBandit(armsInfo[i].type, armsInfo[i].prob));
      }
      
      //We run the simulation for each agent.
      var agentsInfo = this.getAgentsInfo();
      var simColorPalette = new Rickshaw.Color.Palette();
      var tmpData = {};
      var overallMaxScore = 0;
      var simColor;
      for(var i=0; i<agentsInfo.length; i++){
       tmpData = this.agents.runSim(agentsInfo[i].type, steps, bandits);
       if(overallMaxScore < tmpData["max_score"]){
         overallMaxScore = tmpData["max_score"];
       }
       
       var tmp = [];
       for(var arm in tmpData["all_scores"]){
         tmp = [];
         if(!this.displaySingleGraph){
           tmp.push({
             name: "Arm "+(parseInt(arm)+1)+"("+agentsInfo[i].type+")",
             color: simColorPalette.color(),
             data: tmpData["all_scores"][arm]
           });
           this.singleGraphSeries.push(tmp);
         }else{
           this.singleGraphSeries.push({
             name: "Arm "+(parseInt(arm)+1)+"("+agentsInfo[i].type+")",
             color: simColorPalette.color(),
             data: tmpData["all_scores"][arm]
           });  
         }
       }
      }

      if(this.displaySingleGraph)
        createSingleGraph(this.singleGraphSeries, overallMaxScore, "line");
      else
        createMultipleGraphs(this.singleGraphSeries, overallMaxScore, "line");
    }
  }

  this.liveFilter = {
    "createSingleGraph": function(singleGraphSeries, maxScore, type){
      this.armsToDisplay = this.getArmsToDisplay();
      var tmpSeries = [];
      for(var i=0; i<singleGraphSeries.length; i++){
        if(this.armsToDisplay.indexOf(singleGraphSeries[i].name.split(" ")[0])!=-1)
          tmpSeries.push(singleGraphSeries[i]);          
      }
      createSingleGraph(tmpSeries, maxScore, "line")
    },
    "createMultipleGraphs": function(multiGraphSeries, maxScore, type){
      this.armsToDisplay = this.getArmsToDisplay();
      var tmpSeries = [];
      for(var i=0; i<multiGraphSeries.length; i++){
        if(this.armsToDisplay.indexOf(multiGraphSeries[i][0].name.split(" ")[0])!=-1){
          tmpSeries.push(multiGraphSeries[i]);
        }
      }
      createMultipleGraphs(tmpSeries, maxScore);
    },
    "addArmsToFilter": addArmsToFilter,
    "getArmsToDisplay": function(){
      var armCheckboxes = $("#arm-checkboxes-holder").children();
      var armsToDisplay = [];
      for(var i=0; i<armCheckboxes.length; i++){
        if(armCheckboxes[i].checked){
          armsToDisplay.push(armCheckboxes[i].value);
        }
      }   
      return armsToDisplay;
    },
    "singleGraphSeries": [],
    "multipleGraphSeries": [],
    "maxScore": 0,
    "armsToDisplay": [],
    "displaySingleGraph": true,
    "init": function(){
      var me = this;
      $("#live-apply").click(function(){
        me.applyFilters();
      });
    },
    "setGraphSeries": function(singleGraphSeries, multipleGraphSeries, maxScore){
      this.singleGraphSeries = singleGraphSeries;
      this.multipleGraphSeries = multipleGraphSeries;
      this.maxScore = maxScore;
    },
    "applyFilters": function(){
      this.armsToDisplay = this.getArmsToDisplay();

      var displaySingleGraph = $(".number-graphs")[1].checked;  
      if(displaySingleGraph){
        this.displaySingleGraph = true;
        this.createSingleGraph(this.singleGraphSeries, this.maxScore);
      }else{
        this.displaySingleGraph = false;
        this.createMultipleGraphs(this.multipleGraphSeries, this.maxScore);
      }
    }
  }

  function createSingleGraph(graphSeries, maxScore, type){
    $(".mab-graph").empty();
    var panelString = "<div class='panel panel-default'>"+
                  "<div class='panel-heading'>Live data</div>"+
                  "<div class='panel-body'><br/><br/>"+
                    "<div id='graph-holder'></div><br/>"+
                    "<div id='range-holder'></div><br/>"+
                    "<div id='legend-holder'></div>"+
                  "</div>"+
                  "</div>";
    $(".mab-graph").append(panelString);
    var graph = GraphUtil.createGraph(type, graphSeries, "standard", "graph-holder", "legend-holder", "range-holder", maxScore);
  }

  function createMultipleGraphs(graphSeries, maxScore){
    $(".mab-graph").empty();
    var panelString = "";
    for(var i=0; i<graphSeries.length; i++){
      panelString = "";
      panelString = "<div class='panel panel-default'>"+
                    "<div class='panel-heading'>Live data</div>"+
                    "<div class='panel-body'><br/><br/>"+
                      "<div id='graph-holder-"+i+"'></div><br/>"+
                      "<div id='range-holder-"+i+"'></div><br/>"+
                      "<div id='legend-holder-"+i+"'></div>"+
                    "</div>"+
                    "</div>";
      $(".mab-graph").append(panelString);
      var graph = GraphUtil.createGraph("line", graphSeries[i], "standard", "graph-holder-"+i, "legend-holder-"+i, "range-holder-"+i, maxScore);
    }
  }

  function addArmsToFilter(alternatives, htmlId){
      var armCheckboxes = "";
      for(var i=0; i<alternatives.length; i++){
         armCheckboxes += "<input checked type='checkbox' name='live-show-arms' value='"+alternatives[i]+"'>"+alternatives[i];   
         if(i<(alternatives.length-1))
           armCheckboxes += "<br/>";
      }
      $(htmlId).empty();
      $(htmlId).append(armCheckboxes);
  }
}
