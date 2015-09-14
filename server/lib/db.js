var r = require('rethinkdbdash')({
  pool: true,
  cursor: false
});
module.exports = r;