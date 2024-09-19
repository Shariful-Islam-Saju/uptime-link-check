// Dependencies
const fs = require("fs"); // File system module for interacting with the file system
const path = require("path"); // Path module for handling and transforming file paths

// Container for the library
const lib = {};

// Base directory for the data folder
lib.baseDir = path.join(__dirname, "/../.data"); // Path to the data folder for storing JSON files

// Create a new file with data
lib.create = (dir, file, data, callback) => {
  // Open the file for writing and ensure it doesn't already exist ("wx" flag)
  fs.open(lib.baseDir + "/" + dir + "/" + file + ".json", "wx", (err, fd) => {
    if (err) {
      // If there is an error (e.g., file already exists), callback with no success
      callback();
    } else {
      // Convert the data to a string
      const stringData = JSON.stringify(data);

      // Write the string data to the file
      fs.writeFile(fd, stringData, (err2) => {
        if (err2) {
          callback(err2);
        } else {
          // Close the file after writing
          fs.close(fd, (err3) => {
            if (err3) {
              callback(err3);
            } else {
              // If no errors, the operation was successful
              callback();
            }
          });
        }
      });
    }
  });
};

// Read data from an existing file
lib.read = (dir, file, callback) => {
  // Open the file for reading ("r" flag)
  fs.open(lib.baseDir + "/" + dir + "/" + file + ".json", "r", (err, fd) => {
    if (err) {
      callback(err);
    } else {
      // Read the file content
      fs.readFile(fd, "utf-8", (err2, data) => {
        if (err2) {
          callback(err2);
        }

        // Close the file after reading
        fs.close(fd, (err3) => {
          if (err3) {
            callback(err3);
          } else {
            callback(null, data); // Return the file data if successful
          }
        });
      });
    }
  });
};

// Update the content of an existing file
lib.update = (dir, file, data, callback) => {
  // Open the file for reading and writing ("r+" flag)
  fs.open(lib.baseDir + "/" + dir + "/" + file + ".json", "r+", (err, fd) => {
    if (err) {
      callback(err);
    } else {
      const stringData = JSON.stringify(data);

      // Truncate the file to empty it before writing
      fs.ftruncate(fd, (err2) => {
        if (!err2) {
          // Write the new data to the file
          fs.writeFile(fd, stringData, (err2) => {
            if (err2) {
              callback(err2);
            } else {
              // Close the file after writing
              fs.close(fd, (err3) => {
                if (err3) {
                  callback(err3);
                } else {
                  callback(null, "File updated successfully.");
                }
              });
            }
          });
        } else {
          callback(err2);
        }
      });
    }
  });
};

// Delete a file
lib.delete = (dir, file, callback) => {
  // Unlink (delete) the file
  fs.unlink(lib.baseDir + "/" + dir + "/" + file + ".json", (err) => {
    if (err) {
      callback(err); // Error if file cannot be deleted
    } else {
      callback(null, "File deleted successfully."); // Success message if deleted
    }
  });
};

// Export the module
module.exports = lib;
