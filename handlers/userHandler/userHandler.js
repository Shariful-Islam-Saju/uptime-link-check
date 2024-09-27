// Dependencies
const { hash, parsedJson } = require("../../helper/utilities"); // Helper functions for hashing and JSON parsing
const { checkType } = require("../../helper/utilities"); // Function to validate data types
const lib = require("../../lib/data"); // Library for file operations

// Handler object
const handler = {};

// Main user handler function
// This function checks if the requested HTTP method is valid and calls the appropriate sub-method
handler.userHandler = (requestObj, callback) => {
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.indexOf(requestObj.method) > -1) {
    handler._user[requestObj.method](requestObj, callback);
  } else {
    callback(405, {
      message: "Method Not Accepted", // 405 Method Not Allowed
    });
  }
};

// Container for the user sub-methods (GET, POST, PUT, DELETE)
handler._user = {};

// GET method for users (retrieve user data)
// Requires 'phone' as a query parameter to fetch the user's data
handler._user.get = async (requestObj, callback) => {
  const phone = checkType(requestObj.queryString.phone, "string", 10);

  if (phone) {
    // Fetch user data by phone number
    lib.read("user", phone, (err, data) => {
      if (err) {
        callback(404, {
          message: err.message || "User Not Found", // 404 Not Found
        });
      } else {
        // Parse the user data from JSON format
        const userWithPassword = parsedJson(data);

        // Remove the password field before returning the data
        delete userWithPassword.password;

        // Return the user object without the password
        callback(200, {
          message: userWithPassword, // 200 OK
        });
      }
    });
  } else {
    // If the phone number is missing, return a 400 error
    callback(400, {
      message: "Missing required phone number", // 400 Bad Request
    });
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

  // Ensure all required fields are present
  if (firstName && lastName && phone && password && terms) {
    // Check if the user already exists
    lib.read("user", phone, (err) => {
      if (err) {
        const userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password), // Hash the password before storing
          terms,
        };
        // Create a new user
        lib.create("user", phone, userObject, (err2) => {
          if (err2) {
            callback(500, {
              message: err2.message || "Couldn't create user file", // 500 Internal Server Error
            });
          } else {
            callback(201, {
              message: "User created successfully", // 201 Created
            });
          }
        });
      } else {
        // If the user already exists, return a 409 conflict
        callback(409, {
          message: "User already exists", // 409 Conflict
        });
      }
    });
  } else {
    // Return a 400 error if any required fields are missing
    callback(400, {
      message: "Missing required fields", // 400 Bad Request
    });
  }
};

// PUT method for users (update existing user)
// Requires phone to identify the user, and optionally allows updates to firstName, lastName, and password
handler._user.put = (requestObj, callback) => {
  const phone = checkType(requestObj.body.phone, "string", 10);

  // Ensure the phone number is present (required to identify the user)
  if (phone) {
    // Check for optional fields to update
    const firstName = checkType(requestObj.body.firstName, "string", 0);
    const lastName = checkType(requestObj.body.lastName, "string", 0);
    const password = checkType(requestObj.body.password, "string", 4);

    // Read the existing user data
    lib.read("user", phone, (err, data) => {
      if (err) {
        callback(404, {
          message: err.message || "User Not Found", // 404 Not Found
        });
      } else {
        // Parse the existing user data
        const userData = parsedJson(data);

        // Update only the fields that are provided
        if (firstName) userData.firstName = firstName;
        if (lastName) userData.lastName = lastName;
        if (password) userData.password = hash(password);

        // Save the updated user data
        lib.update("user", phone, userData, (err2) => {
          if (err2) {
            callback(500, {
              message: err2.message || "Error updating the user", // 500 Internal Server Error
            });
          } else {
            callback(200, {
              message: "User updated successfully", // 200 OK
            });
          }
        });
      }
    });
  } else {
    // If the phone number is missing, return a 400 error
    callback(400, {
      message: "Missing required phone number", // 400 Bad Request
    });
  }
};

// DELETE method for users (delete existing user)
// Requires phone in the request body to identify and delete the user
handler._user.delete = (requestObj, callback) => {
  const phone = checkType(requestObj.body.phone, "string", 10);

  if (phone) {
    // Delete user data by phone number
    lib.delete("user", phone, (err) => {
      if (err) {
        callback(404, {
          message: err.message || "User Not Found", // 404 Not Found
        });
      } else {
        callback(200, {
          message: "User deleted successfully", // 200 OK
        });
      }
    });
  } else {
    // If the phone number is missing, return a 400 error
    callback(400, {
      message: "Missing required phone number", // 400 Bad Request
    });
  }
};

// Export the handler for external use
module.exports = handler;
