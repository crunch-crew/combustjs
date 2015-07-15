# Getting started with CombustJS - Chat Application

1) Install and Setup a CombustJS server [insert link here]
2) Use Bower to install the CombustJS client library - `bower install combust-js`
3) Use Bower to install
3) Create an index.html file with a simple input box, and add the CombustJS minified client library as a script tag, as well as a CDN for jquery

```
<!doctype html>
<html>
  <head>
    <title>CombustJS Chat</title>
  </head>
  <body>
  <script src="./bower_components/combust-js/client/dist/combust.min.js>"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <form action="">
      <input type="text" id="messageinput"></input>
      <button>Send</button>
    </form>
  </body>
</html>
```

4) Add another script tag to the index.html file that contains the client-side code required to interact with the CombustJS server

```
<script>
//Replaces this with the address/port of your Combust server
var serverAddress = 'http://localhost:3000';
//The second parameter to Combust is a callback that will be executed once a connection to the server has been established
var combustRef = new Combust({serverAddress: serverAddress}, startApp);

var startApp = function() {
  var messagesRef = combustRef.child('messages').on('child_added', function(payload) {
    console.log(payload.val);
  });

  $('#messageinput').submit(function() {
    var newMessage = {msg: $('#messageinput').val()};
    messagesRef.push(newMessage);
  });
}
</script>
```

5) Thats it! The final index.html code is below. Try opening it in multiple tabs! For a more advanced demonstration with authentication, checkout the demo application inside the CombustJS GitHub Repository.

```
<!doctype html>
<html>
  <head>
    <title>CombustJS Chat</title>
  </head>
  <body>
  <script src="./bower_components/combust-js/client/dist/combust.min.js>"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
  <script>
    //Replaces this with the address/port of your Combust server
    var serverAddress = 'http://localhost:3000';
    //The second parameter to Combust is a callback that will be executed once a connection to the server has been established
    var combustRef = new Combust({serverAddress: serverAddress}, startApp);

    var startApp = function() {
      var messagesRef = combustRef.child('messages').on('child_added', function(payload) {
        console.log(payload.val);
      });

      $('#messageinput').submit(function() {
        var newMessage = {msg: $('#messageinput').val()};
        messagesRef.push(newMessage);
      });
    }
  </script>
  <form action="">
    <input type="text" id="messageinput"></input>
    <button>Send</button>
  </form>
  </body>
</html>
```