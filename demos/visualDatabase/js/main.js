// $(function() {
  var startApp = function() {
    combust.on("value", function(data) {
      $('body').html("<div>" + JSON.stringify(data, null, 2) + "</div>");
    });

  }

  var serverAddress = 'http://0.0.0.0:3000';
  var combust = new Combust({
      serverAddress: serverAddress
  }, startApp);

// });

