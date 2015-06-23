define({ "api": [
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p> "
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "server/doc/main.js",
    "group": "_Users_Alex_Desktop_combustjs_server_doc_main_js",
    "groupTitle": "_Users_Alex_Desktop_combustjs_server_doc_main_js",
    "name": ""
  },
  {
    "group": "getUrlChildren",
    "name": "getUrlChildren",
    "type": "socket",
    "url": "getUrlChildren",
    "title": "Request an array of the javascript objects that are children of the specified url",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "getUrlChildrenRequest",
            "description": "<p>An object that contains url as a property</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "getUrlChildren.url",
            "description": "<p>A string that specifies which url to return the children of</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "getUrlChildrenSuccess": [
          {
            "group": "getUrlChildrenSuccess",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "getUrlChildrenSuccessObject",
            "description": "<p>A javascript object that contains the children array</p> "
          },
          {
            "group": "getUrlChildrenSuccess",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "getUrlChildrenSuccessObject.children",
            "description": "<p>Array of javascript objects that represent the children of the specified url</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/socketHandlers/getUrlChildren.js",
    "groupTitle": "getUrlChildren"
  },
  {
    "group": "getUrl",
    "name": "getUrl",
    "type": "socket",
    "url": "getUrl",
    "title": "Request a javascript object based on a specified url",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "getUrlRequest",
            "description": "<p>An object that contains url as a property</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "getUrl.url",
            "description": "<p>A string that specifies which url to return the javascript object for</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "getSuccess": [
          {
            "group": "getSuccess",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "getSuccessObject",
            "description": "<p>Javascript object that represents the requested url</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/socketHandlers/getUrl.js",
    "groupTitle": "getUrl"
  },
  {
    "group": "push",
    "name": "push",
    "type": "socket",
    "url": "push",
    "title": "Add a javascript object as a new child at the specified url",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "pushRequest",
            "description": "<p>An object that contains path and data as properties</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "pushRequest.path",
            "description": "<p>A string that specifies which path to add the javascript object as a child of</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "pushRequest.data",
            "description": "<p>A javascript object to add as a child at the specified path</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "childAddSuccess": [
          {
            "group": "childAddSuccess",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "childAddSuccessObject",
            "description": "<p>The javascript object that was added as a child to the specified url</p> "
          }
        ],
        "pushSuccess": [
          {
            "group": "pushSuccess",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "pushSuccessObject",
            "description": "<p>Javascript object that contains the generated key</p> "
          },
          {
            "group": "pushSuccess",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "pushSuccessObject.key",
            "description": "<p>The key generated by the database for the newly pushed item</p> "
          },
          {
            "group": "pushSuccess",
            "type": "<p>Boolean</p> ",
            "optional": false,
            "field": "pushSuccessObject.created",
            "description": "<p>Boolean value indicating where the push was successful</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/socketHandlers/push.js",
    "groupTitle": "push"
  },
  {
    "group": "set",
    "name": "set",
    "type": "socket",
    "url": "set",
    "title": "Sets a javascript object at the specified url",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "setRequest",
            "description": "<p>An object that contains path, _id, and data as properties</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "setRequest._id",
            "description": "<p>A string that specifies the key of the javascript object</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "setRequest.path",
            "description": "<p>A string that specifies which path to add the javascript object as a child of</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "setRequest.data",
            "description": "<p>A javascript object to add as a child at the specified path</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/socketHandlers/set.js",
    "groupTitle": "set"
  },
  {
    "group": "subscribeUrlChildAdd",
    "name": "subscribeUrlChildAdd",
    "type": "socket",
    "url": "subscribeUrlChildAdd",
    "title": "Request to subscribe to child added events for a specific url",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "childAddRequest",
            "description": "<p>An object that contains url as a property</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "childAddRequest.url",
            "description": "<p>A string that specifies which url to listen for added children on</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "[path]-subscribeUrlChildAddSuccess": [
          {
            "group": "[path]-subscribeUrlChildAddSuccess",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "successObject",
            "description": "<p>object that indicates the url subscription was made</p> "
          },
          {
            "group": "[path]-subscribeUrlChildAddSuccess",
            "type": "<p>boolean</p> ",
            "optional": false,
            "field": "successObject.success",
            "description": "<p>A boolean value indicating if the subscription was successful</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/socketHandlers/subscribeUrl.js",
    "groupTitle": "subscribeUrlChildAdd"
  },
  {
    "group": "subscribeUrlChildChange",
    "name": "subscribeUrlChildChange",
    "type": "socket",
    "url": "subscribeUrlChildChange",
    "title": "Request to subscribe to child changed events for a specific url",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "ChildChangeRequest",
            "description": "<p>An object that contains url as a property</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "ChildChangeRequest.url",
            "description": "<p>A string that specifies which url to listen for changed children on</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "[path]-subscribeUrlChildChangeSuccess": [
          {
            "group": "[path]-subscribeUrlChildChangeSuccess",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "successObject",
            "description": "<p>object that indicates the url subscription was made</p> "
          },
          {
            "group": "[path]-subscribeUrlChildChangeSuccess",
            "type": "<p>boolean</p> ",
            "optional": false,
            "field": "successObject.success",
            "description": "<p>A boolean value indicating if the subscription was successful</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/socketHandlers/subscribeUrl.js",
    "groupTitle": "subscribeUrlChildChange"
  },
  {
    "group": "subscribeUrlChildRemove",
    "name": "subscribeUrlChildRemove",
    "type": "socket",
    "url": "subscribeUrlChildRemove",
    "title": "Request to subscribe to child removed events for a specific url",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "ChildRemoveRequest",
            "description": "<p>An object that contains url as a property</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "ChildRemoveRequest.url",
            "description": "<p>A string that specifies which url to listen for removed children on</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "[path]-subscribeUrlChildRemoveSuccess": [
          {
            "group": "[path]-subscribeUrlChildRemoveSuccess",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "successObject",
            "description": "<p>object that indicates the url subscription was made</p> "
          },
          {
            "group": "[path]-subscribeUrlChildRemoveSuccess",
            "type": "<p>boolean</p> ",
            "optional": false,
            "field": "successObject.success",
            "description": "<p>A boolean value indicating if the subscription was successful</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/socketHandlers/subscribeUrl.js",
    "groupTitle": "subscribeUrlChildRemove"
  },
  {
    "group": "subscribeUrlValue",
    "name": "subscribeUrlValue",
    "type": "socket",
    "url": "subscribeUrlValue",
    "title": "Request to subscribe to value changed events for a specific url",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "ValueRequest",
            "description": "<p>An object that contains url as a property</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "ValueRequest.url",
            "description": "<p>A string that specifies which url to listen for changed value on</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "[path]-subscribeUrlValueSuccess": [
          {
            "group": "[path]-subscribeUrlValueSuccess",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "successObject",
            "description": "<p>object that indicates the url subscription was made</p> "
          },
          {
            "group": "[path]-subscribeUrlValueSuccess",
            "type": "<p>boolean</p> ",
            "optional": false,
            "field": "successObject.success",
            "description": "<p>A boolean value indicating if the subscription was successful</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/socketHandlers/subscribeUrl.js",
    "groupTitle": "subscribeUrlValue"
  }
] });
