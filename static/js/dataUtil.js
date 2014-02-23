(function (DataUtil, undefined) {                                              
  DataUtil.getBarData = function(fileString){
      var arrayOfLines = fileString.match(/[^\r\n]+/g);
      var type = getType(arrayOfLines[0]);
      var data, type;

      arrayOfLines.shift();
      switch(type){
        case 'timestamp':
          data = getHourlyBarData(arrayOfLines);
          type = 'timestamp';
          break;
        case 'standard':
          data = getStandardBarData(arrayOfLines);
          type = 'standard';
          break;
        default:
          throw new Error('The format of the file is not correct');
          break;
      }
      
      return {"data":data, "type":type}
  }

  DataUtil.getLineData = function(fileString){
      var arrayOfLines = fileString.match(/[^\r\n]+/g);
      var type = getType(arrayOfLines[0]);
      var data, type;

      arrayOfLines.shift();
      switch(type){
        case 'timestamp':
          data = getHourlyLineData(arrayOfLines);
          type = 'timestamp'
          break;
        case 'standard':
          data = getStandardLineData(arrayOfLines);
          type = 'standard'
          break;
        default:
          throw new Error('The format of the file is not correct');
          break;
      }

      if(type == 'timestamp'){
        return {'data': data,  'type': type};
      }else if(type == 'standard'){
        return {'data': data.series, 'type': type, 'arms': data.arms, 'steps': data.steps};
      }
  }

  function getStandardBarData(arrayOfLines){
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

    for(var i=0; i< arrayOfLines.length; i++){
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
              y: parseInt(tokens[1]) == "0" ? 0.5 : 1
          });
       }
      }
    }

    return series;
  }

  function getHourlyBarData(arrayOfLines){
    var uniqueArms = getUniqueArms(arrayOfLines);
    var series = [];
    var tokens = [];
    var result, data, dataPair;

    for(var i=0; i<uniqueArms.length; i++){
      series.push({
        "name": uniqueArms[i],
        "data": [
          {x:0000, y:0}, {x:0100, y:0}, {x:0200, y:0}, 
          {x:0300, y:0}, {x:0400, y:0}, {x:0500, y:0}, 
          {x:0600, y:0}, {x:0700, y:0}, {x:0800, y:0}, 
          {x:0900, y:0}, {x:1000, y:0}, {x:1100, y:0},
          {x:1200, y:0}, {x:1300, y:0}, {x:1400, y:0}, 
          {x:1500, y:0}, {x:1600, y:0}, {x:1700, y:0}, 
          {x:1800, y:0}, {x:1900, y:0}, {x:2000, y:0}, 
          {x:2100, y:0}, {x:2200, y:0}, {x:2300, y:0}
        ]
      });
    } 
    
    for(var i=0; i<arrayOfLines.length; i++){
      tokens = arrayOfLines[i].split(',');
      result = $.grep(series, function(e){
        return e.name == tokens[0];  
      })[0];
      data = result.data;
      dataPair = $.grep(data, function(e){
        return e.x == tokens[2];
      })[0];
      if(tokens[1] == 1){
        dataPair.y++;
      }
    }

    return series;
  }

  function getStandardLineData(arrayOfLines){
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
        played: true,
        win: tokens[1],
        armPlayed: tokens[0]
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
            played: false,
            win: 0,
            armPlayed: tokens[0]
          });
        }  
      }
    }
    
    return {series:series, arms:uniqueArms.length, steps: arrayOfLines.length};
  }

  function getHourlyLineData(arrayOfLines){
   var uniqueArms = getUniqueArms(arrayOfLines);
   var series = [];
   var tokens = [];
   var result, data, dataPair;
   
   for(var i=0; i<uniqueArms.length; i++){
      series.push({
        "name": uniqueArms[i],
        "data": [
          {x:0000, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:0100, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:0200, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:0300, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:0400, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:0500, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:0600, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:0700, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:0800, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:0900, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:1000, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:1100, y:0, played: false, timesPlayed: 0, wins: 0},
          {x:1200, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:1300, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:1400, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:1500, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:1600, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:1700, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:1800, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:1900, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:2000, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:2100, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:2200, y:0, played: false, timesPlayed: 0, wins: 0}, 
          {x:2300, y:0, played: false, timesPlayed: 0, wins: 0}
        ]
      });
    }
    
    for(var i=0; i<arrayOfLines.length; i++){
      tokens = arrayOfLines[i].split(',');
      result = $.grep(series, function(e){
        return e.name == tokens[0];
      })[0];
      data = result.data;
      dataPair = $.grep(data, function(e){
        return e.x == tokens[2];
      })[0];
      if(tokens[1] == 1){
        dataPair.played = true;
        dataPair.timesPlayed++;
        dataPair.wins++;
        //dataPair.y = dataPair.wins / dataPair.timesPlayed;
        dataPair.y = dataPair.wins;
      }else{
        dataPair.played = true;
        dataPair.timesPlayed++;
        //dataPair.y = dataPair.wins / dataPair.timesPlayed;
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

  function getType(line){
    var tokens = line.split(",");
    var type;

    //Use longest match first
    if(tokens.indexOf("arm") > -1 && tokens.indexOf("result") > -1 
        && tokens.indexOf("time") > -1){
      type = "timestamp";
    }else if(tokens.indexOf("arm") > -1 && tokens.indexOf("result") > -1){
      type = "standard";
    }
     
    return type;
  }
}(window.DataUtil = window.DataUtil || {}));
