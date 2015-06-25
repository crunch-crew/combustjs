var authorization = require('../authorization');
//TODO: handle edge case of root
module.exports = function(options) {
  //if no path, return null
  if (!options || !options.path) {
    return null;
  }

  var path = options.path;
  var rules = options.rules || authorization;
  var user = options.user || null;

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

//replace tokens with their actual values and evaluate the strings as javascript
if (read) {
  if (user) {
    read = read.replace("$user", "user");
  }
  var read = eval(read); 
}
if (write) {
  if (user) {
    write = write.replace("$user", "user");
  }
  var write = eval(write);
}
  //if rule is undefined, set it to true
  return {
    "read": read !== undefined ? read : false,
    "write": write !== undefined ? write : false
  }
}