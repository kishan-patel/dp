(function (GraphUtil, undefined) {                                              
                                                                                
  GraphUtil.initialseHover = function(graph){                                       
    var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {             
      xFormatter: function (x) {                                                
        return x + "seconds"                                                    
      },                                                                           
      render: function (args) {                                                    
        var legend = $("#legend_1")[0];//+args.detail[0].name)[0];
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
}(window.GraphUtil = window.GraphUtil || {}));
