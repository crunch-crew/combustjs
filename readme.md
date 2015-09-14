# CombustJS

CombustJS is a noBackend framework that mimics Firebase behavior. It allows developers to create real-time (push-based), persistent applications without writing a line of back-end code.

Check out our [chat application](gettingStarted.md) tutorial!

## Installation

1. [Install RethinkDB] (http://rethinkdb.com/docs/install/)
2. Use the RethinkDB GUI to create a database and table (name them whatever you want)
3. Modify config.js to point to the right database and tablename
4. Install the CombustJS NPM module - `npm install --save combust-js`
5. Install the Express NPM module - `npm install --save express`
6. Create a server.js file

```javascript
var express = require('express');
var combust = require('combust-js');
var port = process.env.port || 3000;
var app = express();
var server = combust(app, port);
```
## Usage

1) Run RethinkDB by navigating to the directory where you want data to be stored and executing `rethinkdb`
2) Run the server using node `node server.js`

Thats it! You can start writing applications that interact with the server using the CombustJS client library (insert bower / getting started instructions here)

## Testing

Make sure RethinkDB and the Node server are running, then navigate to node_modules/combust-js and execute `grunt test`

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## Credits

Primary Authors:
1. Richard Artoul
2. Kuldeep Dhanjal
3. Alex Mendez
4. Jack Zhang

## License
MIT
