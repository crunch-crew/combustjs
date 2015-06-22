var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');

exports.setup = function(socket) {
	/**
	*@apiGroup subscribeUrlValue
	*@apiName subscribeUrlValue
	*@api {socket} subscribeUrlValue Request to subscribe to value changed events for a specific url
	*
	*@apiParam {Object} ValueRequest An object that contains url as a property
	*@apiParam {String} ValueRequest.url A string that specifies which url to listen for changed value on
	*@apiSuccess ([path]-subscribeUrlValueSuccess) {Object} successObject object that indicates the url subscription was made
	*@apiSuccess ([path]-subscribeUrlValueSuccess) {boolean} successObject.success A boolean value indicating if the subscription was successful
	*/
	socket.on('subscribeUrlValue', function(valueRequest) {
		socket.join(valueRequest.url + "-" + "value");
		socket.emit(valueRequest.url + "-subscribeUrlValueSuccess", {success: true});
	});

	/**
	*@apiGroup subscribeUrlChildAdd
	*@apiName subscribeUrlChildAdd
	*@api {socket} subscribeUrlChildAdd Request to subscribe to child added events for a specific url
	*
	*@apiParam {Object} childAddRequest An object that contains url as a property
	*@apiParam {String} childAddRequest.url A string that specifies which url to listen for added children on
	*@apiSuccess ([path]-subscribeUrlChildAddSuccess) {Object} successObject object that indicates the url subscription was made
	*@apiSuccess ([path]-subscribeUrlChildAddSuccess) {boolean} successObject.success A boolean value indicating if the subscription was successful
	*/
	socket.on('subscribeUrlChildAdd', function(childAddRequest) {
		socket.join(childAddRequest.url + "-" + "childadd");
		socket.emit(childAddRequest.url + "-subscribeUrlChildAddSuccess", {success: true});
	});

	/**
	*@apiGroup subscribeUrlChildRemove
	*@apiName subscribeUrlChildRemove
	*@api {socket} subscribeUrlChildRemove Request to subscribe to child removed events for a specific url
	*
	*@apiParam {Object} ChildRemoveRequest An object that contains url as a property
	*@apiParam {String} ChildRemoveRequest.url A string that specifies which url to listen for removed children on
	*@apiSuccess ([path]-subscribeUrlChildRemoveSuccess) {Object} successObject object that indicates the url subscription was made
	*@apiSuccess ([path]-subscribeUrlChildRemoveSuccess) {boolean} successObject.success A boolean value indicating if the subscription was successful
	*/
	socket.on('subscribeUrlChildRemove', function(childRemoveRequest) {
		socket.join(childRemoveRequest.url + "-" + "childremove");
		socket.emit(childRemoveRequest.url + "-subscribeUrlChildRemoveSuccess", {success: true});
	});

	/**
	*@apiGroup subscribeUrlChildChange
	*@apiName subscribeUrlChildChange
	*@api {socket} subscribeUrlChildChange Request to subscribe to child changed events for a specific url
	*
	*@apiParam {Object} ChildChangeRequest An object that contains url as a property
	*@apiParam {String} ChildChangeRequest.url A string that specifies which url to listen for changed children on
	*@apiSuccess ([path]-subscribeUrlChildChangeSuccess) {Object} successObject object that indicates the url subscription was made
	*@apiSuccess ([path]-subscribeUrlChildChangeSuccess) {boolean} successObject.success A boolean value indicating if the subscription was successful
	*/
	socket.on('subscribeUrlChildChange', function(childChangeRequest) {
		socket.join(childChangeRequest.url + "-" + "childchange");
		socket.emit(childChangeRequest.url + "-subscribeUrlChildChangeSuccess", {success: true});
	});
}