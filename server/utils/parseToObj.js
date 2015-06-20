var parseToObj = function(root, children) {
	//copy all properties except path and id
	var extendObj = function(obj1, obj2) {	
	// console.log(obj1);	
		for (var key in obj2) {
			// console.log('outside', key);
			if(key !== "path" && key !== "_id" && key !== "id" && key !== "_length" && key !== "_isArray" && key !== "_partArray") {
				// console.log('inside', key);
				obj1[key] = obj2[key];
			}
		}
	};

	var parsedObj = {};
	extendObj(parsedObj, root);

	for (var i = 0; i < children.length; i++) {
		//create array of nested object properties
		var childPath = children[i].path;
		childPath = childPath.replace(root.path, "");
		var pathArray = childPath.split("/");
		pathArray = pathArray.slice(1,pathArray.length-1);
		pathArray.push(children[i]._id);
		// console.log(children[i]);
		// console.log(children[i]);
		//create nested objects and copy in properties in appropriate locations
		var currentPath = parsedObj;
		// console.log('path array', pathArray);
		for (var j = 0; j < pathArray.length; j++) {
			// console.log('children[i]',children[i]._partArray);
			// console.log('currentpath',currentPath[pathArray[j]]);
			if (!currentPath[pathArray[j]]) {
				// console.log('print', children[i] );
				if(j === pathArray.length - 2 && children[i]._partArray){
					currentPath[pathArray[j]] = [];
				}	
				else if(j === pathArray.length - 1 && children[i]._isArray) {
					// console.log('in here');
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
	// console.log('parsedOBJ', parsedObj.users.user.something);

	return parsedObj;
};

module.exports = parseToObj;