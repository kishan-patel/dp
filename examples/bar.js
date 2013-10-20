var noTrials = 0;

var barInit = function (fileString){

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0,width], .1);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var svg = d3.select("#barchart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var t = parseFileString(fileString); 
  x.domain(t.map(function(d) { return d.arm; }));
  y.domain([0, noTrials]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Result");

  svg.selectAll(".bar")
      .data(t)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.arm); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.result); })
      .attr("height", function(d) { return height - y(d.result); });
}

function parseFileString(fileString){
  var arrayOfLines = fileString.match(/[^\r\n]+/g)
  var data = []
  var contains = false;
  var pos = 0;
  var tokens = [];
   
  noTrials = arrayOfLines.length;

  for (var i=0; i<arrayOfLines.length; i++){
    contains = false;
    pos = 0;
    tokens = arrayOfLines[i].split(",");
       
    for (var j=0; j<data.length; j++){
      if(data[j].arm == parseInt(tokens[0])){
        contains = true;
        pos = j;
        break;
      }
    }

    if (contains){
      data[pos].result += parseInt(tokens[1]);
    }else{
      data.push({"arm":parseInt(tokens[0]), "result":parseInt(tokens[1])});
    }                  
  }

  return data;
}

function type(d) {
  d.result = +d.result;
  return d;
}

