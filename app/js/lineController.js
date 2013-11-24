'use strict';

/* Controllers */
//!!!!!!!!!!THESE GLOBAL VARIABLES HAVE TO BE REMOVED!!!!!!!!!!!!!  
var armToGraph = [];
var fileData; //Will hold the original data (i.e. as read from the file)
var functionApplied;
var armColor = [];

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
          var dataObj = DataUtil.getLineData(fileString);
          var data = dataObj.data;
          var type = dataObj.type;
          fileData = data;
          
          //!!!!!!!!! WE HAVE TO FIX THIS!!!!!!!!!!!!!
          if(type == 'timestamp'){
              return;
          }
          var palette = new Rickshaw.Color.Palette();
          var singleArmData = [];
          var yAxisId, chartId, legendId, plotString, plotStringCompiled, graph, xAxis, yAxis, Hover, hover;

          $('#line_chart_container').empty();

          /*for (var obj in data) {
            data[obj].color = '#30c020';
          }*/

          for (var obj in data) {
            data[obj].color = palette.color();
            armColor.push({"arm": data[obj].name, "color": data[obj].color});
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
                /*'<table class=\"table\">'+
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
                        '<div>'+
                          '<select ng-model="functionToApply">'+
                            '<option value="">Select function to apply</option>'+
                            '<option value="UCB 1">UCB 1</option>'+
                          '</select>'+
                        '</div><br/>'+
                        '<button type=\"submit\" class=\"btn btn-default btn-xs\"'+ 
                             'ng-click="updateLine(activeOnly,'+data[key].name+', functionToApply)">Apply</button>'+
                      '</form>'+
                      '</div>'+
                    '</td>'+
                  '</tr>'+
                '</table>'+*/
                '<div class=\"panel-body\">'+
                  '<div class="well well-sm">'+
                    '<div style="float:left"><b>Filters:</b>&nbsp&nbsp</div>'+
                    '<div>'+
                      'Show active&nbsp'+
                      '<input id="active-only" type="checkbox" ng-model="activeOnly"'+
                        'ng-click="updateLine('+data[key].name+')">&nbsp&nbsp'+
                      '</input>'+
                      'Simulator&nbsp'+
                      '<select id="simulator" ng-model="functionToApply"'+
                        'ng-change="updateLine('+data[key].name+')">'+
                          '<option vlaue=""></option>'+
                          '<option value="UCB">UCB</option>'+
                      '</select>'+
                    '</div>'+
                  '</div>'+
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
              //max: 1.1,                                                              
              renderer: 'line',                                                      
              series: singleArmData,
              interpolation: 'linear' 
            });                                                                      
            scope.addGraph({arm: data[key].name}, {graph: graph});
            scope.$apply();
            graph.render();
             
            //Graph extensions                                                       
            if(data.type == 'timestamp'){
              var xAxis = new Rickshaw.Graph.Axis.X({
                graph: graph,
                pixelsPerTick: 50,
                tickFormat: GraphUtil.formatTime
              });
              xAxis.render();
            }else{
              var xAxis = new Rickshaw.Graph.Axis.Time({
                graph: graph
              });
              xAxis.render();
            }

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

var getColor = function(time){
  var activeArm = $.grep(fileData, function(e){
          return $.grep(e.data, function(e){
              return e.x==time && e.played==true;
          })[0];
      })[0];
}
function LineFltrCtrl($scope){

    $scope.addGraph = function(arm, graph){
      armToGraph.push({"arm":arm.arm, "graph":graph.graph});
    }

    $scope.updateLine = function(arm){
        var activeOnly = document.getElementById('active-only').checked;
        var simulatorSelect = document.getElementById('simulator');
        var functionToApply = simulatorSelect[simulatorSelect.selectedIndex].text;
        var graph, series, data, newSeries=[], tmpData = [], prevPlayed, active; 
            
        graph = $.grep(armToGraph, function(e){
          return e.arm == arm;
        })[0].graph;
        series = graph.series;

        if(activeOnly){
          data = $.grep(fileData, function(e){
            return e.name == arm;
          })[0].data;

          for(var i=0; i<data.length; i++){
            if(i==0){
              prevPlayed = data[i].played;
            }

            if(prevPlayed != data[i].played){
              tmpData.push(data[i]);
              newSeries.push({
                color: $.grep(armColor, function(e){ return e.arm == data[i-1].armPlayed;})[0].color,
                name: data[i-1].armPlayed,
                data: tmpData
              });
              tmpData = [];
            }

            tmpData.push(data[i]);
            prevPlayed = data[i].played;

            if(i==data.length-1){
              newSeries.push({
                color: $.grep(armColor, function(e){ return e.arm == data[i-1].armPlayed;})[0].color,
                name: data[i-1].armPlayed,
                data: tmpData
               });
            }
          }

          active = graph.series.active;
          graph.series = newSeries; 
          graph.series.active = active;
        }

       if(!activeOnly){
         data = $.grep(fileData, function(e){
           return e.name == arm;
         })[0].data;
         newSeries.push({
           color: $.grep(armColor, function(e){ return e.arm == arm;})[0].color, 
           name: arm,
           data: data
         })
         active = graph.series.active;
         graph.series = newSeries;
         graph.series.active = active;
        }

        if(functionToApply === "UCB"){
          var ucbSeries = applyUCB();

          for(var i = 0; i<ucbSeries.length; i++){
            newSeries.push(ucbSeries[i]);
          }
          
          active = graph.series.active
          graph.series = newSeries;
          graph.series.active = active
        }
        
        graph.render();
    }
}

function applyUCB(){
  var series = [];
  var data = [];
  var ucbData = [];
  var wins, timesPlayed, score, prevScore;

  for(var i=0; i<fileData.length; i++){
    data = fileData[i].data
    score = 0;
    prevScore = 0;
    ucbData = [];
    wins = 0;
    timesPlayed = 0;
    for(var j=0; j<data.length; j++){
      if(data[j].played == true){
        timesPlayed++;
        if(data[j].win == "1"){
          wins++;
        }
      }

      if(data[j].played == true){
        score = wins/timesPlayed + Math.sqrt((2*Math.log(j+1))/timesPlayed);
        prevScore = score;
      }else{
        score = prevScore;
      }
      
      ucbData.push({x:j, y:score});
    }
    
    series.push({name:fileData[i].name+'-UCB', color: fileData[i].color, data: ucbData});
  }

  return series;
}
