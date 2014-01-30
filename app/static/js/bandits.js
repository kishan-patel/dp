function bandits(){
  this.runSim = function(steps, type, prob, armName, color){
    switch(type){
      case "Bernoulli":
        return this.bernoulli(steps, type, prob, armName, color);
        break;
      default:
        return
    }
  }
  this.bernoulli = function(steps, type, prob, armName, color){
    var reward;
    var totalWins = 0;
    var data=[];
    
    for(var i=0; i<steps; i++){
      reward = 1 && ( Math.random() < prob ) || 0 ;
      if(reward){
          totalWins++;
          data.push({armPlayed: armName, played: true, win: 1, x: i, y:totalWins/(i+1)});
      }else{
          data.push({armPlayed: armName, played: true, win: 0, x: i, y:totalWins/(i+1)});
      }
    }

    return {"name": armName, "color": color, "data": data};
  }
}
