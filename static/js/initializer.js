function initializer(){
  this.fileInitialzer = {
    "init": function(){
      $("#agent").multiselect();
      $("#graph-type").multiselect();
      createEmptyGraph();
      var fileFilter = new filters().fileFilter;
      fileFilter.init();
      $("#file-upload").change(function(evt){
        FR.readFile(evt, 'line', function(fileString){
          var lineInfo = DataUtil.getLineData(fileString);
          var barInfo = DataUtil.getBarData(fileString);
          fileFilter.setGraphSeries(lineInfo, barInfo);
          fileFilter.applyFilters();
        });
      });
    }
  },
  this.simulatorInitializer = {
    "init": function(){
      $(".multi-select-arms").multiselect();
      $(".multi-select-agents").multiselect();
      $("#sim-display").multiselect();
      createEmptyGraph();
      this.simFilter = new filters().simulatorFilter;
      this.simFilter.init();
    }
  },
  this.liveInitializer = {
    "initSocketEvents": function(){
      var senderId = $("#sender-id").text();
      var socket = io.connect(CONFIG.ADDRESS);
      
      var armsAddedToFilter = false;
      var displayOneGraph = false;
      var singleGraphSeries = [];
      var multipleGraphSeries = [];
      var liveFilter = this.liveFilter;
      var alternativeNames=[], newArmPresent = false;

      socket.on("connect", function(){
        socket.emit("viewer_connect", senderId);
      });

      socket.on('update_graph', function(series){
        var palette = new Rickshaw.Color.Palette();
        var graphSeries = [];
        var alternatives = series.alternatives
        var ucbObj = {};
        var meanObj = {};
        var tmp = [];

        singleGraphSeries = [];
        multipleGraphSeries = [];

        if(alternativeNames.length != alternatives.length){
          alternativeNames = []; 
        }

        for(var i=0; i<alternatives.length; i++){
          if(alternativeNames.indexOf(alternatives[i].alternative) == -1){
            alternativeNames.push(alternatives[i].alternative);
            newArmPresent = true;
          }

          ucbObj = {
            "name": alternatives[i].alternative+" (UCB1)",
            "color": palette.color(),
            "data": alternatives[i].ucb_scores
          };
          meanObj = {
            "name": alternatives[i].alternative+" (mean)",
            "color": palette.color(),
            "data": alternatives[i].mean_scores
          };
          singleGraphSeries.push(meanObj);
          tmp = [];
          tmp.push(ucbObj);
          tmp.push(meanObj);
          multipleGraphSeries.push(tmp);
        }

        //Add ability to show/side alternatives in the filter panel.
        if(newArmPresent){
          newArmPresent = false;
          liveFilter.addArmsToFilter(alternativeNames, "#arm-checkboxes-holder");
        }
        
        //Update the series stored in the filter.
        liveFilter.setGraphSeries(singleGraphSeries, multipleGraphSeries);

        //Apply the filters which will then display the graph.
        liveFilter.applyFilters();
      });
    },
    "init": function(){
      $("#agent").multiselect();
      createEmptyGraph();
      var info = new Info();
      //info.addAlert("info", "alert-container", info.alertMessages["live_socket_connection"]);
      this.liveFilter = new filters().liveFilter;
      this.liveFilter.init();
      this.initSocketEvents();
    }
  }

  function createEmptyGraph(){
    GraphUtil.createGraph("line", [{data:[{x:0, y:0}]}], "standard", "graph-holder", "legend-holder", "range-holder");
  }
}
