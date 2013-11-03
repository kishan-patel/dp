'use strict';

/* Controllers */
var armToGraph = [];

var lineControllers = angular.module('lineController', [])
.directive('fdLine', function ($compile) {
  return {
    controller: 'LineFltrCtrl',
    restrict: 'E',
    scope: {updateLine: '&', addGraph: '&'},
    template: 
      //'<div class=\"jumbotron\">'+
      '<div id="line_chart_container"></div>',
      //'</div>',
    link: function (scope, element, attrs) {
      $('#file_upload').change(function (evt) {
        FR.readFile(evt, 'line', function (fileString) {
          var data = DataUtil.getLineData(fileString);
          var palette = new Rickshaw.Color.Palette();
          var singleArmData = [];
          var yAxisId, chartId, legendId, plotString, plotStringCompiled, graph, xAxis, yAxis, Hover, hover;

          $('#line_chart_container').empty();

          for (var obj in data) {
            data[obj].color = '#30c020';
          }

          for(var key in data){
            //Each graph will have a an id based on it's name
            yAxisId = 'y_axis_' + data[key].name;
            chartId = 'chart_' + data[key].name;
            legendId = 'legend_' + data[key].name;
            singleArmData = [];
            singleArmData.push(data[key]);

            //Dynamically add html code to the dom
            plotString = 
              '<br/><br/>'+
              '<div id="panel_'+data[key].name+'"class=\"panel panel-default\">'+
                '<div class=\"panel-heading\">Line Plot - Arm '+data[key].name+'</div>'+
                '<table class=\"table\">'+
                  '<tr>'+
                    '<th>Filters: </th>'+
                  '</tr>'+
                  '<tr>'+
                    '<td>'+
                      '<div ng-controller="LineFltrCtrl">'+
                      '<form role=\"form\" id="line-plot-arm-'+data[key].name+'">'+
                        '<div class=\"checkbox\">'+
                          '<label><input type=\"checkbox\" ng-model="activeOnly">show active</label>'+
                        '</div>'+
                        '<button type=\"submit\" class=\"btn btn-default btn-xs\"'+ 
                             'ng-click="updateLine(activeOnly,'+data[key].name+')">Submit</button>'+
                      '</form>'+
                    '</td>'+
                  '</tr>'+
                '</table>'+
                '<div class=\"panel-body\">'+
                  '<div><div id=\"'+yAxisId+'\"></div>' +
                  '<div id=\"'+chartId+'\"></div>' +
                  '<div id=\"'+legendId+'\"></div>'+
                '</div>'+
              '</div>';
            plotStringCompiled = $compile(plotString)(scope);
            $('#line_chart_container').append(plotStringCompiled);
            
            //Intialise graph and render it                                          
            graph = new Rickshaw.Graph({                                         
              element: document.getElementById(chartId),                             
              min: -0.1,                                                             
              max: 1.1,                                                              
              renderer: 'line',                                                      
              series: singleArmData,
              interpolation: 'linear' 
            });                                                                      
            scope.addGraph({arm: data[key].name}, {graph: graph});
            scope.$apply();
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
            /*Hover =  GraphUtil.initialseHover(graph);                         
            hover = new Hover({                                               
              graph: graph                                                        
            });*/
          }
        })
      });
    },
  }
});


function LineFltrCtrl($scope){

    $scope.addGraph = function(arm, graph){
      armToGraph.push({"arm":arm.arm, "graph":graph.graph});
    }

    $scope.updateLine = function(activeOnly, arm){
        var graph, series, data, newSeries=[], tmpData = [], prevPlayed, active; 
            
        graph = $.grep(armToGraph, function(e){
          return e.arm == arm;
        })[0].graph;
        series = graph.series;
        if(activeOnly){
            data = series[0].data
            for(var i=0; i<data.length; i++){
              if(i==0){
                prevPlayed = data[i].played;
              }

              if(prevPlayed != data[i].played){
                tmpData.push(data[i]);
                if(prevPlayed){
                  newSeries.push({color: '#30c020', name: 'a', data: tmpData});
                }else{
                  newSeries.push({color: '#c05020', name: 'ia', data: tmpData});
                }
                tmpData = [];
              }

              tmpData.push(data[i]);
              prevPlayed = data[i].played;

              if(i==data.length-1){
                if(data[i].played){
                  newSeries.push({color: '#30c020', name: 'a', data: tmpData});
                }else{
                  newSeries.push({color: '#c05020', name: 'ia', data: tmpData});
                }
              }
            }

            active = graph.series.active;
            graph.series = newSeries; 
            graph.series.active = active
            graph.render();
        }else{

        }
    }
}
