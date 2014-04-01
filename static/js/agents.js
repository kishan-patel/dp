function agents(){
  this.runSim = function(agent, steps, bandits, customFn){
    switch(agent){
      case "UCB1":
        return getUCBSimScores(steps, bandits);
        break;
      case "e-greedy":
        return getEGreedySimScores(steps, bandits);
        break;
      case "random":
         return getRandomSimScores(steps, bandits);
      default:
        return customFn(steps, bandits);
        break;
    }
  }

  this.getScores = function(agent, data){
    switch(agent){
      case "UCB":
        return getUCBScores(data);
        break;
      default:
        return getUCBScores(data);
        break;
    }
  }

  this.getUCBLiveScores = function(newData, oldData){
    var totalTimesPlayed = oldData.times_played;
    var maxScore = oldData.max_score;
    var alternatives = oldData.alternatives;
    var armPlayedNew, armPlayedOld, result, ucbScore, meanScore;

    for(var i=0; i<newData.length; i++){
      totalTimesPlayed++;        
      armPlayedNew = newData[i].alternative;
      result = newData[i].reward;

      //Update the information for the alternative that was chosen at timestep i.
      var found = false;
      for(var j=0; j<alternatives.length; j++){
        if(alternatives[j].alternative == armPlayedNew){
          armPlayedOld = alternatives[j];
          found = true;
          break;
        }
      }

      //If this is the first time we are seeing any data for this alternative.
      if(!found){
        var mc = [];
        var ucbc = [];

        for(var j=0; j<totalTimesPlayed; j++){
          mc.push({x:j, y:0});
          ucbc.push({x:j, y:0});
        }

        alternatives.push({
          alternative: armPlayedNew,
          times_played: 1,
          rewards: parseFloat(result),
          mean_scores: [],
          ucb_scores: [],
        });
        
        armPlayedOld = alternatives[alternatives.length-1];
      }
      armPlayedOld.times_played+=1
      armPlayedOld.rewards+=parseFloat(result);

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
    var ucbScore, currentScore=0, bestChoice, totalTimesPlayed=0;

    //Initially play each arm once
    for(var i=0; i<arms.length; i++){
      played[i] = 1;
      rewards[i] = arms[i].getReward();
      wins[i] = rewards[i];
      ucbScores[i] = [];
      for(var j=0; j<arms.length && j<steps; j++){
        ucbScores[i].push({x:j, y:rewards[i]/played[i]});
      }
      totalTimesPlayed++;
    }

    for(var i=totalTimesPlayed; i<steps; i++){
      totalTimesPlayed++;

      //Apply the UCB1 policy to choose an arm 
      currentScore = 0;
      bestChoice = 0;
      for(var j=0; j<arms.length; j++){
        ucbScore = rewards[j]/played[j] + Math.sqrt((2*Math.log(totalTimesPlayed))/played[j]);   
        if(ucbScore > currentScore){
          bestChoice = j;
          currentScore = ucbScore;  
        }
      }
      
      //Update reward for arm chosen during current timestep
      rewards[bestChoice]+=arms[bestChoice].getReward();
      played[bestChoice]+=1;
      
      //Store the scores at each timestep for each arm
      for(var j=0; j<arms.length; j++){
       ucbScores[j].push({x:i, y:rewards[j]/played[j]});
      }
    }
   
    return ucbScores;
  }

  function getEGreedySimScores(steps, arms){
    var played = [];
    var wins = [];
    var eGreedyScores = {};
    var rewards = [];
    var bestScore=0, bestChoice, totalTimesPlayed=0, noTimesBestPicked=0;
    var EG_CONST = 0.9;

    //Initially play each arm once
    for(var i=0; i<arms.length; i++){
      played[i] = 1;
      rewards[i] = arms[i].getReward();
      wins[i] = rewards[i];
      eGreedyScores[i] = [];
      for(var j=0; j<arms.length && j<steps; j++){
        eGreedyScores[i].push({x:j, y:rewards[i]/played[i]});
      }
      totalTimesPlayed++;
    }

    //At each timestep pick an arm based on the e-greedy policy
    for(var i=totalTimesPlayed; i<steps; i++){
      totalTimesPlayed++;

      //Application of the e-greedy policy
      if(noTimesBestPicked/totalTimesPlayed < (1-EG_CONST)){
        noTimesBestPicked++;
        bestScore = 0;
        bestChoice = 0;
        for(var j=0; j<arms.length; j++){
          eGreedyScore = rewards[j]/played[j];
          if(eGreedyScore > bestScore){
            bestChoice = j;
          }
        }
      }else{
        bestChoice = Math.floor(Math.random()*arms.length);
      }

      //Update the rewards for the arm that was picked
      rewards[bestChoice] += arms[bestChoice].getReward();
      played[bestChoice] += 1;

      //Update the scores for each arm at each timestep
      for(var j=0; j<arms.length; j++){
        eGreedyScores[j].push({x:i, y:rewards[j]/played[j]});
      }
    }

    return eGreedyScores;
  }

  function getRandomSimScores(steps, arms){
    var played = [];
    var wins = [];
    var randomScores = {};
    var rewards = [];
    var randomChoice, totalTimesPlayed=0;

    //Initially play each arm once
    for(var i=0; i<arms.length; i++){
      played[i] = 1;
      rewards[i] = arms[i].getReward();
      wins[i] = rewards[i];
      randomScores[i] = [];
      for(var j=0; j<arms.length && j<steps; j++){
        randomScores[i].push({x:j, y:rewards[i]/played[i]});
      }
      totalTimesPlayed++;
    }

    //At each timestep randomly pick a arm
    for(var i=totalTimesPlayed; i<steps; i++){
      totalTimesPlayed++;
      randomChoice = Math.floor(Math.random()*arms.length);
      rewards[randomChoice] += arms[randomChoice].getReward();
      played[randomChoice] += 1
      
      //Update the random scores at each step for each arm
      for(var j=0; j<arms.length; j++){
        randomScores[j].push({x:i, y:rewards[j]/played[j]});  
      }
    }

    return randomScores;
  }
}

try{  
  exports.agents = new agents(); 
}catch(e){
}
