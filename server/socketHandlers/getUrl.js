var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var dbQuery = require('../utils/dbQuery');
var config = require('../config');
var checkPermissions = require('../utils/checkPermissions');
var permitRequest = require('../utils/permitRequest');

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
		permitRequest("read", getRequest.url, socket.userToken, function(permission) {
			if (permission) {
				dbQuery('get', getRequest.url, function(parsedObj) {
					socket.emit(getRequest.url + '-getSuccess', {success: true, data: parsedObj});
				});
			}
			else {
				socket.emit(getRequest.url + '-getSuccess', {success: false});
			}
		});
	});
}