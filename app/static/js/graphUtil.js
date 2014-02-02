(function (GraphUtil, undefined) {                                              
                                                                                
  GraphUtil.initialiseHover = function(graph, legendId){                                       
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

  GraphUtil.formatTime = function(n){
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

   GraphUtil.createGraph = function(graphType, data, dataType, graphId, legendId){
     var graph = new Rickshaw.Graph({
       element: document.getElementById(graphId),
       max: dataType != "timestamp" ? 1.2 : 0,
       min: dataType != "timestamp" ? -0.1 : -0.0001,
       renderer: graphType,
       series: data,
       interpolation:'linear'
     });
     
     //Extensions of the graph
     if(dataType == "timestamp"){
       var xAxis = new Rickshaw.Graph.Axis.X({
         graph: graph,
         pixelsPerTick: 50,
         tickFormat: GraphUtil.formatTime
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

     Hover = GraphUtil.initialiseHover(graph, legendId);
     hover = new Hover({
         graph: graph
     });
     return graph;
   }
}(window.GraphUtil = window.GraphUtil || {}));
