// Dependencies
const { hash, parsedJson, checkType } = require("../../helper/utilities"); // Helper functions for hashing and JSON parsing
const lib = require("../../lib/data"); // Library for file operations

// Handler object
const handler = {};

// Main user handler function
// This function checks if the requested HTTP method is valid and calls the appropriate sub-method
handler.checkHandler = (requestObj, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.includes(requestObj.method)) {
    handler._checkHandler[requestObj.method](requestObj, callback);
  } else {
    callback(405, { message: "Method Not Accepted" }); // 405 Method Not Allowed
  }
};

// Container for the user sub-methods (GET, POST, PUT, DELETE)
handler._checkHandler = {};

// GET method for users (retrieve user data)
// Requires 'phone' as a query parameter to fetch the user's data
handler._checkHandler.get = (requestObj, callback) => {
  testFunction("Get", callback);
};

handler._checkHandler.post = (requestObj, callback) => {
  const protocol =
    checkType(requestObj.body.protocol, "string", 0) &&
    ["http", "https"].indexOf(requestObj.body.protocol) > -1
      ? requestObj.body.protocol
      : false;

  const url = checkType(requestObj.body.url, "string", 0);
  const method =
    checkType(requestObj.body.method, "string", 0) &&
    ["get", "post", "put", "delete"].indexOf(requestObj.body.method) > -1
      ? requestObj.body.method
      : false;

  const successCodes =
    typeof requestObj.body.successCodes === "object" &&
    requestObj.body.successCodes instanceof Array
      ? requestObj.body.successCodes
      : false;

  const timeOutSeconds =
    typeof requestObj.body.timeOutSeconds === "number" &&
    requestObj.body.timeOutSeconds % 1 === 0 &&
    requestObj.body.timeOutSeconds >= 1 &&
    requestObj.body.timeOutSeconds <= 5
      ? requestObj.body.timeOutSeconds
      : false;
  callback(201, {
    protocol,
    method,
    successCodes,
    timeOutSeconds,
    url,
  });
};

// PUT method for users (update existing user)
// Requires phone to identify the user, and optionally allows updates to firstName, lastName, and password
handler._checkHandler.put = (requestObj, callback) => {
  testFunction("Put", callback);
};

// DELETE method for users (delete existing user)
// Requires phone in the request body to identify and delete the user
handler._checkHandler.delete = (requestObj, callback) => {
  testFunction("Delete", callback);
};

testFunction = (method, callback) => {
  callback(200, {
    text: `This is ${method} method!`,
  });
};
module.exports = handler;
