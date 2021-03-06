function graphUtil() {                                              
   this.createGraph = function(graphType, series, dataType, graphId, legendId, rangeHolderId){
     //Determine what the max score is for the graph height.
     var max = 1;
     for(var i=0; i<series.length; i++){
       for(var j=0; j<series[i].data.length; j++){
         if(series[i].data[j].y > max)
           max = series[i].data[j].y; 
       }
     }

     //Set the color for each arm
     for(var i=0; i<series.length; i++){
       if(series[i].color != this.weakColorCode){
        series[i].color = palette.color();
        }
     }

     //Create the graph
     var graph = new Rickshaw.Graph({
       element: document.getElementById(graphId),
       max: dataType != "timestamp" ? max+0.2: 0,
       min: dataType != "timestamp" ? -0.001 : -0.0001,
       renderer: graphType,
       series: series,
       interpolation:'linear'
     });
     
     //Format the x & y axes
     if(dataType == "timestamp"){
       var xAxis = new Rickshaw.Graph.Axis.X({
         graph: graph,
         pixelsPerTick: 50,
         tickFormat: formatTime
       });
       xAxis.render();
     }else{
       var xAxis = new Rickshaw.Graph.Axis.X({
         graph: graph,
       });
       xAxis.render();
     }
     yAxis = new Rickshaw.Graph.Axis.Y({
       graph: graph
     });
     yAxis.render();

     //Add hover details to the graph
     addDetailedHover(graph);
    
    //Add a range slider
    var preview = new Rickshaw.Graph.RangeSlider.Preview({
      graph: graph,
      element: document.getElementById(rangeHolderId)
    });

    //Set the window of the range slider
    var windowSize = $("#window-size")[0].value;
    graph.window.xMin = series[0].data.length < windowSize ? 0 : series[0].data.length - windowSize;
    graph.window.rangeSlider = preview;
    
    //Display the graph
    graph.render();
     
    return graph;
   }

   this.initColorPalette = function(){
     palette = new Rickshaw.Color.Palette({"scheme": scheme});
   }

   this.weakColorCode = "#E0E0E0";

   function addDetailedHover(graph){
     new Rickshaw.Graph.HoverDetail({
       graph: graph,
       formatter: function(series, x, y){
         var allSeries = this.graph.series;
         var swatch, content = "";
         for(var i=0; i<allSeries.length; i++){
          if(allSeries[i].color != "#E0E0E0" || allSeries[i].name == series.name){
            swatch = "<span class='detail_swatch' style='background-color: " + allSeries[i].color + "'></span>";
            content += swatch + allSeries[i].name + ": (x,y) = ("+allSeries[i].data[x].x+","+parseFloat(allSeries[i].data[x].y).toFixed(2)+")<br/>";
          }
         }

         return content;
       }
     });
   }                                                      

  function formatTime(n){
    var map = {
      "000": "12 AM",
      "100": '1 AM',
      "200": '2 AM',
      "300": '3 AM',
      "400": '4 AM',
      "500": '5 AM',
      "600": '6 AM',
      "700": '7 AM',
      "800": '8 AM',
      "900": '9 AM',
      "1000": '10 AM',
      "1100": '11 AM',
      "1200": '12 PM',
      "1300": '1 PM',
      "1400": '2 PM',
      "1500": '3 PM',
      "1600": '4 PM',
      "1700": '5 PM',
      "1800": '6 PM',
      "1900": '7 PM',
      "2000": '8 PM',
      "2100": '9 PM',
      "2200": '10 PM',
      "2300": '11 PM',
     }

     return map[n];
   } 

   var palette = new Rickshaw.Color.Palette({"scheme":"colorwheel"});
   var scheme = "colorwheel";
}

var GraphUtil = new graphUtil();
