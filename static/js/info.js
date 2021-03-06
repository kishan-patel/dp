function Info(){
  this.initTooltip = function(htmlClass, tooltipInfo){
    $(htmlClass).tooltip({
      placement: "left",
      title: tooltipInfo,
      trigger: "click"
    });
  }

  this.addAlert = function(type, htmlId, alertMessage){
    var alertHtml = "<div class='alert alert-"+type+" alert-dismissable'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button><strong>"+alertMessage+"</strong></div>";
    $("#"+htmlId).append(alertHtml);    
  }

  this.clearAlerts = function(htmlId){
    $("#"+htmlId).empty();
  }

  this.alertMessages = {
    "live_socket_connection": "Establishing the initial socket connection may take a few seconds."
  }

  this.titles = {
    "means": function(s){ return "Mean reward of all alternatives"},
    "ucb1_score_and_mean_values": function(s){ return "UCB1 score and mean of rewards (Alternative "+s.name.split(/\(.*\)/)[0]+")"},
    "ucb1_scores_and_mean_value": function(s){ return "UCB1 scores and mean reward (Alternative "+s.name.split(/\(.*\)/)[0]+")"},
    "all_indices_per_arm": function(s){ return "Indices for "+s.name.split(/\(.*\)/)[0]},
    "all_arms_per_index": function(s){ return s.name.match(/\(.*\)/)[0].match(/[^\(\)]+/)+" values for each alternative"},
    "barInfo": function(e){return "Selection and reward at each timestep"}
  }

  this.tooltipInfo = {
    "means": "The graph displays the mean rewards for all of the alternatives at each timestep.",
    "ucb1_score_and_mean_values": "The graph displays the mean of rewards and UCB score for a given alternative at each timestep. The mean of rewards of the other alternatives are shown in gray.", 
    "ucb1_scores_and_mean_value": "The graph displays the mean of rewards and UCB1 score for a given alternative at each timestep. The UCB1 scores of the other alternatives are shown in gray.",
    "all_indices_per_arm": "The graph displays the mean of the rewards for a given alternative at each timestep when a certain index policy is applied to the set of all alternatives. For each index policy, the mean at each timestep is computed as follows: we select an arm based on a given index policy and assign it a reward; we then compute the mean of the rewards for each arm.",
    "all_arms_per_index": "The graph displays the mean of the rewards obtained for all alternatives when the given index policy is applied.",
    "barInfo": "The graph displays which arm was selected as well as what the reward received was at each timestep. A bar of height 1 implies that a reward was observed and a bar of height 0.5 implies that no reward was observed."  
  }
}
