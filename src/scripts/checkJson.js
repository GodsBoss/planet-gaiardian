var fs = require('fs');

fs.readFile(
  process.argv[2],
  function(err, data) {
    if (err) {
      throw err;
    }
    JSON.parse(data);
  }
);
