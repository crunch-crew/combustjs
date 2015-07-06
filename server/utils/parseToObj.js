var parseToObj = function(root, children) {
	//copy all properties except path and id
	var extendObj = function(obj1, obj2) {	
		for (var key in obj2) {
			if(key !== "path" && key !== "_id" && key !== "id" && key !== "_length" && key !== "_isArray" && key !== "_partArray") {
				obj1[key] = obj2[key];
			}
		}
	};

	var parsedObj = {};
	extendObj(parsedObj, root);
	for (var i = 0; i < children.length && root; i++) {
		//create array of nested object properties
		var childPath = children[i].path;
		childPath = childPath.replace(root.path, "");
		
		var pathArray = childPath.split("/");
		pathArray = pathArray.slice(1,pathArray.length-1);
		pathArray.push(children[i]._id);

		var currentPath = parsedObj;

		for (var j = 0; j < pathArray.length; j++) {
			if (!currentPath[pathArray[j]]) {
				if(j === pathArray.length - 2 && children[i]._partArray){
					currentPath[pathArray[j]] = [];
				}	
				else if(j === pathArray.length - 1 && children[i]._isArray) {
					currentPath[pathArray[j]] = [];
				}
				else {
					currentPath[pathArray[j]] = {};
				}
			}
			currentPath = currentPath[pathArray[j]];
		}

		extendObj(currentPath, children[i]);
	}

	return parsedObj;
};

module.exports = parseToObj;