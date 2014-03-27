function Info(){
  this.initTooltip = function(htmlClass, tooltipInfo){
    $(htmlClass).tooltip({
      placement: "left",
      title: tooltipInfo,
      trigger: "click"
    });
  }

  this.tooltipInfo = {
    "mean_ucb1": "The graph displays the mean and UCB1 scores of a single alternative at each timestep.", 
    "ucb1": "The graph displays the UCB1 scores for all of the alternatives at each timestep.",     "sim": "The graph displays the mean of the rewards for a given alternative at each timestep when a certain policy is applied to the set of all alternatives. For each policy, the mean at each timestep is computed as follows: we select an arm based on a given policy and assign it  reward; we then compute the mean of the rewards for each arm."  
  }
}
