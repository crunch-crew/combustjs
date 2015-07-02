// $(function() {
  var serverAddress = 'http://0.0.0.0:3000';
  var userId;
  var combust;

var combust = new Combust({
  serverAddress: serverAddress
}, function(response) {
  if (response.success) {
    startApp();
  }
  else {
    window.location.replace('./signin.html');
  }
});

var startApp = function() {
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
