$(function() {
  var serverAddress = 'http://0.0.0.0:3000';

  $('#signin_form').submit(function(event) {
    event.preventDefault();
    var userAuth = {
      username: $('#username_input').val(),
      password: $('#password_input').val(),
      email: $('#email_input').val()
    };
    var combust = new Combust({serverAddress: serverAddress, auth: userAuth}, function(response) {
      if (response.success) {
        window.location.replace('./index.html');
      }
      else {
        alert("bad credentials");
      }
    });
  });
});

