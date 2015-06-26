$(function() {
  var serverAddress = 'http://0.0.0.0:3000';
  var socket = io.connect(serverAddress, {'forceNew': false});

  var combust = new Combust({
    dbName: 'test',
    tableName: 'test',
    socket: socket,
    io: io,
    serverAddress: serverAddress
  });

  $('#signup_form').submit(function(event) {
    event.preventDefault();
    var newUser = {
      username: $('#username_input').val(),
      password: $('#password_input').val(),
      email: $('#email_input').val()
    };
    combust.newUser(newUser, function(response) {
      if (response.success) {
        alert("new user created!");
      }
      else {
        alert("new user was not created");
      }
    });
  });
});

