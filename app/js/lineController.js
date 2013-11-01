'use strict';

/* Controllers */

angular.module('lineController', [])
.directive('fdLine', function () {
  return {
    restrict: 'E',
    template: 
      '<input type=\"file\"/ id=\"file\">' +
      '<div id="line_chart_container"></div>',
    link: function (scope, element, attrs) {
      $('#file').change(function (evt) {
        FR.readFile(evt, 'line', function (fileString) {
          var data = DataUtil.getLineData(fileString);
          var palette = new Rickshaw.Color.Palette();
          var singleArmData = [];
          var yAxisId, chartId, legendId, graph, xAxis, yAxis, Hover, hover;

          for (var obj in data) {
            data[obj].color = '#30c020';
          }

          for(var key in data){
            yAxisId = 'y_axis_' + key;
            chartId = 'chart_' + key;
            legendId = 'legend_' + key;
            singleArmData = [];
            singleArmData.push(data[key]);
            
            $('<br/><br/><div><div id=\"'+yAxisId+'\"></div>' + 
              '<div id=\"'+chartId+'\"></div>' +
              '<div id=\"'+legendId+'\"></div></div>')
             .appendTo('#line_chart_container');
            
            //Intialise graph and render it                                          
            graph = new Rickshaw.Graph({                                         
              element: document.getElementById(chartId),                             
              min: -0.1,                                                             
              max: 1.1,                                                              
              width: 800,
              height: 500,
              renderer: 'line',                                                      
              series: singleArmData 
            });                                                                      
            graph.render();
            
            //Graph extensions                                                       
            xAxis = new Rickshaw.Graph.Axis.Time({                               
              graph: graph                                                           
            });                                                                      
            xAxis.render();                                                          
                                                                                   
            yAxis = new Rickshaw.Graph.Axis.Y({                                  
              graph: graph                                                           
            });                                                                      
            yAxis.render();                                                          
                                                                                   
            Hover =  GraphUtil.initialseHover(graph);                         
            hover = new Hover({                                               
              graph: graph                                                        
            });
          }
        })
      });
    },
  }
});
