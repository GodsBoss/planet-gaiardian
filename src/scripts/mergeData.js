var fs = require('fs');

if (process.argv[2] === undefined || process.argv[3] === undefined) {
  console.log('Usage: node data.js <source> <target>');
  process.exit(1);
}

var SOURCE_DIR = process.argv[2];
var TARGET = process.argv[3];

function readDir(path) {
  return new Promise(function(resolve, reject){
    fs.readdir(
      path,
      function (err, files) {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      }
    );
  });
}

function parseFirstFile(files, levels, callback) {
  return new Promise(
    function (resolve, reject) {
      fs.readFile(
        SOURCE_DIR + '/' + files[0],
        function (err, contents) {
          if (err) {
            reject(err);
          } else {
            resolve(callback(files.slice(1), levels.concat([JSON.parse(contents)])));
          }
        }
      );
    }
  );
}

function writeData(levels) {
  return new Promise(
    function(resolve, reject) {
      fs.writeFile(
        TARGET,
        JSON.stringify({ levels: levels }),
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    }
  );
}

function read(files, levels) {
  if (files.length === 0) {
    return writeData(levels);
  } else {
    return parseFirstFile(files, levels, read);
  }
}

readDir(SOURCE_DIR).then(
  function (files) {
    return read(files, []);
  }
).catch(fail);

function fail(err) {
  console.log('Could not create game data:');
  console.log(err);
  process.exit(1);
}
