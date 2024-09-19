// Dependencies
const fs = require("fs"); // Node.js File System module for file operations
const path = require("path"); // Node.js Path module for handling file paths

// Container for the file system library
const lib = {};

// Define base directory for storing data (e.g., JSON files)
lib.baseDir = path.join(__dirname, "/../.data"); // Path to the ".data" folder for storing application data

/**
 * Create a new file and write data into it
 * @param {string} dir - The directory name (inside .data)
 * @param {string} file - The file name (without .json extension)
 * @param {object} data - The data to write into the file
 * @param {function} callback - The callback function to return error or success
 */
lib.create = (dir, file, data, callback) => {
  const filePath = `${lib.baseDir}/${dir}/${file}.json`;

  // Open the file for writing (fails if the file exists)
  fs.open(filePath, "wx", (err, fd) => {
    if (err) {
      return callback(
        `Error: Could not create file, it may already exist. ${err.message}`
      );
    }

    // Convert data to JSON string
    const stringData = JSON.stringify(data);

    // Write the stringified data to the file
    fs.writeFile(fd, stringData, (err2) => {
      if (err2) {
        return callback(`Error writing to new file: ${err2.message}`);
      }

      // Close the file
      fs.close(fd, (err3) => {
        if (err3) {
          return callback(`Error closing the file: ${err3.message}`);
        }
        callback(null); // Success
      });
    });
  });
};

/**
 * Read data from an existing file
 * @param {string} dir - The directory name (inside .data)
 * @param {string} file - The file name (without .json extension)
 * @param {function} callback - The callback function to return error or the file data
 */
lib.read = (dir, file, callback) => {
  const filePath = `${lib.baseDir}/${dir}/${file}.json`;

  // Read the file content (assumes UTF-8 encoding)
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return callback(`Error reading file: ${err.message}`);
    }
    callback(null, data); // Return file data
  });
};

/**
 * Update an existing file with new data
 * @param {string} dir - The directory name (inside .data)
 * @param {string} file - The file name (without .json extension)
 * @param {object} data - The new data to write into the file
 * @param {function} callback - The callback function to return error or success
 */
lib.update = (dir, file, data, callback) => {
  const filePath = `${lib.baseDir}/${dir}/${file}.json`;

  // Open the file for reading and writing (fails if file doesn't exist)
  fs.open(filePath, "r+", (err, fd) => {
    if (err) {
      return callback(
        `Error: Could not open the file for updating. ${err.message}`
      );
    }

    const stringData = JSON.stringify(data);

    // Truncate the file to remove its contents before writing
    fs.ftruncate(fd, (err2) => {
      if (err2) {
        return callback(`Error truncating the file: ${err2.message}`);
      }

      // Write the new data to the file
      fs.writeFile(fd, stringData, (err3) => {
        if (err3) {
          return callback(`Error writing to the file: ${err3.message}`);
        }

        // Close the file after updating
        fs.close(fd, (err4) => {
          if (err4) {
            return callback(`Error closing the file: ${err4.message}`);
          }
          callback(null); // Success
        });
      });
    });
  });
};

/**
 * Delete a file from the file system
 * @param {string} dir - The directory name (inside .data)
 * @param {string} file - The file name (without .json extension)
 * @param {function} callback - The callback function to return error or success
 */
lib.delete = (dir, file, callback) => {
  const filePath = `${lib.baseDir}/${dir}/${file}.json`;

  // Delete the file
  fs.unlink(filePath, (err) => {
    if (err) {
      return callback(`Error deleting the file: ${err.message}`);
    }
    callback(null, "File deleted successfully."); // Success
  });
};

// Export the library module
module.exports = lib;
