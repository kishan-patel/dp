model.fu = function(){
	this.lineSeries = [];
	
	this.barSeries = [];
	
	this.graphs = [];
	
	this.chartType = "line";

	this.armsToDisplay = [];

	this.agentType = "means";


	this.setGraphSeries(lineSeries, barSeries){

	}

	this.updateSeries(){

	}
}

var models = {
	"fileUpload": function(){
			var lineSeries = [];
			var barSeries = [];
			var graphType = "line";
			var armsToDisplay = [];
			var agentType = "";

			function getLineSeries(){
				var tmpSeries = {};
				tmpSeries["means"] = [];

				for(var i=0; i<this.lineSeries.length; i++){
          if(armsToDisplay.indexOf(this.lineSeries[i].name) == -1){
            continue;
          }

          if(agentType == "means"){
            tmpSeries["means"].push(this.lineSeries[i]);
          }else if(agentType == "ucb1_score_and_mean_values"){
            tmpSeries[i] = [];
            
            //Push the mean value series for the present arm.
            tmpSeries[i].push(this.lineSeries[i]);

            //Calculate the ucb1 scores for the the present arm.
            var agentData = agnts.getScores(agentType, this.lineSeries[i].data);  
            tmpSeries[i].push({
              "name": this.lineSeries[i].name + " (UCB1)",
              "data": agentData
            });

            //Push the other means as well but their color will be weak.
            for(var j=0; j<this.lineSeries.length; j++){
              if(i != j){
                tmpSeries[i].push({
                  name: this.lineSeries[j].name,
                  data: this.lineSeries[j].data,
                  color: weakColorCode
                });
              }           
            }
          }else if(agentType == "ucb1_scores_and_mean_value"){
            tmpSeries[i] = [];
            
            //Push the mean value series for the present arm.
            tmpSeries[i].push(this.lineSeries[i]);

            //Calculate the ucb1 scores for the the present arm.
            var agentData = agnts.getScores(agentType, this.lineSeries[i].data);  
            tmpSeries[i].push({
              "name": this.lineSeries[i].name + " (UCB1)",
              "data": agentData
            });

            //Push the other ucb1 scores for the other arms as well.
            for(var j=0; j<this.lineSeries.length; j++){
              if(i != j){
                agentData = agnts.getScores(agentType, this.lineSeries[j].data);  
                tmpSeries[i].push({
                  "name": this.lineSeries[j].name + " (UCB1)",
                  "data": agentData,
                  "color": weakColorCode
                });
              }           
            }
          }
        }

        return tmpSeries;
			}

			function getBarSeries(){
				agentType = "barInfo";
        for(var i=0; i<this.barSeries.length; i++){
          if(armsToDisplay.indexOf(this.barSeries[i].name) == -1){
           continue;
          }
          tmpSeries["means"].push(this.barSeries[i]);
        }
			}

			this.setGraphSeries = function(){

			}

			this.setGraphType = function(gType){
				graphType = gType;
			}

			this.setArmsToDisplay = function(aToD){
				armsToDispaly = aToD;
			}

			this.setAgentType = function(aType){
				agentType = aType;
			}

			this.getGraphSeries = function(){
				var tmpSeries = {};
				tmpSeries["means"] = [];

				//Create the graph series based on the filters that are selected
				if(this.graphType == "line"){
					for(var i=0; i<this.lineSeries.length; i++)
				}
			}
	},

	"simulator": function(){

	},

	"liveStream": function(){

	}
}