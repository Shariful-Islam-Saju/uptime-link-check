// Dependencies
const {
  checkType, // Utility function to check the data type and validate input
  hash, // Utility function to hash passwords
  randomKey, // Utility function to generate random keys
  parsedJson, // Utility function to safely parse JSON strings
} = require("../../helper/utilities"); // Importing utility functions from a helper module

const lib = require("../../lib/data"); // Importing a custom library for reading/writing to files (likely user and token data)

// Handler for managing token-related operations
const handler = {}; // Main handler object that will hold the token methods

// Main token handler function
// Routes the request based on the HTTP method (GET, POST, PUT, DELETE)
handler.tokenHandler = (requestObj, callback) => {
  // Define the allowed HTTP methods for this handler
  const acceptedMethods = ["get", "post", "put", "delete"];

  // If the request method is accepted, route to the corresponding method
  if (acceptedMethods.includes(requestObj.method)) {
    handler.token[requestObj.method](requestObj, callback);
  } else {
    // If the method is not allowed, respond with a 405 Method Not Allowed status
    callback(405, { error: "Method Not Allowed" });
  }
};

// Container for token sub-methods (GET, POST, PUT, DELETE)
handler.token = {};

// GET method for retrieving token details
handler.token.get = async (requestObj, callback) => {
  // Validate the token ID from the query string; should be a string of length 30
  const id = checkType(requestObj.queryString.id, "string", 30);

  if (id) {
    // Fetch the token data using the ID
    lib.read("token", id, (err, data) => {
      if (err) {
        // If an error occurs, return the error message from the err parameter
        callback(404, { error: err });
      } else {
        // If token data is found, return it
        callback(200, parsedJson(data)); // Return the parsed JSON data
      }
    });
  } else {
    // If the ID is not valid, return a 400 Bad Request error
    callback(400, { error: "Not valid URL" });
  }
};

// POST method for creating new tokens (authentication)
// Requires phone and password in the request body for authentication
handler.token.post = async (requestObj, callback) => {
  // Validate the phone number and password from the request body
  const password = checkType(requestObj.body.password, "string", 6);
  const phone = checkType(requestObj.body.phone, "string", 8);

  if (password && phone) {
    // Check if the user exists by reading the user data using the phone number
    lib.read("user", phone, (err, user) => {
      if (!err) {
        // Hash the provided password for comparison
        const hashedPassword = hash(password);

        // Compare the hashed password with the stored password
        if (hashedPassword === parsedJson(user).password) {
          // If the password matches, generate a new token
          const tokenId = randomKey(50); // Generate a random token ID
          const expire = Date.now() + 60 * 60 * 1000; // Token expiry time (1 hour from now)
          const tokenObject = {
            phone, // Store the phone number
            expire, // Store the expiration time
            id: tokenId, // Store the token ID
          };

          // Create the token and save it to the file system
          lib.create("token", tokenId, tokenObject, (err2) => {
            if (!err2) {
              // If token creation succeeds, return a 201 Created status with the token object
              callback(201, tokenObject);
            } else {
              // If there's an error creating the token, return the error from err2
              callback(500, { error: err2 });
            }
          });
        } else {
          // If the password does not match, return a 400 Bad Request error
          callback(400, { error: "Password not valid" });
        }
      } else {
        // If the user is not found, return the error from err
        callback(404, { error: err });
      }
    });
  } else {
    // If the phone or password are invalid, return a 400 Bad Request error
    callback(400, { error: "Not valid Info" });
  }
};

// PUT method for updating token details
// Requires 'id' and 'extend' boolean in the request body to extend the token expiry time
handler.token.put = async (requestObj, callback) => {
  const id = checkType(requestObj.body.id, "string", 30);
  const extend = checkType(requestObj.body.extend, "boolean", 0);
  if (id && extend) {
    lib.read("token", id, (err, tokenData) => {
      if (!err) {
        const tokenObject = parsedJson(tokenData);
        if (tokenObject.expire > Date.now()) {
          tokenObject.expire = Date.now() + 60 * 60 * 1000;
          lib.update("token", id, tokenObject, (err2) => {
            if (!err2) {
              callback(201, tokenObject);
            } else {
              // Return the error message from err2
              callback(500, { error: err2 });
            }
          });
        } else {
          callback(400, { error: "Token Expired" });
        }
      } else {
        // Return the error message from err
        callback(404, { error: err });
      }
    });
  } else {
    callback(400, { error: "Not valid Info" });
  }
};

// DELETE method for removing a token/user (currently a placeholder)
handler.token.delete = async (requestObj, callback) => {
  const id = checkType(requestObj.queryString.id, "string", 30);
  lib.delete("token", id, (err) => {
    if (!err) {
      callback(200, {
        message: "Token Deleted SuccessFully",
      });
    } else {
      callback(500, {
        error: err || "File Not Deleted",
      });
    }
  });
};

// Utility function for sending placeholder responses
function sendRes(method, statusCode, callback) {
  // Send a response indicating which HTTP method was called
  callback(statusCode, {
    error: `This is ${method} Method`, // Placeholder error message
  });
}

// Export the handler for use in other modules
module.exports = handler;
