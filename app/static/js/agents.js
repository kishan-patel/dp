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

  this.UCB1 = function(steps, noArms, series, color){
    var currChoice = 0;
    var timesPlayed = 0;
    var totalWins = 0;
    var played = [];
    var wins = [];
    var simData = [];
    var data = [];

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
          xBar = wins[j]/played[j];
          bound = Math.sqrt((2*Math.log(timesPlayed))/played[j]);
          score = xBar + bound

          if(score > maxScore){
            maxScore = score;
            currChoice = j;
          }
        }
      }

      played[currChoice]++;
      data = $.grep(series, function(e){ return e.name == currChoice+1+""})[0].data;
      if(i<noArms){
        wins[currChoice] = 0;
      }
      if(data[i].win == "1"){
        totalWins++;
        wins[currChoice]++;
      }
      simData.push({x:i, y:totalWins/timesPlayed});
    }

    return {"name": "UCB1", "color":color, "data":simData};
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

    for(var i=0; i<steps; i++){
      timesPlayed++;
      if(played.length < noArms){
        currChoice = i;
        played[currChoice] = 1;
      }else{
        if(noTimesBestPicked/timesPlayed <  EG_CONST){
          noTimesBestPicked++;
          for(var j=0; j<noArms; j++){
            if(wins[j] > score){
              currChoice = j;
            }
          }
        }else{
          currChoice = Math.floor(Math.random() * noArms);
        }
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

    return {"name": "e-greedy", "color":color, "data":simData};
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
