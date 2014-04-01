function fileReader(){
  this.readFile = function (evnt, type, func) {
    var callback = func;
    var files = evnt.target.files;
    var file = files[0];
    var reader = new FileReader();

    //This handler is called once the data from the file is read.
    reader.onload = (function (theFile, callback) {
      return function (e) {
        //var data = formatData(e.srcElement.result, type);
        callback(e.srcElement.result);
      };
    })(file, callback);

    //Read contents of file as a text string.
    reader.readAsText(file);
  };
}

FR = new fileReader();
