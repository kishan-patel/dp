(function (FR, undefined) {
  FR.readFile = function (evnt, func) {
    var callback = func;
    var files = evnt.target.files;
    var file = files[0];
    var reader = new FileReader();

    //This handler is called once the data from the file is read.
    reader.onload = (function (theFile, formatData, callback) {
      return function (e) {
        var data = formatData(e.srcElement.result);
        callback(data);
      };
    })(file, formatData, callback);

    //Read contents of file as a text string.
    reader.readAsText(file);
  };

  function formatData(fileString) {
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

    for (var i = 0; i < arrayOfLines.length; i++) {
      tokens = arrayOfLines[i].split(",");
      
      //To make all of the array sizes equal. If for a particular clock
      //tick an arm wasn't played, it retains its previous information.
      for(var j=0; j<uniqueArms.length; j++){
        if(uniqueArms[j] != tokens[0]){
          armRecord = $.grep(history, function(e){
            return e.name == uniqueArms[j]
          })[0]; 
          result = $.grep(series, function(e){
            return e.name == uniqueArms[j];
          })[0];
          data = result.data
          data.push({
            x: i,
            y: armRecord.timesPlayed == 0 ? 0: armRecord.wins/armRecord.timesPlayed
          });
        }else{
          armRecord = $.grep(history, function(e){
            return e.name == tokens[0];
          })[0];
          result = $.grep(series, function(e){
            return e.name == tokens[0];
          })[0]; 
          data = result.data;
          if(tokens[1] == 1){
            armRecord.wins++;
            armRecord.timesPlayed++;
          }else{
            armRecord.timesPlayed++;
          }
          data.push({
            x: i,
            y: armRecord.wins / armRecord.timesPlayed
          });
        }
      }
    }

    return series;
  };

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
  };
}(window.FR = window.FR || {}));
