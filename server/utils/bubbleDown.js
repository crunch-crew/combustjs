var bubbleDown = function(obj, path) {
  var rows = [];

  var recurse = function(obj, path) {
    // var path = path || '/';
    var nonObjs = {};
    nonObjs.path = path;
    nonObjs._id = _id;
    // checks if obj is an array, if true sets attribute array
    if(_isArray) {
      nonObjs._isArray = true;
      nonObjs._length = 0;
    }
    path = (path === null) ? _id : path + _id + "/";
    for (var key in obj) {
      if (Array.isArray(obj[key])) {
        if(_isArray) {
          nonObjs._length++;
          obj[key]._partArray = true;
        }
        recurse(obj[key], path, key, true);
      }
      else if(typeof obj[key] === "object") {
        if(_isArray) {
          nonObjs._length++;
          obj[key]._partArray = true;
        }
        recurse(obj[key], path, key);
      }
      else if (typeof obj[key] === "function") {
        if(_isArray) nonObjs._length++;
        nonObjs[key] = JSON.stringify(obj[key]);
      }
      else {
        if(_isArray) nonObjs._length++;
        nonObjs[key] = obj[key];
      }
    }
    rows.push(nonObjs);
  };

  recurse(obj,path, _id);
  return rows;
};

module.exports = bubbleDown;