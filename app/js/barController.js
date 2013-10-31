'use strict';

/* Controllers */

angular.module('barController', [])
.directive('fdBar', function () {
  return {
    restrict: 'E',
    template: '<input type=\"file\"/ id=\"file\"><br/>' +
      '<div id=\"chart\"></div>' +
      '<div id=\"legend\"></div>' +
      '</div>',
    link: function (scope, element, attrs) {
      $('#file').change(function (evt) {
        FR.readFile(evt, "bar", function (data) {
          var palette = new Rickshaw.Color.Palette();

          for (var obj in data) {
            data[obj].color = palette.color();
          }

          //Initialise graph and render it
          var graph = new Rickshaw.Graph({
            element: document.getElementById("chart"),
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
          
          var Hover = GraphUtil.initialseHover(graph)
          var hover = new Hover({
            graph: graph
          });
          
        })
      });
    },
  }
});
