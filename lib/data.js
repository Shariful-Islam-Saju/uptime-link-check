const fs = require("fs");
const path = require("path");

const lib = {};

lib.baseDir = path.join(__dirname, "/../.data");

lib.create = (dir, file, data, callback) => {
  fs.open(lib.baseDir + "/" + dir + "/" + file + ".json", "wx", (err, fd) => {
    if (err) {
      callback(err);
      console.log("Could'n create a new file. It may already exit.");
    } else {
      console.log("File Create Sucessfully");
      const stringData = JSON.stringify(data);
      fs.writeFile(fd, stringData, (err2) => {
        if (err2) {
          callback(err2);
          console.log("Can't write ");
        } else {
          fs.close(fd, (err3) => {
            if (err3) {
              callback(err3);
              console.log("Can't close");
            }
          });
        }
      });
    }
  });
};

lib.read = (dir, file, callback) => {
  fs.open(lib.baseDir + "/" + dir + "/" + file + ".json", "r", (err, fd) => {
    if (err) {
      console.log("Can't open file");
      callback(err);
    } else {
      fs.readFile(fd, "utf-8", (err2, data) => {
        if (err2) {
          console.log("Can't open file");
          callback(err2);
        } else {
          console.log(data);
        }

        fs.close(fd, (err) => {});
      });
    }
  });
};

lib.update = (dir, file, data, callback) => {
  fs.open(lib.baseDir + "/" + dir + "/" + file + ".json", "r+", (err, fd) => {
    if (err) {
      callback(err);
    } else {
      const stringData = JSON.stringify(data);
      fs.ftruncate(fd, (err2) => {
        if (!err) {
          fs.writeFile(fd, stringData, (err2) => {
            if (err2) {
              callback(err2);
            } else {
            }
          });
        } else {
          callback(err2);
        }
      });
    }
  });
};



module.exports = lib;
