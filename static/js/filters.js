function filters(){
  this.fileFilter = {
    "updateGraph": updateGraph,
    "addArmsToFilter": addArmsToFilter,
    "agents": new agents(),
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

      //Update the checboxes of arms shown in the filter.
      addArmsToFilter(armsToAddToFilter, "#arm-checkboxes-holder");
      this.onArmsChange();
    },
    "onTypeChange": function(){
      var me = this;
      $(".graph-type").click(function(e){
        me.applyFilters();
      });
    },
    "onArmsChange": function(){
      var me = this;
      $("#arm-checkboxes-holder").children().click(function(e){
        me.applyFilters();
      });
    },
    "onAgentsChange": function(){
      var me = this;
      $("#agent").change(function(e){
        me.applyFilters();
      });
    },
    "onActiveChange": function(){
    },
    "onNoGraphChange": function(){
      var me = this;
      $(".number-graphs").change(function(e){
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
       debugger;
       //Bar or line chart
       var displayLineGraph = $(".graph-type")[0].checked;
       var graphType;
       if(displayLineGraph){
         this.displayLine = true;
         graphType = "line"
       }else{
         this.displayLine = false;
         graphType ="bar";
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
       
       //Which agent to apply
       var agentType = "none";
       var agents = $("#agent").children();
       for(var i=0; i<agents.length; i++){
         if(agents[i].selected){
           agentType = agents[i].value;
           break;
         }
       }

       //Apply the filters 
       var tmpSeries = {};
       tmpSeries["all"] = [];
       debugger;
       if(this.displayLine){
         for(var i=0; i<this.lineSeries.length; i++){
           if(armsToDisplay.indexOf(this.lineSeries[i].name) == -1)  
             continue;

           if(this.displaySingleGraph){
             if(agentType != "none"){
               var agentData = this.agents.getScores(agentType, this.lineSeries[i].data);
               tmpSeries["all"].push({
                 "name": this.lineSeries[i].name + "-" + agentType,
                 "data": agentData
               });
             }
           }else{
             tmpSeries[i] = [];
             tmpSeries[i].push(this.lineSeries[i]);
             if(agentType != "none"){
               var agentData = this.agents.getScores(agentType, this.lineSeries[i].data);  
               tmpSeries[i].push({
                 "name": this.lineSeries[i].name + "-" + agentType,
                 "data": agentData
               });
             }
           }
         }
       }else{
         for(var i=0; i<this.barSeries.length; i++){
           if(armsToDisplay.indexOf(this.barSeries[i].name) == -1)
             continue;
           tmpSeries["all"].push(this.barSeries[i]);
         }
       }

       //Format the graph series before creating the graph
       this.graphSeries = [];
       for(var key in tmpSeries){
         if(tmpSeries[key].length > 0)
           this.graphSeries.push(tmpSeries[key]);
       }
       
       //Create the graph
       this.updateGraph(this.graphSeries, graphType);

      //Update the tooltips
       var tooltipInfo = this.displaySingleGraph ? info.tooltipInfo["mean_ucb1"] : info.tooltipInfo["ucb1"];
       tooltip.initTooltip(".graph-info", tooltipInfo);
    }
  }

  this.simulatorFilter = {
    "updateGraph": updateGraph,
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
    "agents": new agents(),
    "bandits": new bandits(),
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
                     "<select>"+
                       "<option value='Bernoulli' selected>Bernoulli</option>"+
                     "</select>&nbsp"+
                     "p=<input type='text' value='0.5' size='1'><br/><br/>";
        $("#add-arm").before(html);
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
        bandits.push(this.bandits.getBandit(armsInfo[i].type, armsInfo[i].prob));
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
        simData = this.agents.runSim(agentsInfo[i].type, steps, bandits, agentsInfo[i].agent_fn);
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

      //Create the graph
      this.updateGraph(this.graphSeries, "line");

      //Update the tooltips
      var tooltipInfo = info.tooltipInfo["sim"]  
      info.initTooltip(".graph-info", tooltipInfo); 
    }
  }

  this.liveFilter = {
    "updateGraph": function(graphSeries, type){
      if(this.graphs.length > 0){
        for(var i=0; i<graphSeries.length; i++){
          this.graphs[i].series.length =  0;
          for(var j=0; j<graphSeries[i].length; j++){
            this.graphs[i].series.push(graphSeries[i][j]);
          }
          this.graphs[i].update();
        }
      }else{
        this.graphs = updateGraph(graphSeries, type)
      }
    },
    "addArmsToFilter": addArmsToFilter,
    "setGraphSeries": function(singleGraphSeries, multipleGraphSeries){
      this.singleGraphSeries = singleGraphSeries;
      this.multipleGraphSeries = multipleGraphSeries;
    },
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
    "graphSeries": [],
    "graphs": [],
    "armsToDisplay": [],
    "onArmsChange": function(){
      var me = this;
      $("#arm-checkboxes-holder").children().on('click', function(e){
        me.graphs = [];
        me.applyFilters();
      })
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
      this.onNoGraphChange();
      $("#live-apply").click(function(){
        me.applyFilters();
      });
    },
    "applyFilters": function(){
      this.armsToDisplay = this.getArmsToDisplay();
      var displaySingleGraph = $(".number-graphs")[1].checked;  
      var tmpSeries = [];
      this.graphSeries = [];


      if(displaySingleGraph){
        for(var i=0; i<this.singleGraphSeries.length; i++){
          if(this.armsToDisplay.indexOf(this.singleGraphSeries[i].name.split(" ")[0]) == -1)
            continue;
          tmpSeries.push(this.singleGraphSeries[i]);
        }
        this.graphSeries.push(tmpSeries);
      }else{
        for(var i=0; i<this.multipleGraphSeries.length; i++){
          if(this.armsToDisplay.indexOf(this.multipleGraphSeries[i][0].name.split(" ")[0]) == -1)
            continue;
          this.graphSeries.push(this.multipleGraphSeries[i]);
        }
      }

      this.updateGraph(this.graphSeries, "line");

      //Update the tooltips
      var tooltipInfo = displaySingleGraph ? info.tooltipInfo["ucb1"] : info.tooltipInfo["mean_ucb1"]; 
      info.initTooltip(".graph-info", tooltipInfo); 
    }
  }

  var info = new Info();

  function updateGraph(graphSeries, type, panelHeading){
    $(".mab-graph").empty();
    var panelString = "";
    GraphUtil.initColorPalette();
    var graph, graphs=[];
    for(var i=0; i<graphSeries.length; i++){
      panelString = "";
      panelString = "<div class='panel panel-default'>"+
                    "<div class='panel-heading'>"+panelHeading+"<span class='glyphicon glyphicon-info-sign graph-info' style='float:right;'></span></div>"+
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
