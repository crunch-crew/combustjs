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

var parseToRows = function(obj, path, id) {
	var path = path || null;
	var id = id;
	var rows = [];

	var recurse = function(obj, path, id) {
		// var path = path || '/';
		var nonObjs = {};
		nonObjs.path = path;
		nonObjs.id = id;

		path = path + id + "/";

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

	recurse(obj,path, id);
	return rows;
}

module.exports = parseToRows;