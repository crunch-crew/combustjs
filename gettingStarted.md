# Getting started with CombustJS - Chat Application

1. [Install and Setup a CombustJS server](readme.md)
2. Use Bower to install the CombustJS client library - `bower install combust-js`
3. Create an index.html file with a simple input box, and add the CombustJS client library as a script tag, as well as a CDN for jquery and socketIO.

```html
<!doctype html>
<html>
  <head>
    <title>CombustJS Chat</title>
  </head>
  <body>
  <form action="" id="messageform">
    <input type="text" id="messageinput"></input>
    <input type="submit" value="submit"></input>
  </form>
  <script src="https://cdn.socket.io/socket.io-1.3.5.js"></script>
  <script src="./bower_components/combust-js/client/dist/Combust.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
  </body>
</html>
```

4. Add another script tag to the index.html file that contains the client-side code required to interact with the CombustJS server

```html
<script>
//Replaces this with the address/port of your Combust server
var serverAddress = 'http://localhost:3000';
//The second parameter to Combust is a callback that will be executed once a connection to the server has been established
var combustRef = new Combust({serverAddress: serverAddress});

var messagesRef = combustRef.child('messages').on('child_added', function(payload) {
  console.log(payload.val().msg);
});

$('#messageform').submit(function(event) {
  event.preventDefault(); 
  var newMessage = {msg: $('#messageinput').val()};
  messagesRef.push(newMessage);
});
</script>
```

5. Thats it! The final index.html code is below. Try opening it in multiple tabs! For a more advanced demonstration with authentication, checkout the demo application inside the CombustJS GitHub Repository.

```html
<!doctype html>
<html>
  <head>
    <title>CombustJS Chat</title>
  </head>
  <body>
  <form action="" id="messageform">
    <input type="text" id="messageinput"></input>
    <input type="submit" value="submit"></input>
  </form>
  <script src="https://cdn.socket.io/socket.io-1.3.5.js"></script>
  <script src="./bower_components/combust-js/client/dist/Combust.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
  <script>
    //Replaces this with the address/port of your Combust server
    var serverAddress = 'http://localhost:3000';
    //The second parameter to Combust is a callback that will be executed once a connection to the server has been established
    var combustRef = new Combust({serverAddress: serverAddress});

    var messagesRef = combustRef.child('messages').on('child_added', function(payload) {
      console.log(payload.val().msg);
    });

    $('#messageform').submit(function(event) {
      event.preventDefault(); 
      messagesRef.push({msg: $('#messageinput').val()});
    });
  </script>
  </body>
</html>
```