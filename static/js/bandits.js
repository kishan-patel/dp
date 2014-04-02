function bandits(){
  this.getBandit = function(params){
    switch(params["name"]){
      case "bernoulli":
        return bernoulli(params["prob"]);
        break;
      case "gaussian":
        return gaussian(params["mean"], params["variance"]);
        break;
      default: 
        return;
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

  function gaussian(mean, stdev){
    function generateGaussianNumber(){
      var u1, u2;
      var u1 = u2 = 0;
      while(u1 * u2 == 0){
        u1 = Math.random();
        u2 = Math.random();
      }
      return Math.sqrt(-2. * Math.log(u1)) * Math.cos(2*Math.PI*u2);
    }

    return {
      "getReward": function(){
        //Generate a gaussian random number from the mean and variance
        var gaussianNumber = stdev*generateGaussianNumber()+1.*mean;

        if(stdev < 0){
          alert ("You cannnot have standard deviation less than 0.");
          return 0;
        }else if(stdev == 0){
          if (gaussianNumber < mean){
            return 0;
          }else{
            return 1;
          }
        }else{
          //Approximate the CDF
          var z = (gaussianNumber-mean)/stdev;
          var t = 1/(1+0.3275911*Math.abs(z));
          var a1 =  0.254829592;
          var a2 = -0.284496736;
          var a3 =  1.421413741;
          var a4 = -1.453152027;
          var a5 =  1.061405429;
          var erf = 1-(((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-z*z);
          var sign = 1;
          if(z < 0){
            sign = -1;
          }
          return (1/2)*(1+sign*erf);
        }
      }
    }
  }
}

