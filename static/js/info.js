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
    "mean_for_all_arms": function(s){ return "Mean of all arms"},
    "ucb_and_mean_per_arm": function(s){ return "UCB1 and mean of Arm "+s.name.split(/\(.*\)/)[0]},
    "index_values_per_arm": function(s){ return "Indices for "+s.name.split(/\(.*\)/)[0]},
    "index_values_for_all_arms": function(s){return s.name.split(/\(.*\)/)+" values for each arm"}
  }

  this.tooltipInfo = {
    "mean_for_all_arms": "The graph displays the mean scores for all of the alternatives at each timestep.",
    "ucb_and_mean_per_arm": "The graph displays the mean and UCB1 scores of a single alternative at each timestep.", 
    "index_values_per_arm": "The graph displays the mean of the rewards for a given alternative at each timestep when a certain policy is applied to the set of all alternatives. For each policy, the mean at each timestep is computed as follows: we select an arm based on a given policy and assign it  reward; we then compute the mean of the rewards for each arm.",
    "index_values_for_all_arms": "The graph displays the mean of the rewards obtained for all arms when the given index is applied."  
  }

  this.agentTypeToGraphTitle = {
    "none": this.titles.mean_for_all_arms,
    "UCB1": this.titles.ucb_and_mean_per_arm,
    "index_values_per_arm": this.titles.index_values_per_arm,
    "index_values_for_all_arms": this.titles.index_values_for_all_arms
  }

  this.agentTypeToTooltip = {
    "none": this.tooltipInfo.mean_for_all_arms,
    "UCB1": this.tooltipInfo.ucb_and_mean_per_arm,
    "index_values_per_arm": this.tooltipInfo.index_values_per_arm,
    "index_values_for_all_arms": this.tooltipInfo.index_values_for_all_arms
  }
}
