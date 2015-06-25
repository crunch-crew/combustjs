var authorization = require('../authorization');
//TODO: handle edge case of root
module.exports = function(path, rules, user) {
  var rules = rules || authorization;
  //get array of keys
  var path = path.split("/");
  var path = path.slice(1, path.length-1);

  var read;
  var write;
  //find the rules for the specified path in the rules object
  for (var i = 0; i < path.length; i++) {
    if (rules[path[i]]) {
      //keeps track of the most relevant rule for both read and write as it descends further
      if (rules[path[i]][".read"]) {
        read = rules[path[i]][".read"];
      }
      if (rules[path[i]][".write"]) {
        write = rules[path[i]][".write"];
      }
      rules = rules[path[i]];
    }
    //if key doesn't exist stop iterating and use the rules of the highest parent that has rules
    else {
      break;
    }
  }

  //evaluate the strings as javascript
  if (read) {
    var read = eval(read); 
  }
  if (write) {
    var write = eval(write);
  }
  //if rule is undefined, set it to true
  return {
    "read": read !== undefined ? read : false,
    "write": write !== undefined ? write : false
  }
}