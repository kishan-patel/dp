(function (DataUtil, undefined) {                                              
  DataUtil.getBarData = function(fileString){
    var arrayOfLines = fileString.match(/[^\r\n]+/g);
    var uniqueArms = getUniqueArms(arrayOfLines);
    var series = [];
    var tokens = [];
    var result, data;
    
    for(var i=0; i<uniqueArms.length; i++){
        series.push({
          "name": uniqueArms[i],
          "data": []
        });
    }

    for(var i = 0; i< arrayOfLines.length; i++){
      tokens = arrayOfLines[i].split(',');
        
      for(var j=0; j<uniqueArms.length; j++){
        if(uniqueArms[j] != tokens[0]){
          result = $.grep(series, function(e){
            return e.name == uniqueArms[j];
          })[0];
          data = result.data;
          data.push({
              x: i,
              y: 0
          });
        }else{
          result = $.grep(series, function(e){
              return e.name == uniqueArms[j];
          })[0];
          data = result.data;
          data.push({
              x: i,
              y: parseInt(tokens[1])
          });
       }
      }
    }

    return series;
  }
 
  DataUtil.getLineData = function(fileString){
    var arrayOfLines = fileString.match(/[^\r\n]+/g);
    var uniqueArms = getUniqueArms(arrayOfLines);
    var series = [];
    var history = [];
    var tokens = [];
    var result, data, armRecord;
    
    for(var i=0; i<uniqueArms.length; i++){
      history.push({
        "name": uniqueArms[i],
        "timesPlayed": 0,
        "wins": 0
      });
      series.push({
        "name": uniqueArms[i],
        "data": []
      });
    }

    for(var i = 0; i < arrayOfLines.length; i++){
      //Line entry - arm comma result
      tokens = arrayOfLines[i].split(',');
       
      //We the history for the current arm
      armRecord = $.grep(history, function(e){
        return e.name == tokens[0];
      })[0];

      //We get the object entry for this arm in the series that will
      //be returned
      result = $.grep(series, function(e){
        return e.name == tokens[0];
      })[0];
      data = result.data;
        
      //Update the history
      if(tokens[1] == 1){
        armRecord.wins++;
        armRecord.timesPlayed++;
      }else{
        armRecord.timesPlayed++;
      }
        
      //Add the current result to the series that will be returned
      data.push({
        x: i,
        y: armRecord.wins / armRecord.timesPlayed,
        played: true
      });
        
      //For all of the arms that are not played during the current
      //clock tick, they retain the same value they had during the 
      //previous clock tick.
      for(var j=0; j<uniqueArms.length; j++){
        if(uniqueArms[j] != tokens[0]){
          armRecord = $.grep(history, function(e){
            return e.name == uniqueArms[j]
          })[0];
          result = $.grep(series, function(e){
            return e.name == uniqueArms[j];
          })[0];
          data = result.data;
          data.push({
            x: i,
            y: armRecord.timesPlayed == 0 ? 0 : armRecord.wins/armRecord.timesPlayed,
            played: false
          });
        }  
      }
    }
    
    return series;
  }

  function getUniqueArms(arrayOfLines){
    var arms = [];
    var tokens = [];
    
    for(var i=0; i<arrayOfLines.length; i++){
      tokens = arrayOfLines[i].split(",");
      
      if(arms.indexOf(tokens[0]) == -1){
        arms.push(tokens[0]);
      }
    }

    return arms;
  }
}(window.DataUtil = window.DataUtil || {}));
