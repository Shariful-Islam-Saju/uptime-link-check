// Dependencies
const { hash } = require("../../helper/utilities");
const { checkType } = require("../../helper/utilities");
const lib = require("../../lib/data");

// Handler object
const handler = {};

// Main user handler function
handler.userHandler = (requestObj, callback) => {
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.indexOf(requestObj.method) > -1) {
    handler._user[requestObj.method](requestObj, callback);
  } else {
    callback(405, {
      message: "Method Not Accepted",
    });
  }
};

// Container for the user sub-methods
handler._user = {};

// GET method for users
handler._user.get = (requestObj, callback) => {
  callback(200, {
    message: "This is GET method",
  });
};

// POST method for users (create new user)
handler._user.post = (requestObj, callback) => {
  const firstName = checkType(requestObj.body.firstName, "string", 0);
  const lastName = checkType(requestObj.body.lastName, "string", 0);
  const phone = checkType(requestObj.body.phone, "string", 10);
  const password = checkType(requestObj.body.password, "string", 4);
  const terms = requestObj.body.terms;

  // Ensure all fields are present
  if (firstName && lastName && phone && password && terms) {
    // Check if user already exists
    lib.read("user", phone, (err) => {
      if (err) {
        const userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
        };
        // Create a new user
        lib.create("user", phone, userObject, (err2) => {
          if (err2) {
            callback(500, {
              message: "Couldn't create file.",
            });
          } else {
            callback(200, {
              message: "User created successfully",
            });
          }
        });
      } else {
        callback(400, {
          message: "User already exists",
        });
      }
    });
  } else {
    callback(400, {
      message: "Missing required fields",
    });
  }
};

// PUT method for users (update existing user)
handler._user.put = (requestObj, callback) => {
  callback(501, {
    message: "PUT method not implemented",
  });
};

// DELETE method for users (delete existing user)
handler._user.delete = (requestObj, callback) => {
  callback(501, {
    message: "DELETE method not implemented",
  });
};

// Export the handler
module.exports = handler;
