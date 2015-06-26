$(function() {
  var serverAddress = 'http://0.0.0.0:3000';
  var combust = new Combust({
      dbName: 'test',
      tableName: 'test',
      serverAddress: serverAddress
  });
  var userId;
  $('#login_form').submit(function(event) {
    event.preventDefault();
    var user= {
      username: $('#username_input').val(),
      password: $('#password_input').val(),
      email: $('#email_input').val()
    };
    combust.authenticate(user, function(response) {
      if (response.success) {
        userId = response.id;
        startApp(response.token);
      }
      else {
        alert("new user was not created");
      }
    });
  });

  var startApp = function(token) {
    var socket = io.connect(serverAddress, {
      query: "query=" + token
    });

    var combust = new Combust({
      dbName: 'test',
      tableName: 'test',
      socket: socket,
      io: io,
      serverAddress: serverAddress
    });

    var counter = 0;
    combust.on("child_added", function(newChild) {
      $('#chatbox').prepend("<div>" + newChild.userId + ": " + newChild.msg + "</div>");
      console.log(counter++);
    });

    $('#chat_form').submit(function(event) {
      var input = $('#message_input');
      var message = input.val();
      event.preventDefault();
      combust.push({msg: message, userId:userId});
      input.val("");
    });
  }
});

