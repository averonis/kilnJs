var current = 21;
var targetTemp = 0;

var fs = require('fs'),
    readline = require('readline');

var rd = readline.createInterface({
    input: fs.createReadStream('./tmp.in'),
    output: process.stdout,
    console: false
});

exports.read = function () {
  return 16;
  // rd.on('line', function(line) {
  //   return line;
  // });
}; 

exports.set = function (t) {
  current = t;
  return current;
}; 


