function filters(){
  this.fileFilter = {
    "updateGraph": updateGraph,
    "addArmsToFilter": addArmsToFilter,
    "displaySingleGraph": true,
    "lineSeries": [],
    "barSeries": [],
    "graphSeries": [],
    "setGraphSeries": function(lineSeries, barSeries){
      this.lineSeries = lineSeries.data;
      this.barSeries = barSeries.data;
      var armsToAddToFilter = [];

      for(var i=0; i<lineSeries.data.length; i++){
        armsToAddToFilter.push(lineSeries.data[i].name);
      }

      //Add arms to select boxes in filter
      addArmsToMultiSelect(armsToAddToFilter, "multi-select-arms-holder", "multi-select-arms", "selected");
      addArmsToMultiSelect(armsToAddToFilter, "multi-select-au-holder", "multi-select-au", "");
      $("#multi-select-arms").multiselect();
      $("#multi-select-au").multiselect();

      //Setup listeners
      this.onArmsChange();
      this.onActiveChange();
    },
    "onTypeChange": function(){
      var me = this;
      $("#graph-type").on('change', function(e){
        me.applyFilters();
      });
    },
    "onArmsChange": function(){
      var me = this;
      $("#multi-select-arms").on('change', function(e){
        me.applyFilters();
       });
    },
    "onAgentsChange": function(){
      var me = this;
      $("#agent").on('change', function(e){
        me.applyFilters();
      });
    },
    "onActiveChange": function(){
      var me = this;
      $("#multi-select-au").on('change', function(e){
        info.addAlert("danger", "alert-container", "This feature is temporarily broken. It will be fixed soon.");  
      });
    },
    "onNoGraphChange": function(){
      var me = this;
      $(".number-graphs").on('change', function(e){
        me.applyFilters();
      });
    },
    "init": function(){
       this.onTypeChange();
       this.onArmsChange();
       this.onAgentsChange();
       this.onActiveChange();
       this.onNoGraphChange();
     },
    "applyFilters": function(){
       var filteredSeries = [];

       //Bar or line chart
       var graphType="line";
       var graphTypeSelected = $("#graph-type").children();
       for(var i=0; i<graphTypeSelected.length; i++){
           if(graphTypeSelected[i].selected){
             graphType = graphTypeSelected[i].value;
           }
       }

       //Which arms to display
       var armsToDisplay = [];
       var armsSelected = $("#multi-select-arms").children();
       for(var i=0; i<armsSelected.length; i++){
         if(armsSelected[i].selected){
           armsToDisplay.push(armsSelected[i].value);
         }
       }
       this.armsToDisplay = armsToDisplay;
       
       //Which agent to apply
       var agentType = "means";
       var agents = $("#agent").children();
       for(var i=0; i<agents.length; i++){
         if(agents[i].selected){
           agentType = agents[i].value;
           break;
         }
       }

       //Apply the filters 
       var tmpSeries = {};
       tmpSeries["means"] = [];

      //Apply the filters and display the line graphs.
      if(graphType == "line"){
        for(var i=0; i<this.lineSeries.length; i++){
          if(armsToDisplay.indexOf(this.lineSeries[i].name) == -1){
            continue;
          }

          if(agentType == "means"){
            tmpSeries["means"].push(this.lineSeries[i]);
          }else if(agentType == "ucb1_score_and_mean_values"){
            tmpSeries[i] = [];
            
            //Push the mean value series for the present arm.
            tmpSeries[i].push(this.lineSeries[i]);

            //Calculate the ucb1 scores for the the present arm.
            var agentData = agnts.getScores(agentType, this.lineSeries[i].data);  
            tmpSeries[i].push({
              "name": this.lineSeries[i].name + " (UCB1)",
              "data": agentData
            });

            //Push the other means as well but their color will be weak.
            for(var j=0; j<this.lineSeries.length; j++){
              if(i != j){
                tmpSeries[i].push({
                  name: this.lineSeries[j].name,
                  data: this.lineSeries[j].data,
                  color: weakColorCode
                });
              }           
            }
          }else if(agentType == "ucb1_scores_and_mean_value"){
            tmpSeries[i] = [];
            
            //Push the mean value series for the present arm.
            tmpSeries[i].push(this.lineSeries[i]);

            //Calculate the ucb1 scores for the the present arm.
            var agentData = agnts.getScores(agentType, this.lineSeries[i].data);  
            tmpSeries[i].push({
              "name": this.lineSeries[i].name + " (UCB1)",
              "data": agentData
            });

            //Push the other ucb1 scores for the other arms as well.
            for(var j=0; j<this.lineSeries.length; j++){
              if(i != j){
                agentData = agnts.getScores(agentType, this.lineSeries[j].data);  
                tmpSeries[i].push({
                  "name": this.lineSeries[j].name + " (UCB1)",
                  "data": agentData,
                  "color": weakColorCode
                });
              }           
            }
          }
        }
      }

      //Apply the filters and display bar graph.
      if(graphType == "bar"){
        for(var i=0; i<this.barSeries.length; i++){
          if(armsToDisplay.indexOf(this.barSeries[i].name) == -1){
           continue;
          }
          tmpSeries["means"].push(this.barSeries[i]);
        }
      }

      //Format the graph series before creating the graph
      this.graphSeries = [];
      for(var key in tmpSeries){
        if(tmpSeries[key].length > 0){
          this.graphSeries.push(tmpSeries[key]);
        }
      }
       
      //Title of graph
      var graphTitle = info.titles[agentType];

      //Create the graph
      this.updateGraph(this.graphSeries, graphType, graphTitle);

      //Update the tooltips
      var tooltipInfo = info.tooltipInfo[agentType];
      info.initTooltip(".graph-info", tooltipInfo);
    }
  }

  this.simulatorFilter = {
    "updateGraph": updateGraph,
    "getStepsInfo": function(){
      return $("#steps")[0].value;
    },
    "getArmNames": function(){
      var armsHtml = $("#arms selected");
      var armNames = [];

      for(var i=0; i<armsHtml.length; i++){
        armNames.push(armsHtml[i]);
      }

      return armsHtml;
    },
    "getArmsInfo": function(){
      var armsHtml = $("#arms selected, #arms input");
      var armType, armProb;
      var arms=[];

      for(var i=0; i<armsHtml.length; i+=2){
        armType = armsHtml[i].value;
        armProb = armsHtml[i+1].value;
        arms.push({"type": armType, "prob":parseFloat(armProb)});
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
            agents.push({"type": options[j].value, "agent_fn":""});
          }
        }
      }

      return agents;
    },
    "graphSeries": [],
    "armCounter": 2,
    "agentCounter": 2,
    "customAgents":{},
    "onArmsChange": function(){
      var me = this;
      $("#arms>select").on("change", function(e){
        me.applyFilters();  
      });

      $("#arms>input").on("change", function(e){
        me.applyFilters();
      });
    },
    "onAgentsChange": function(){
      var me = this;
      $("#agents>select").on("change", function(e){
        me.applyFilters();
      });
    },
    "onStepsChange": function(){
      var me = this;
      $("#steps").on("change", function(e){
        me.applyFilters();
      });
    },
    "onNoGraphChange": function(){
      var me = this;
      $(".number-graphs").on("click", function(e){
        me.applyFilters();
      });
    },                                                    
    "onAddArms": function(){
      var me = this;
      $("#add-arm").on('click', function(e){
        me.armCounter++;  
        var html = "Arm "+me.armCounter+":&nbsp&nbsp"+
                     "<select class='multi-select-arms'>"+
                       "<option value='Bernoulli' selected>Bernoulli</option>"+
                     "</select>&nbsp"+
                     "p=<input type='text' value='0.5' size='1'><br/><br/>";
        $("#add-arm").before(html);
        $(".multi-select-arms").multiselect();

        me.applyFilters();
      });
    },
    "onAddAgents": function(){
      var me = this;
      $("#add-agent").on('click', function(e){
        var agentName = $("#agent-name").val();
        var customFunction = $("#custom-function").val();
        me.agentCounter++;
        var html = "Agent "+me.agentCounter+":&nbsp <p style='display: inline' id='"+me.agentCounter+"'>"+agentName+"</p><br/><br/>";
        $("#agent-name").before(html);

        if(agentName==""){
          alert("You must provide a name for the function!");
        }
        
        if(customFunction == ""){
          alert("You have to provide an implementation!");
        }

        if(agentName in me.customAgents){
          alert("This name is already defined. Enter another one!");
        }

        try{
          eval(customFunction);
          me.customAgents[agentName] = eval(agentName); 
          $("#agent-name").val("");
          $("#custom-function").val("function functionName(arms, steps)\n  //Implementation goes here.\n}");
          me.applyFilters();
        }catch(e){
          alert(e);
        }
      });
    },
    "init": function(){
      this.onArmsChange();
      this.onAgentsChange();
      this.onStepsChange();
      this.onNoGraphChange();
      this.onAddArms();
      this.onAddAgents();
      this.applyFilters();
    },
    "applyFilters": function(){
      this.graphSeries = [];

      //How many time steps we should run the simulation for
      var steps = this.getStepsInfo();
 
      //We run the simulation for each arm/bandit
      var bandits = [];
      var armsInfo = this.getArmsInfo();
      for(var i=0; i<armsInfo.length; i++){
        bandits.push(bndts.getBandit(armsInfo[i].type, armsInfo[i].prob));
      }
      
      //Get the agents and run the simulation for each one
      var agentsInfo = this.getAgentsInfo();
      for(var agent in this.customAgents){
        agentsInfo.push({"type":agent, "agent_fn": this.customAgents[agent]});
      }

      //Run the simulation for each agent
      var simSeries = {};
      var simData = {};
      for(var i=0; i<agentsInfo.length; i++){
        simData = agnts.runSim(agentsInfo[i].type, steps, bandits, agentsInfo[i].agent_fn);
        for(var arm in simData){
          if(!(arm in simSeries))
            simSeries[arm] = [];
          simSeries[arm].push({
            "name":"Arm "+(parseInt(arm)+1)+" ("+agentsInfo[i].type+")",
            "data":simData[arm]
          });
        }
      }

      //Combine the data for each arm
      for(var arm in simSeries){
        this.graphSeries.push(simSeries[arm]);
      }

      //Title of graph
      var graphTitle = info.titles["index_values_per_arm"];
      
      //Create the graph
      this.updateGraph(this.graphSeries, "line", graphTitle);

      //Update the tooltips
      var tooltipInfo = info.tooltipInfo["index_values_per_arm"]  
      info.initTooltip(".graph-info", tooltipInfo); 
    }
  }

  this.liveFilter = {
    "updateGraph": function(graphSeries, type, graphTitle){
      if(this.graphs.length > 0){
        for(var i=0; i<graphSeries.length; i++){
          this.graphs[i].series.length =  0;
          for(var j=0; j<graphSeries[i].length; j++){
            this.graphs[i].series.push(graphSeries[i][j]);
          }
          this.graphs[i].update();
        }
      }else{
        this.graphs = updateGraph(graphSeries, type, graphTitle)
      }
    },
    "addArmsToFilter": function(alternatives, htmlId){
      addArmsToMultiSelect(alternatives, "multi-select-arms-holder", "multi-select-arms", "selected");
      addArmsToMultiSelect(alternatives, "multi-select-au-holder", "multi-select-au", "");
      $("#multi-select-arms").multiselect();
      $("#multi-select-au").multiselect();
      
      //The page needs to be re-rendered as the number
      //of arms has changed.
      this.graphs = [];

      //Set up event listeners.
      this.onArmsChange();
      this.onActiveChange();
    },
    "setGraphSeries": function(singleGraphSeries, multipleGraphSeries){
      this.singleGraphSeries = singleGraphSeries;
      this.multipleGraphSeries = multipleGraphSeries;
    },
    "getArmsToDisplay": function(){
       var armsToDisplay = [];
       var armsSelected = $("#multi-select-arms").children();
       for(var i=0; i<armsSelected.length; i++){
         if(armsSelected[i].selected){
           armsToDisplay.push(armsSelected[i].value);
         }
       }
       return armsToDisplay;
    },
    "singleGraphSeries": [],
    "multipleGraphSeries": [],
    "graphSeries": [],
    "graphs": [],
    "armsToDisplay": [],
    "onArmsChange": function(){
      var me = this;
      $("#multi-select-arms").on('change', function(e){
        me.graphs = []; //We need to recreate the graphs rather than just update them.
        me.applyFilters();
      });
    },
    "onAgentsChange": function(){
      var me = this;
      $("#agent").on('change', function(e){
        me.graphs = [];
        me.applyFilters();
      });
    },
    "onActiveChange": function(){
      var me = this;
      $("#multi-select-au").on('change', function(e){
        info.addAlert("danger", "alert-container", "This feature is temporarily broken. It will be fixed soon.");  
      });
    },
    "onNoGraphChange": function(){
      var me = this;
      $(".number-graphs").on('click', function(e){
        me.graphs = [];
        me.applyFilters();
      });
    },
    "init": function(){
      var me = this;
      this.onArmsChange();
      this.onAgentsChange();
      this.onNoGraphChange();
      $("#live-apply").click(function(){
        me.applyFilters();
      });
    },
    "applyFilters": function(){
      this.armsToDisplay = this.getArmsToDisplay();
      //var displaySingleGraph = $(".number-graphs")[1].checked;  
      var tmpSeries = [];
      this.graphSeries = [];

      //Which agent to apply
      var agentType = "means";
      var agents = $("#agent").children();
      for(var i=0; i<agents.length; i++){
        if(agents[i].selected){
          agentType = agents[i].value;
          break;
        }
      }

      if(agentType == "means"){//Displaying the mean
        for(var i=0; i<this.singleGraphSeries.length; i++){
          if(this.armsToDisplay.indexOf(this.singleGraphSeries[i].name.split(/\s\(.*\)/)[0]) == -1){
            continue
          }

          tmpSeries.push(this.singleGraphSeries[i]);
        }
        this.graphSeries.push(tmpSeries);
      }else if(agentType == "ucb1_score_and_mean_values" || agentType == "ucb1_scores_and_mean_value"){//Display the mean and ucb score for each arm.
        for(var i=0; i<this.multipleGraphSeries.length; i++){
          tmpSeries = [];

          if(this.armsToDisplay.indexOf(this.multipleGraphSeries[i][0].name.split(/\s\(.*\)/)[0]) == -1){
            continue;
          }

          for(var j=0; j<this.multipleGraphSeries[i].length; j++){
            tmpSeries.push(this.multipleGraphSeries[i][j]);
          }

          //We display the mean or ucb1 scores for the other arms as well, but these will be in gray.
          var meanOrUCB = agentType == "ucb1_score_and_mean_values" ? "(mean)" : "(UCB1)"; 
          for(var j=0; j<this.multipleGraphSeries.length; j++){
            if(i != j){
              for(var k=0; k<this.multipleGraphSeries[j].length; k++){
                if(this.multipleGraphSeries[j][k].name.indexOf(meanOrUCB) != -1){
                  tmpSeries.push({
                    name: this.multipleGraphSeries[j][k].name,
                    data: this.multipleGraphSeries[j][k].data,
                    color: weakColorCode
                  })
                }
              }
            }
          }

          this.graphSeries.push(tmpSeries);
        }
      }

       //Title of graph
      var graphTitle = info.titles[agentType];

      this.updateGraph(this.graphSeries, "line", graphTitle);

      //Update the tooltips
      var tooltipInfo = info.tooltipInfo[agentType]; 
      info.initTooltip(".graph-info", tooltipInfo); 
    }
  }

  var info = new Info();
  var weakColorCode =  GraphUtil.weakColorCode;
  var agnts = new agents();
  var bndts = new bandits();

  function getArmName(armName){
    return armName.split(/\s\(.*\)/)[0];
  }

  function updateGraph(graphSeries, type, graphTitle){
    $(".mab-graph").empty();
    var panelString = "";
    GraphUtil.initColorPalette();
    var graph, graphs=[];
    for(var i=0; i<graphSeries.length; i++){
      panelString = "";
      panelString = "<div class='panel panel-default'>"+
                    "<div class='panel-heading'>"+graphTitle(graphSeries[i][0])+"<span class='glyphicon glyphicon-info-sign graph-info' style='float:right;'></span></div>"+
                    "<div class='panel-body'>"+
                      "<div id='graph-holder-"+i+"'></div><br/>"+
                      "<div id='range-holder-"+i+"'></div><br/>"+
                      "<div id='legend-holder-"+i+"'></div>"+
                    "</div>"+
                    "</div>";
      $(".mab-graph").append(panelString);
      graph = GraphUtil.createGraph(type, graphSeries[i], "standard", "graph-holder-"+i, "legend-holder-"+i, "range-holder-"+i);
      graphs.push(graph);
    }
    return graphs;
  }
   
  function addArmsToMultiSelect(alternatives, containerId, selectId, selected){
    var select = "<select id='"+selectId+"' multiple='multiple'>"
    for(var i=0; i<alternatives.length; i++){
      select += "<option value='"+alternatives[i]+"'"+selected+">"+alternatives[i]+"</option>";    
    }
    select += "</select>"

    $("#"+containerId).empty();
    $("#"+containerId).append(select);
  }

  function addArmsToFilter(alternatives, htmlId){
      var armCheckboxes = "";
      for(var i=0; i<alternatives.length; i++){
         armCheckboxes += "<input checked type='checkbox' name='live-show-arms' class='arm-checkboxes' value='"+alternatives[i]+"'>"+alternatives[i];   
         if(i<(alternatives.length-1))
           armCheckboxes += "<br/>";
      }
      $(htmlId).empty();
      $(htmlId).append(armCheckboxes);
  }
}
