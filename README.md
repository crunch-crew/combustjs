<snippet>
  <content><![CDATA[
# ${1:CombustJS}

CombustJS is a noBackend framework that mimics Firebase behavior. It allows developers to create real-time (push-based), persistent applications without writing a line of back-end code.

## Installation

TODO: Describe the installation process
1) [Install RethinkDB] (http://rethinkdb.com/docs/install/)
2) Install the CombustJS NPM module - `npm install --save combust-js`
3) Install the Express NPM module - `npm install --save express`
4) Create a server.js file

```javascript
var express = require('express');
var combust = require('./index');
var port = process.env.port || 3000;
var app = express();
var server = combust(app, port);
```
## Usage

1) Run RethinkDB by navigating to the directory where you want date to be stored and executing `rethinkdb`
2) Run the server using node `node server.js`

Thats it! You can start writing applications that interact with the server using the CombustJS client library (insert bower / getting started instructions here)

## Testing

Make sure RethinkDB and the Node server are running, then navigate to node_modules/combust-js and execute `npm test`

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## Credits

Primary Authors:
1) Richard Artoul
2) Kuldeep Dhanjal
3) Alex Mendez
4) Jack Zhang

## License
MIT

]]></content>
  <tabTrigger>readme</tabTrigger>
</snippet>
