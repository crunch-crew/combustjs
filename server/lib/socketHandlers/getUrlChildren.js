var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');
var getQuery = require('../rethinkQuery/getQuery');

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
    var children = [];
    getQuery(getRequest.url, function(result) {
      //static property case - result is just a value
      if (!(result instanceof Object)) {
        socket.emit(getRequest.url + '-getUrlChildrenSuccess', null);
      }
      //non-static property case, result will be an object
      else {
        for(var key in result) {
          result.id = key; 
          children.push(result[key]);
        }
        socket.emit(getRequest.url + '-getUrlChildrenSuccess', children);
      }
    });
	});
};