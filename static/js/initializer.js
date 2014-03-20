function initializer(){
  this.fileInitialzer = {
    "fileFilter": {},
    "init": function(){
      createEmptyGraph();
      this.fileFilter = new filters().fileFilter;
      this.fileFilter.init();
      var fileFilter = this.fileFilter;
      $("#file-upload").change(function(evt){
        FR.readFile(evt, 'line', function(fileString){
          var lineInfo = DataUtil.getLineData(fileString);
          var barInfo = DataUtil.getBarData(fileString);
          var colorPalette = new Rickshaw.Color.Palette();
          var colorOfArms = {};
          var armName;
          for(var i=0; i<lineInfo.data.length; i++){
            armName = lineInfo.data[i].name;
            colorOfArms[armName] = colorPalette.color();
            lineInfo.data[i]["color"] = colorOfArms[armName];
          }
          for(var i=0; i<barInfo.data.length; i++){
            armName = barInfo.data[i].name;
            barInfo.data[i]["color"] = colorOfArms[armName];
          }
          fileFilter.setGraphSeries(lineInfo, barInfo);
          fileFilter.applyFilters();
        });
      });
    }
  },
  this.simulatorInitializer = {
    "simFilter": {},
    "init": function(){
      createEmptyGraph();
      this.simFilter = new filters().simulatorFilter;
      this.simFilter.init();
    }
  },
  this.liveInitializer = {
    "liveFilter": {},
    "initSocketEvents": function(){
      var senderId = $("#sender-id").text();
      var socket = io.connect(CONFIG.ADDRESS);
      
      var armsAddedToFilter = false;
      var displayOneGraph = false;
      var singleGraphSeries = [];
      var multipleGraphSeries = [];
      var liveFilter = this.liveFilter;

      socket.on("connect", function(){
        socket.emit("viewer_connect", senderId);
      });

      socket.on('update_graph', function(series){
        var palette = new Rickshaw.Color.Palette();
        var graphSeries = [];
        var alternatives = series.alternatives
        var ucbObj = {};
        var meanObj = {};
        var alternativeNames = [];
        var tmp = [];

        singleGraphSeries = [];
        multipleGraphSeries = [];

        for(var i=0; i<alternatives.length; i++){
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
          singleGraphSeries.push(ucbObj);
          singleGraphSeries.push(meanObj);
          tmp = [];
          tmp.push(ucbObj);
          tmp.push(meanObj);
          multipleGraphSeries.push(tmp);
          alternativeNames.push(alternatives[i].alternative);
        }

        //Add ability to show/side alternatives in the filter panel.
        if(!armsAddedToFilter){
          armsAddedToFilter = true;
          liveFilter.addArmsToFilter(alternativeNames, "#arm-checkboxes-holder");
          liveFilter.onArmsChange();
        }
        
        //Update the series stored in the filter.
        liveFilter.setGraphSeries(singleGraphSeries, multipleGraphSeries, series["max_score"]+0.5);

        //Apply the filters which will then display the graph.
        liveFilter.applyFilters();
      });
    },
    "init": function(){
      createEmptyGraph();
      this.liveFilter = new filters().liveFilter;
      this.liveFilter.init();
      this.initSocketEvents();
    }
  }

  function createEmptyGraph(){
    GraphUtil.createGraph("line", [{data:[{x:0, y:0}]}], "standard", "graph-holder", "legend-holder", "range-holder");
  }
}
