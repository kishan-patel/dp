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
    var series = [];
    var history = [];
    var tokens = [];
    var result, data, armRecord, wins, timesPlayed;

    for (var i = 0; i < arrayOfLines.length; i++) {
      tokens = arrayOfLines[i].split(",");
      result = $.grep(series, function (e) {
        return e.name == tokens[0]
      });
      wins = 0;
      timesPlayed = 0;

      if (result.length == 0) { //Item not found
        if (tokens[1] == 1) {
          wins++;
          timesPlayed++;
        } else {
          timesPlayed++;
        }

        //Push this information to history.
        history.push({
          "name": tokens[0],
          "timesPlayed": timesPlayed,
          "wins": 1
        })

        //Push the information to the series that will be used for the line chart.
        series.push({
          "name": tokens[0],
          "data": [{
            "x": i,
            "y": wins / timesPlayed
          }]
        });
      } else { //There is no possibility of having duplicate records -- why we don't need if/else.
        data = result[0].data;
        armRecord = $.grep(history, function (e) {
          return e.name == tokens[0]
        })[0];
        wins = armRecord.wins;
        timesPlayed = armRecord.timesPlayed;

        //Determine if the current simulation was a win or a loss.
        if (tokens[1] == 1) {
          wins++;
          timesPlayed++;
        } else {
          timesPlayed++;
        }

        //Update the wins and times played --  this is stored in history. 
        armRecord.wins = wins;
        armRecord.timesPlayed = timesPlayed;

        //This is the series that will be used when constructing the line chart.
        data.push({
          x: i,
          y: wins / timesPlayed
        });
      }
    }
    return series;
  };
}(window.FR = window.FR || {}));
