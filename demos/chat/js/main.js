$(function() {
  var serverAddress = 'http://0.0.0.0:3000';
  var userId;
  var combust;
  $('#login_form').submit(function(event) {
    event.preventDefault();
    var user= {
      username: $('#username_input').val(),
      password: $('#password_input').val(),
      email: $('#email_input').val()
    };
    combust = new Combust({
        serverAddress: serverAddress,
        auth: user
    }, function(response) {
      if (response.success) {
        userId = response.id;
        alert("Successfully logged in!");
        startApp();
      }
      else {
        alert("invalid credentials");
      }
    });
  });

  var startApp = function(token) {
    var counter = 0;
    //won't need this once we update push to automatically create paths
    combust.update({'messages': {}});
    combust.child('messages').on("child_added", function(newChild) {
      $('#chatbox').prepend("<div>" + newChild.userId + ": " + newChild.msg + "</div>");
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

