function graphUtil() {                                              
   this.createGraph = function(graphType, series, dataType, graphId, legendId, rangeHolderId,max){
     //Determine what the max score is for the graph height.
     var max = 1;
     debugger;
     for(var i=0; i<series.length; i++){
       for(var j=0; j<series[i].data.length; j++){
         if(series[i].data[j].y > max)
           max = series[i].data[j].y; 
       }
     }

     //Set the color for each arm
     var palette = new Rickshaw.Color.Palette();
     for(var i=0; i<series.length; i++){
       series[i].color = palette.color();
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
     
     //Extensions of the graph
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

     Hover = initialiseHover(graph, legendId);
     hover = new Hover({
         graph: graph
     });
    
     if(graphType == "line"){ 
       var preview = new Rickshaw.Graph.RangeSlider.Preview({
         graph: graph,
         element: document.getElementById(rangeHolderId)
       });
     }

     graph.render();
   }

   function initialiseHover (graph, legendId){                                       
    var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {             
      legendId: legendId,
      /*xFormatter: function (x) {                                                
        return x + "seconds"                                                    
      },*/                                                                           
      render: function (args) {                                                    
        var legend = $('#'+this.legendId)[0];//+args.detail[0].name)[0];
        legend.innerHTML = args.domainX + " s";                                    
                                                                                   
        args.detail.sort(function (a, b) {                                         
          return a.order - b.order                                                 
        }).forEach(function (d) {                                                  
          var line = document.createElement('div');                                
          line.className = 'line';                                                 
                                                                                   
          var swatch = document.createElement('div');                              
          swatch.className = 'swatch';                                             
          swatch.style.backgroundColor = d.series.color;                           
                                                                                   
          var label = document.createElement('div');                               
          label.className = 'label';                                               
          label.innerHTML = d.name + ": " + d.formattedYValue;                     
                                                                                   
          line.appendChild(swatch);                                                
          line.appendChild(label);                                                 
                                                                                   
          legend.appendChild(line);                                                
                                                                                   
          var dot = document.createElement('div');                                 
          dot.className = 'dot';                                                   
          dot.style.top = graph.y(d.value.y0 + d.value.y) + 'px';                  
          dot.style.borderColor = d.series.color;                                  
                                                                                   
          this.element.appendChild(dot);                                           
                                                                                   
          dot.className = 'dot active';                                            
                                                                                   
          this.show();                                                             
                                                                                   
        }, this);                                                                  
      }                                                                            
    });                                                                            
    return Hover;
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
}

var GraphUtil = new graphUtil();
