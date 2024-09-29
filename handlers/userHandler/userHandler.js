// Dependencies
const { hash, parsedJson } = require("../../helper/utilities"); // Helper functions for hashing and JSON parsing
const { checkType } = require("../../helper/utilities"); // Function to validate data types
const lib = require("../../lib/data"); // Library for file operations
const tokenHandler = require("../tokenHandler/tokenHandler"); // Token verification handler

// Handler object
const handler = {};

// Main user handler function
// This function checks if the requested HTTP method is valid and calls the appropriate sub-method
handler.userHandler = (requestObj, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.includes(requestObj.method)) {
    handler._user[requestObj.method](requestObj, callback);
  } else {
    callback(405, { message: "Method Not Accepted" }); // 405 Method Not Allowed
  }
};

// Container for the user sub-methods (GET, POST, PUT, DELETE)
handler._user = {};

// GET method for users (retrieve user data)
// Requires 'phone' as a query parameter to fetch the user's data
handler._user.get = (requestObj, callback) => {
  const phone = checkType(requestObj.queryString.phone, "string", 10);
  const tokenId = checkType(requestObj.header.tokenid, "string", 30);

  if (phone) {
    tokenHandler.verifyToken(tokenId, phone, (isValidToken) => {
      if (isValidToken) {
        lib.read("user", phone, (err, data) => {
          if (err) {
            callback(404, { message: "User Not Found" }); // 404 Not Found
          } else {
            const user = parsedJson(data);
            delete user.password; // Remove password before sending response
            callback(200, { message: user }); // 200 OK
          }
        });
      } else {
        callback(403, { error: "Authentication Failure!!!" }); // 403 Forbidden
      }
    });
  } else {
    callback(400, { message: "Missing required phone number" }); // 400 Bad Request
  }
};

// POST method for users (create new user)
// Requires firstName, lastName, phone, password, and terms in the request body to create a user
handler._user.post = (requestObj, callback) => {
  const firstName = checkType(requestObj.body.firstName, "string", 0);
  const lastName = checkType(requestObj.body.lastName, "string", 0);
  const phone = checkType(requestObj.body.phone, "string", 10);
  const password = checkType(requestObj.body.password, "string", 4);
  const terms = requestObj.body.terms;

  if (firstName && lastName && phone && password && terms) {
    lib.read("user", phone, (err) => {
      if (err) {
        const userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password), // Hash the password before storing
          terms,
        };
        lib.create("user", phone, userObject, (err2) => {
          if (err2) {
            callback(500, { message: "Couldn't create user file" }); // 500 Internal Server Error
          } else {
            callback(201, { message: "User created successfully" }); // 201 Created
          }
        });
      } else {
        callback(409, { message: "User already exists" }); // 409 Conflict
      }
    });
  } else {
    callback(400, { message: "Missing required fields" }); // 400 Bad Request
  }
};

// PUT method for users (update existing user)
// Requires phone to identify the user, and optionally allows updates to firstName, lastName, and password
handler._user.put = (requestObj, callback) => {
  const phone = checkType(requestObj.body.phone, "string", 10);
  const tokenId = checkType(requestObj.header.tokenid, "string", 30);
  const firstName = checkType(requestObj.body.firstName, "string", 0);
  const lastName = checkType(requestObj.body.lastName, "string", 0);
  const password = checkType(requestObj.body.password, "string", 4);

  if (phone) {
    tokenHandler.verifyToken(tokenId, phone, (isValidToken) => {
      if (isValidToken) {
        lib.read("user", phone, (err, data) => {
          if (err) {
            callback(404, { message: "User Not Found" }); // 404 Not Found
          } else {
            const userData = parsedJson(data);
            if (firstName) userData.firstName = firstName;
            if (lastName) userData.lastName = lastName;
            if (password) userData.password = hash(password); // Hash new password

            lib.update("user", phone, userData, (err2) => {
              if (err2) {
                callback(500, { message: "Error updating the user" }); // 500 Internal Server Error
              } else {
                callback(200, { message: "User updated successfully" }); // 200 OK
              }
            });
          }
        });
      } else {
        callback(403, { error: "Authentication Failure!!!" }); // 403 Forbidden
      }
    });
  } else {
    callback(400, { message: "Missing required phone number" }); // 400 Bad Request
  }
};

// DELETE method for users (delete existing user)
// Requires phone in the request body to identify and delete the user
handler._user.delete = (requestObj, callback) => {
  const phone = checkType(requestObj.body.phone, "string", 10);
  const tokenId = checkType(requestObj.header.tokenid, "string", 30);

  if (phone) {
    tokenHandler.verifyToken(tokenId, phone, (isValidToken) => {
      if (isValidToken) {
        lib.delete("user", phone, (err) => {
          if (err) {
            callback(404, { message: "User Not Found" }); // 404 Not Found
          } else {
            callback(200, { message: "User deleted successfully" }); // 200 OK
          }
        });
      } else {
        callback(403, { error: "Authentication Failure!!!" }); // 403 Forbidden
      }
    });
  } else {
    callback(400, { message: "Missing required phone number" }); // 400 Bad Request
  }
};

// Export the handler for external use
module.exports = handler;
