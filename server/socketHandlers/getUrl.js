var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var dbQuery = require('../utils/dbQuery');
var config = require('../config');

exports.setup = function(socket) {
	/**
	*@apiGroup getUrl
	*@apiName getUrl
	*@api {socket} getUrl Request a javascript object based on a specified url
	*
	*@apiParam {Object} getUrlRequest An object that contains url as a property
	*@apiParam {String} getUrl.url A string that specifies which url to return the javascript object for
	*@apiSuccess (getSuccess) {Object} getSuccessObject Javascript object that represents the requested url
	*/
	socket.on('getUrl', function(getRequest) {
		dbQuery('get', getRequest, function(parsedObj) {
			socket.emit(getRequest.url + "-getSuccess", parsedObj);
		})
	});
}