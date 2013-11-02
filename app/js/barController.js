'use strict';

/* Controllers */

angular.module('barController', [])
.directive('fdBar', function () {
  return {
    restrict: 'E',
    template: 
      '<br/><br/>'+
      '<div id="bar_plot_container"></div>',
    link: function (scope, element, attrs) {
      $('#file_upload').change(function (evt) {
        FR.readFile(evt, 'bar', function (fileString){
          var data = DataUtil.getBarData(fileString);
          var palette = new Rickshaw.Color.Palette();
          
          $('#bar_plot_container').empty();

          for (var obj in data) {
            data[obj].color = palette.color();
          }

          $('<div class="panel panel-default">'+
              '<div class="panel-heading">Bar Plot - All Arms</div>'+
              '<div class="panel-body">'+
                '<div id="bar_plot"></div>'+
              '</div>'+
            '</div>').appendTo('#bar_plot_container');

          //Initialise graph and render it
          var graph = new Rickshaw.Graph({
            element: document.getElementById('bar_plot'),
            max: 1.1,
            min: -0.1,
            renderer: 'bar',
            series: data
          });
          graph.render();
          
          //Add extensions
          var xAxis = new Rickshaw.Graph.Axis.Time({
            graph: graph
          });
          xAxis.render();

          var yAxis = new Rickshaw.Graph.Axis.Y({
            graph: graph
          }); 
          yAxis.render();
          
          /*var Hover = GraphUtil.initialseHover(graph)
          var hover = new Hover({
            graph: graph
          });*/
          
        })
      });
    },
  }
});
