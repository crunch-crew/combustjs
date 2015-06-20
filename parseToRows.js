var obj = {
	users: {
		user1: {
			name: "richie"
		},
		user2: {
			name: "kuldeep"
		},
		user: {
			name: "jack"
		}
	},
	activated: true,
	messedUp: false,
	test: {
		array: [{test:"hello"}, {test:'world'}],
		name: "viable"
	}
}

var parseToRows = function(obj, path, _id) {
	var path = path || null;
	var _id = _id;
	var rows = [];

	var recurse = function(obj, path, _id) {
		// var path = path || '/';
		var nonObjs = {};
		nonObjs.path = path;
		nonObjs._id = _id;

		path = path + _id + "/";

		for (var key in obj) {
			if (typeof obj[key] === "object") {
				recurse(obj[key], path, key);
			}
			else if (typeof obj[key] === "function") {
				nonObjs[key] = JSON.stringify(obj[key]);
			}
			else {
				nonObjs[key] = obj[key];
			}
		}

		rows.push(nonObjs);
	}

	recurse(obj,path, _id);
	return rows;
}

module.exports = parseToRows;