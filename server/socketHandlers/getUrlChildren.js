var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');
var dbQuery = require('../utils/dbQuery');

exports.setup = function(socket) {
	/**
	*@apiGroup getUrlChildren
	*@apiName getUrlChildren
	*@api {socket} getUrlChildren Request an array of the javascript objects that are children of the specified url
	*
	*@apiParam {Object} getUrlChildrenRequest An object that contains url as a property
	*@apiParam {String} getUrlChildren.url A string that specifies which url to return the children of
	*@apiSuccess (getUrlChildrenSuccess) {Object} getUrlChildrenSuccessObject A javascript object that contains the children array
	*@apiSuccess (getUrlChildrenSuccess) {Array} getUrlChildrenSuccessObject.children Array of javascript objects that represent the children of the specified url
	*/
	socket.on('getUrlChildren', function(getRequest) {
    var childrens = [];
    dbQuery('get', getRequest, function(result) {
      for(var key in result) {
        var obj = {};
        obj[key] = result[key];
        childrens.push(obj);
      }
      socket.emit(getRequest.url + '-getUrlChildrenSuccess', childrens);
    });
	});
}