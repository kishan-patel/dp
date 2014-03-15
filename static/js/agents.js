function agents(){
  this.runSim = function(agent, steps, bandits){
    switch(agent){
      case "UCB1":
        return getUCBSimScores(steps, bandits);
        break;
      case "e-greedy":
        return getEGreedySimScores(steps, bandits);
        break;
      default:
        return getUCBSimScores(steps, bandits);
        break;
    }
  }

  this.getScores = function(agent, data){
    switch(agent){
      case "UCB":
        return getUCBScores(data);
        break;
      case "e-greedy":
        return getEGreedyScores(data);
        break;
      default:
        return getUCBScores(data);
        break;
    }
  }

  this.getUCBLiveScores = function(newData, oldData){
    debugger;
    var totalTimesPlayed = oldData.times_played;
    var maxScore = oldData.max_score;
    var alternatives = oldData.alternatives;
    var armPlayedNew, armPlayedOld, result, ucbScore, meanScore;

    for(var i=0; i<newData.length; i++){
      totalTimesPlayed++;        
      armPlayedNew = newData[i].alternative;
      result = newData[i].reward;

      //Update the information for the alternative that was chosen at timestep i.
      for(var j=0; j<alternatives.length; j++){
        if(alternatives[j].alternative == armPlayedNew){
          armPlayedOld = alternatives[j];
          break;
        }
      }
      armPlayedOld.times_played+=1
      armPlayedOld.rewards+=result;

      //Update the UCB score of all other arms.
      for(var j=0; j<alternatives.length; j++){
        if(alternatives[j].times_played == 0){
          ucbScore = 0;
          meanScore = 0;
        }else{
          ucbScore = alternatives[j].rewards/alternatives[j].times_played 
                       + 2*Math.sqrt(Math.log(totalTimesPlayed)/alternatives[j].times_played);
          meanScore = alternatives[j].rewards/alternatives[j].times_played;
        }
        if(ucbScore > maxScore)
            maxScore = ucbScore;
        alternatives[j].ucb_scores.push({"x":totalTimesPlayed-1, "y":ucbScore, "utc_time":new Date()});
        alternatives[j].mean_scores.push({"x":totalTimesPlayed-1, "y":meanScore, "utc_time":new Date()});
      }
    }

    oldData.times_played = totalTimesPlayed;
    oldData.max_score = maxScore;
    //return {"times_played": timesPlayed, "max_score": maxScore, "data":old_data};
  }

  function getMeanLiveScores(newData, oldData){
    var maxScore = oldData["max_score"];
    var armPlayed, result, meanScore;

    for(var i=0; i<newData.length; i++){
      armPlayed = newData[i]["alternative"];
      result = newData[i]["rewards"];

      oldData[armPlayed]["times_played"]+=1;
      oldData[armPlayed]["rewards"]+=result;

      for(var arm in oldData){
        if(arm == "times_played")
          break;
        if(oldData[arm]["times_played"] == 0)
          meanScore = 0;
        else
          meanScore = oldData[arm]["rewards"]/oldData[arm]["times_played"]
        if(meanScore > maxScore)
          maxScore = meanScore
        oldData[arm]["data"].push({"x":totalTimesPlayed-1, "y":meanScore});
      }
    }

    return {"times_played": timesPlayed, "max_score": maxScore, "data":oldData};
  }

  /**
    Description: Calculates the UCB scores for a particular arm given the results observed.
    @method getUCBScores
    @param data
      -data is the results observed for an arm at each timestep
      -the data object has the following key/value pairs:
        played: 1 = played at time t, 0 = not played
        win: the reward observed at time t if this arm was played 
    @return {ucbScores, maxScore}
      -the UCB scores calculated from the observed data
      -the max score is returned to know what to set the height of the graph to
  */
  function getUCBScores(data){
    var ucbScores = [];
    var timesPlayed = 0;
    var rewards = 0;
    var score;

    for(var i=0; i<data.length; i++){
      timesPlayed += data[i].played;
      rewards += data[i].reward;

      if(timesPlayed > 0)
        score = rewards/timesPlayed + Math.sqrt((2*Math.log(i+1)/timesPlayed));
      else
        score = 0;

      ucbScores.push({"x":i, "y": score});
    }

    return ucbScores
  }

  function getUCBSimScores(steps, arms){
    var played = [];
    var wins = []
    var ucbScores = {};
    var rewards = [];
    var ucbScore, maxScore=0, currentScore=0, bestChoice, totalTimesPlayed=0;

    for(var i=0; i<arms.length; i++){
      played[i] = 1;
      rewards[i] = arms[i].getReward();
      wins[i] = rewards[i];
      ucbScores[i] = [];
      played[i] = 1;
    }

    for(var i=0; i<steps; i++){
      totalTimesPlayed++;

      currentScore = 0;
      bestChoice = 0;
      for(var j=0; j<arms.length; j++){
        ucbScore = rewards[j]/played[j] + Math.sqrt((2*Math.log(totalTimesPlayed))/played[j]);   
        if(ucbScore > currentScore){
          bestChoice = j;
          currentScore = ucbScore;  
          if(currentScore > maxScore){
            maxScore = currentScore;  
          }
        }
        ucbScores[j].push({x:i, y:ucbScore});

      }

     rewards[bestChoice]+=arms[bestChoice].getReward();
     played[bestChoice]+=1;
    }
   
    return {"max_score":maxScore, "all_scores":ucbScores};
  }

  function getEGreedySimScores(steps, arms){
    var played = [];
    var wins = [];
    var eGreedyScores = {};
    var rewards = [];
    var ucbScore, maxScore=0, bestScore=0, bestChoice, totalTimesPlayed=0, noTimesBestPicked=0;
    var EG_CONST = 0.9;

    for(var i=0; i<arms.length; i++){
      played[i] = 1;
      rewards[i] = arms[i].getReward();
      wins[i] = rewards[i];
      eGreedyScores[i] = [];
      played[1] = 1;
    }

    for(var i=0; i<steps; i++){
      totalTimesPlayed++;

      if(noTimesBestPicked/totalTimesPlayed < EG_CONST){
        noTimesBestPicked++;
        bestScore = 0;
        for(var j=0; j<arms.length; j++){
          eGreedyScore = rewards[j]/played[j];
          if(eGreedyScore > bestScore){
            bestChoice = j
          }
        }
      }else{
        bestChoice = Math.floor(Math.random()*arms.length);
      }
      
      for(var j=0; j<arms.length; j++){
        eGreedyScores[j].push({x:i, y:rewards[j]/played[j]});
        if(rewards[j]/played[j] > maxScore){
          maxScore = rewards[j]/played[j];
        }
      }

      rewards[bestChoice]+=arms[bestChoice].getReward();
      played[bestChoice]+=1;
    }

    return {"max_score":maxScore, "all_scores":eGreedyScores}
  }

  function getRandomSimScores(steps, noArms, series, color){
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

try{  
  exports.agents = new agents(); 
}catch(e){
}
