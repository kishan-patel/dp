'use strict';

/* Controllers */
//!!!!!!!!!!THESE GLOBAL VARIABLES HAVE TO BE REMOVED!!!!!!!!!!!!!  
var armToGraph = [];
var fileData; //Will hold the original data (i.e. as read from the file)
var functionApplied;
var armColor = [];
var maxUCBScore = 0;
var noArms = 0;
var steps = 0;
var palette = new Rickshaw.Color.Palette();

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
          noArms = dataObj.arms;
          steps = dataObj.steps;
          armToGraph = [];
          armColor = [];
          //!!!!!!!!! WE HAVE TO FIX THIS!!!!!!!!!!!!!
          /*if(type == 'timestamp'){
              return;
          }*/
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
            var filterString = type == 'timestamp' ? '' :
              '<div class="well well-sm">'+
                    '<div style="float:left"><b>Filters:</b>&nbsp&nbsp</div>'+
                    '<div>'+
                      'Show active&nbsp'+
                      '<input id="active-only-'+data[key].name+'" type="checkbox" ng-model="activeOnly'+data[key].name+'"'+
                        'ng-click="updateLine('+data[key].name+')">&nbsp&nbsp'+
                      '</input>'+
                      'Agent&nbsp'+
                      '<select id="simulator-'+data[key].name+'" ng-model="functionToApply'+data[key].name+'"'+
                        'ng-change="updateLine('+data[key].name+')">'+
                          '<option vlaue=""></option>'+
                          '<option value="UCB">UCB</option>'+
                      '</select>'+
                    '</div>'+
                  '</div>'; 
            plotString = 
              '<br/><br/>'+
              '<div id="panel_'+data[key].name+'"class=\"panel panel-default\">'+
                '<div class=\"panel-heading\">Line Plot - Arm '+data[key].name+'</div>'+
                '<div class=\"panel-body\">'+
                  filterString + 
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
              max: type != "timestamp" ? 1.2 : 0,
              min: type!= "timestamp" ? -0.1 : -0.0001,
              renderer: 'line',                                                      
              series: singleArmData,
              interpolation: 'linear' 
            });                                                                      
            scope.addGraph({arm: data[key].name}, {graph: graph});
            scope.$apply();
            //graph.render();
             
            //Graph extensions                                                       
            if(type == 'timestamp'){
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
            Hover =  GraphUtil.initialseHover(graph);                         
            hover = new Hover({                                               
              graph: graph                                                        
            });
            graph.render();
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
        var activeOnly = document.getElementById('active-only-'+arm).checked;
        var simulatorSelect = document.getElementById('simulator-'+arm);
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
          var ucbSeries = UCB1();

          for(var i = 0; i<ucbSeries.length; i++){
            newSeries.push(ucbSeries[i]);
          }
          for(var i=0; i<fileData.length; i++){
            if(fileData[i].name != arm)
              newSeries.push(fileData[i]); 
          }
          
          active = graph.series.active
          graph.series = newSeries;
          graph.series.active = active
        }
        
        graph.render();
    }
}

function UCB1(){
  var ucbHistory = [];
  var data;
  var wins=0, timesPlayed=0, score=0;
  var totals = [];
  var played = [];
  var p = 0;
  var ucbData = [], series = [];

  for(var i=0; i<steps; i++){
    timesPlayed++;
    if(played.length<noArms){
      p = i;
      played[p] = 1;
    }else{
      var maxScore = 0;
      var score = 0;
      var xBar;
      var bound;
      for(var j=0; j<noArms; j++){
        xBar  = totals[j]/played[j];
        bound = Math.sqrt((2*Math.log(timesPlayed))/played[j]);
        score = xBar + bound;
        if(score > maxScore){
          maxScore = score;
          p = j
        }
      }
      played[p]++;
    }

    //Update the rewards for a particular arm
    data = $.grep(fileData, function(e){ return e.name == p+1+""})[0].data;
    if(data[i].win == "1"){
      wins++;
      totals[p]++;
    }else{
      if(i<noArms)
        totals[p] = 0;
    }

    //Add the score for the current time step
    ucbData.push({x:i,y:wins/timesPlayed});
  }

  series.push({name:"UCB", color:palette.color(), data:ucbData});
  return series;
}

