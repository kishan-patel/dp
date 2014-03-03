function bandits(){
  this.getBandit = function(type, prob){
    switch(type){
      case "Bernoulli":
        return bernoulli(prob);
        break;
      default:
        return
    }
  }

  function bernoulli(prob){
    return {
      "name": "bernouilli-"+prob,
      "getReward": function(){
        return 1 && (Math.random() < prob) || 0;
      }
    }
  }
}

