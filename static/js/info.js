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

  this.tooltipInfo = {
    "none": "The graph displays the mean scores for all of the alternatives at each timestep.",     
    "UCB1": "The graph displays the mean and UCB1 scores of a single alternative at each timestep.", 
    "sim": "The graph displays the mean of the rewards for a given alternative at each timestep when a certain policy is applied to the set of all alternatives. For each policy, the mean at each timestep is computed as follows: we select an arm based on a given policy and assign it  reward; we then compute the mean of the rewards for each arm."  
  }

  this.alertMessages = {
    "live_socket_connection": "Establishing the initial socket connection may take a few seconds."
  }
}
