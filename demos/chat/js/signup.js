$(function() {
  var serverAddress = 'http://0.0.0.0:3000';

  var combust = new Combust({
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
        window.location.replace('./index.html');
      }
      else {
        alert("new user was not created");
      }
    });
  });
});

