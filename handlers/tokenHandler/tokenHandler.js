// Dependencies
const { checkType, hash, randomKey, parsedJson } = require("../../helper/utilities"); // Data type validation function
const lib = require("../../lib/data"); // File operations library for reading/writing

// Handler for managing token-related operations
const handler = {};

// Main token handler function
// Routes the request based on the HTTP method (GET, POST, PUT, DELETE)
handler.tokenHandler = (requestObj, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.includes(requestObj.method)) {
    handler.token[requestObj.method](requestObj, callback);
  } else {
    callback(405, { message: "Method Not Allowed" });
  }
};

// Container for token sub-methods (GET, POST, PUT, DELETE)
handler.token = {};

// GET method for retrieving token details
handler.token.get = async (requestObj, callback) => {
  // Logic for fetching token data
};

// POST method for creating new tokens (authentication)
// Requires firstName, lastName, phone, password, and terms agreement in the request body
handler.token.post = async (requestObj, callback) => {
  const password = checkType(requestObj.body.password, "string", 6);
  const phone = checkType(requestObj.body.phone, "string", 8);

  if (password && phone) {
    lib.read("user", phone, (err, user) => {
      if (!err) {
        const hashedPassword = hash(password);
        if (hashedPassword === parsedJson(user).password) {
          const tokenId = randomKey(50);
          const expire = Date.now() + 60 * 60 * 1000;
          const tokenObject = {
            phone,
            expire,
            id: tokenId,
          };

          lib.create("token", tokenId, tokenObject, (err2) => {
            if (!err2) {
              callback(201, tokenObject);
            } else {
              callback(500, {
                text: "Server Problem",
              });
            }
          });
        } else {
          callback(404, {
            text: "Password not valid!!!",
          });
        }
      } else {
        callback(404, {
          text: "User Not Found!!!",
        });
      }
    });
  } else {
    callback(404, {
      text: "Not valid Info!!!",
    });
  }
};

// PUT method for updating token details
// Requires 'phone' to identify the user and allows updates to firstName, lastName, or password
handler.token.put = async (requestObj, callback) => {
  sendRes("Put", 201, callback);

  // Logic for updating token information
};

// DELETE method for removing a token/user
// Requires 'phone' in the request body to identify and delete the user
handler.token.delete = async (requestObj, callback) => {
  sendRes("Delete", 404, callback);

  // Logic for deleting a token
};

// function for watch method and send callback

function sendRes(method, statusCode, callback) {
  callback(statusCode, {
    text: `This is ${method} Method`,
  });
}
// Export the handler for use in other modules
module.exports = handler;
