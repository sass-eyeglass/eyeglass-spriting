var RSVP = require('rsvp');

var promise = new RSVP.Promise(function(resolve, reject) {
  // succeed
  resolve(value);
  // or reject
  reject(error);
});

promise.then(function(value) {
  // success
}, function(value) {
  // failure
});