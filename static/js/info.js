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
    "ucb1_score_and_mean_values": function(s){ return "UCB1 score and means of rewards (Alternative "+s.name.split(/\(.*\)/)[0]+")"},
    "ucb1_scores_and_mean_value": function(s){ return "UCB1 scores and mean reward (Alternative "+s.name.split(/\(.*\)/)[0]+")"},
    "index_values_per_arm": function(s){ return "Indices for "+s.name.split(/\(.*\)/)[0]},
    "index_values_for_all_arms": function(s){return s.name.split(/\(.*\)/)+" values for each alternative"}
  }

  this.tooltipInfo = {
    "means": "The graph displays the mean rewards for all of the alternatives at each timestep.",
    "ucb1_score_and_mean_values": "The graph displays the mean of rewards and UCB score for a given alternative at each timestep. The mean of rewards of the other alternatives are shown in gray.", 
    "ucb1_scores_and_mean_value": "The graph displays the mean of rewards and UCB1 score for a given alternative at each timestep. The UCB1 scores of the other alternatives are shown in gray.",
    "index_values_per_arm": "The graph displays the mean of the rewards for a given alternative at each timestep when a certain policy is applied to the set of all alternatives. For each policy, the mean at each timestep is computed as follows: we select an arm based on a given policy and assign it  reward; we then compute the mean of the rewards for each arm.",
    "index_values_for_all_arms": "The graph displays the mean of the rewards obtained for all alternatives when the given index is applied."  
  }
}
