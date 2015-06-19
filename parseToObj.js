var parseToObj = function(root, children) {
	//copy all properties except path and id
	var extendData = function(obj1, obj2) {
		for (var key in obj2) {
			if(key !== "path" && key !== "id") {
				obj1[key] = obj2[key];
			}
		}
	}

	var parsedObj = {};
	extendData(parsedObj, root);

	for (var i = 0; i < children.length; i++) {
		//create array of nested object properties
		var childPath = children[i].path;
		childPath = childPath.replace(root.path, "");
		var pathArray = childPath.split("/");
		pathArray = pathArray.slice(1,pathArray.length-1);
		pathArray.push(children[i].id);

		//create nested objects and copy in properties in appropriate locations
		var currentPath = parsedObj;
		for (var j = 0; j < pathArray.length; j++) {
			if (!currentPath[pathArray[j]]) {
				currentPath[pathArray[j]] = {};
			}
			currentPath = currentPath[pathArray[j]];
		}
		extendData(currentPath, children[i]);
	}
	return parsedObj;
}

module.exports = parseToObj;