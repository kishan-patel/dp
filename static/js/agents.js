function agents(){
  this.runSim = function(type, steps, noArms, data, color){
    switch(type){
      case "UCB1":
        return this.UCB1(steps, noArms, data, color);
      case "e-greedy":
        return this.eGreedy(steps, noArms, data, color);
      case "random":
        return this.random(steps, noArms, data, color);
      default:
        return;
    }
  }
  this.UCB1df = function(steps, data){
    var arms = [];
    for(var i=0; i<data.length; i++){
      arms.push(i+1);
    }
    var ucbData = [], totalTimesPlayed=0, xBar, bound, score, maxScore, positionOfMaxScore, overallMaxScore=0;

    for(var i=0; i<data.length; i++){
      ucbData.push({"alternative":arms[i], "rewards":0, "times_played":0, "data":[]});
    }

    for(var i=0; i<steps; i++){
      totalTimesPlayed++;  
      maxScore = 0;
      score = 0;
      positionOfMaxScore = 0;
      
      //Find the max ucb score, that's the arm we're going to pick.
      for(var j=0; j<data.length; j++){
        //ucbData[j]["rewards"] += data[j][i]["reward"];
        xBar = (ucbData[j]["rewards"]+data[j][i]["reward"])/(ucbData[j]["times_played"]+1);
        bound = 2*Math.sqrt(Math.log(totalTimesPlayed)/(ucbData[j]["times_played"]+1));
        score = xBar + bound;
        if(score > maxScore){
          maxScore = score;
          if(maxScore > overallMaxScore){
            overallMaxScore = score;
          }
          positionOfMaxScore = j;
        }
      }

      //Update the rewards of the arm that was picked.
      ucbData[positionOfMaxScore]["rewards"] += data[positionOfMaxScore][i]["reward"];
      ucbData[positionOfMaxScore]["times_played"]++;

      //update the ucb score of all of the arms.
      for(var j=0; j<data.length; j++){
        xBar = ucbData[j]["rewards"]/(ucbData[j]["times_played"]+1);
        bound = 2*Math.sqrt(Math.log(totalTimesPlayed)/(ucbData[j]["times_played"]+1));
        score = xBar + bound;
        ucbData[j]["data"].push({"x":i, "y":score});  
      }
    }

    return {"data":ucbData, "overall_max_score":overallMaxScore};
  },
  this.UCB1= function(steps, noArms, series, color){
    var currChoice = 0;
    var timesPlayed = 0;
    var totalWins = 0;
    var played = [];
    var wins = [];
    var simData = {};
    var data = [];
    var overallMaxScore = 0;

    for(var j=0; j<noArms; j++){
      simData[j] = [];
    }
    for(var i=0; i<steps; i++){
      timesPlayed++; 
      if(played.length < noArms){
        currChoice = i;
        played[currChoice] = 1;
      }else{
        var score = 0;
        var maxScore = 0;
        var xBar, bound;

        for(var j=0; j<noArms; j++){
          //xBar = totalWins/played[j];
          xBar = wins[j]/played[j];
          bound = Math.sqrt((2*Math.log(timesPlayed))/played[j]);
          score = xBar + bound

          if(score > maxScore){
            if(overallMaxScore < score){
              overallMaxScore = score;
            }
            maxScore = score;
            currChoice = j;
          }

          simData[j].push({x:i, y:score});
        }
      }

      played[currChoice]++;
      data = $.grep(series, function(e){ return e.name == currChoice+1+""})[0].data;
      if(i<noArms){
        wins[currChoice] = 0;
        for(j=0; j<noArms.length; j++){
          if(j=i){
            simData[j].push({x:i, y:data[i].win});
          }else{
            simData[j].push({x:i, y:0});
          }
        }
      }
      if(data[i].win == "1"){
        totalWins++;
        wins[currChoice]++;
      }
      //simData.push({x:i, y:totalWins/timesPlayed});
    }
    simData["overall_max_score"]=overallMaxScore;
    return simData;
    //return {"name": "UCB1", "color":color, "data":simData};
  }

  this.eGreedy = function(steps, noArms, series, color){
    var currChoice = "";
    var timesPlayed = 0;
    var totalWins = 0;
    var noTimesBestPicked = 0;
    var EG_CONST = 0.1;
    var score = 0;
    var played = [];
    var wins = [];
    var data = [];
    var simData = [];  
    var maxScore = 0;
    var overallMaxScore = 0;

    for(var j=0; j<noArms; j++){
      simData[j] = [];
    }

    for(var i=0; i<steps; i++){
      timesPlayed++;
      if(played.length < noArms){
        currChoice = i;
        played[currChoice] = 1;
      }else{
        if(noTimesBestPicked/timesPlayed <  EG_CONST){
          noTimesBestPicked++;
          score = 0;
          for(var j=0; j<noArms; j++){
            if(wins[j] > score){
              if(score > overallMaxScore){
                overallMaxScore = score;
              }
              score[j] = wins[j];
              currChoice = j;
            }
          }
        }else{
          currChoice = Math.floor(Math.random() * noArms);
        }
        for(var j=0; j<noArms; j++){
          simData[j].push({x:i, y:wins[currChoice]/played[currChoice]});
        }
      }

      played[currChoice]++;
      data = $.grep(series, function(e){return e.name == currChoice+1+""})[0].data;
      if(i<noArms){
        wins[currChoice] = 0;
        for(var j=0; j<noArms; j++){
          if(j==i){
            simData[j].push({x:i, y:data[i].win});
          }else{
            simData[j].push({x:i, y:0});
          }
        }
      }
      if(data[i].win == "1"){
        totalWins++;
        wins[currChoice]++;
      }
      //simData.push({x:i, y:totalWins/timesPlayed});
    }

    simData["overall_max_score"]=overallMaxScore;
    return simData;
    //return {"name": "e-greedy", "color":color, "data":simData};
  }

  this.random = function(steps, noArms, series, color){
    var currChoice = "";
    var timesPlayed = 0;
    var totalWins = 0;
    var played = [];
    var wins = [];
    var data = [];
    var simData = [];

    for(var i=0; i<steps; i++){
      timesPlayed++;
      if(played.length < noArms){
        currChoice = i
        played[currChoice] = 1;
      }else{
        currChoice = Math.floor(Math.random()*noArms);
      }

      played[currChoice]++;
      data = $.grep(series, function(e){return e.name == currChoice+1+""})[0].data;
      if(i<noArms){
        wins[currChoice] = 0;
      }
      if(data[i].win == "1"){
        totalWins++;
        wins[currChoice]++;  
      }
      simData.push({x:i, y:totalWins/timesPlayed});
    }

    return {"name": "random", "color":color, "data":simData};
  }
}
