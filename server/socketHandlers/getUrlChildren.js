var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');

exports.setup = function(socket) {
	/**
	*@apiGroup getUrlChildren
	*@apiName getUrlChildren
	*@api {socket} getUrlChildren Request an array of the javascript objects that are children of the specified url
	*
	*@apiParam {Object} getUrlChildrenRequest An object that contains url as a property
	*@apiParam {String} getUrlChildren.url A string that specifies which url to return the children of
	*@apiSuccess (getUrlChildrenSuccess) {Object} getUrlChildrenSuccessObject A javascript object that contains the children array
	*@apiSuccess (getUrlChildrenSuccess) {Object} getUrlChildrenSuccessObject.children Array of javascript objects that represent the children of the specified url
	*/
	socket.on('getUrlChildren', function(getRequest) {
		//when refering to "children", I think we're only intersted in children of a url that have been "pushed", keys that were "set" or pre-defined
		//probably shouldn't be returned. One way to handle this is to add a filter to teh query that sepcifies that _id should equal id (when things)
		//are added to the db using the push method, the _id field and id field equal each other
		//fill in here
	});
};