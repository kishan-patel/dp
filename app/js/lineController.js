'use strict';

/* Controllers */

angular.module('lineController', [])
.directive('fdLine', function () {
  return {
    restrict: 'E',
    template: '<input type=\"file\"/ id=\"file\">' +
      '<br/><br/><div id=\"chart_container\">' +
      '<div id=\"y_axis\"></div>' +
      '<div id=\"chart\"></div>' +
      '<br/></br><div id=\"legend\"></div>' +
      '</div>',
    link: function (scope, element, attrs) {
      $('#file').change(function (evt) {
        FR.readFile(evt, 'line', function (data) {
          var palette = new Rickshaw.Color.Palette();
          
          for (var obj in data) {
            data[obj].color = palette.color();
          }

          //Intialise graph and render it
          var graph = new Rickshaw.Graph({
            element: document.getElementById("chart"),
            min: -0.1,
            max: 1.1,
            renderer: 'line',
            series: data
          });
          graph.render();
          
          //Graph extensions
          var xAxis = new Rickshaw.Graph.Axis.Time({
            graph: graph
          });
          xAxis.render();

          var yAxis = new Rickshaw.Graph.Axis.Y({
            graph: graph
          });
          yAxis.render();
          
          var Hover =  GraphUtil.initialseHover(graph);
          var hover = new Hover({
            graph: graph
          });
        })
      });
    },
  }
});
