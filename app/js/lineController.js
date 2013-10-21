'use strict';

/* Controllers */

angular.module('lineController', [])
  .directive('fdLine', function () {
    return {
      restrict: 'E',
      template: '<input type=\"file\"/ id=\"file\">' +
        '<div id=\"chart_container\">' +
        '<div id=\"chart\"></div>' +
        '<div id=\"legend\"></div>' +
        '</div>',
      link: function (scope, element, attrs) {
        $('#file').change(function (evt) {
          FR.readFile(evt, function (data) {
            var palette = new Rickshaw.Color.Palette();

            for (var obj in data) {
              data[obj].color = palette.color();
            }

            // instantiate our graph!

            var graph = new Rickshaw.Graph({
              element: document.getElementById("chart"),
              width: 960,
              height: 500,
              renderer: 'line',
              series: data

            });

            graph.render();
            var legend = document.querySelector('#legend');

            var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
              xFormatter: function (x) {
                return x + "seconds"
              },
              render: function (args) {

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

            var hover = new Hover({
              graph: graph
            });
          })
        });
      },
    }
  });
