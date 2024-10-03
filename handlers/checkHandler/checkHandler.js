const { parsedJson, checkType, randomKey } = require("../../helper/utilities");
const lib = require("../../lib/data");
const tokenHandler = require("../tokenHandler/tokenHandler");

const handler = {};

// Main user handler based on HTTP methods
handler.checkHandler = (requestObj, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.includes(requestObj.method)) {
    handler._checkHandler[requestObj.method](requestObj, callback);
  } else {
    callback(405, { message: "Method Not Accepted" });
  }
};

// Methods for GET, POST, PUT, DELETE
handler._checkHandler = {};

handler._checkHandler.get = (requestObj, callback) => {
  const checkId = checkType(requestObj.queryString.id, "string", 20);
  const tokenId = checkType(requestObj.header.tokenid, "string", 30);
  lib.read("checks", checkId, (err, checkData) => {
    if (!err && checkData) {
      const checkObject = parsedJson(checkData);
      tokenHandler.verifyToken(tokenId, checkObject.phone, (res) => {
        if (res) {
          callback(200, checkObject);
        } else {
          callback(400, {
            error: "Token Expire!!!",
          });
        }
      });
    } else {
      callback(404, {
        error: err || "User Not Found",
      });
    }
  });
};

handler._checkHandler.post = (requestObj, callback) => {
  const protocol =
    checkType(requestObj.body.protocol, "string", 0) &&
    ["http", "https"].includes(requestObj.body.protocol)
      ? requestObj.body.protocol
      : false;
  const url = checkType(requestObj.body.url, "string", 0);
  const method =
    checkType(requestObj.body.method, "string", 0) &&
    ["get", "post", "put", "delete"].includes(requestObj.body.method)
      ? requestObj.body.method
      : false;
  const successCodes = Array.isArray(requestObj.body.successCodes)
    ? requestObj.body.successCodes
    : false;
  const timeOutSeconds =
    Number.isInteger(requestObj.body.timeOutSeconds) &&
    requestObj.body.timeOutSeconds >= 1 &&
    requestObj.body.timeOutSeconds <= 5
      ? requestObj.body.timeOutSeconds
      : false;

  if (protocol && url && method && successCodes && timeOutSeconds) {
    const tokenId = checkType(requestObj.header.tokenid, "string", 30);
    lib.read("token", tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = parsedJson(tokenData).phone;
        tokenHandler.verifyToken(tokenId, userPhone, (tokenRes) => {
          if (tokenRes) {
            lib.read("user", userPhone, (err2, userData) => {
              if (!err2 && userData) {
                const userObject = parsedJson(userData);
                const userChecks = Array.isArray(userObject.checks)
                  ? userObject.checks
                  : [];

                if (userChecks.length <= 5) {
                  const checkId = randomKey(30);
                  const checkObject = {
                    id: checkId,
                    protocol,
                    phone: userPhone,
                    url,
                    method,
                    successCodes,
                    timeOutSeconds,
                  };
                  lib.create("checks", checkId, checkObject, (err3) => {
                    if (!err3) {
                      userObject.checks = userChecks;
                      userObject.checks.push(checkObject);

                      lib.update("user", userPhone, userObject, (err4) => {
                        if (!err4) {
                          callback(201, {
                            userObject,
                          });
                        } else {
                          callback(500, {
                            error: err4,
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: err3,
                      });
                    }
                  });
                } else {
                  callback(403, { error: "Max checks exceeded" });
                }
              }
            });
          } else {
            callback(404, { error: "Login Session Over!!!" });
          }
        });
      } else {
        callback(404, { error: "User Not Found!" });
      }
    });
  } else {
    callback(400, { error: "Invalid Info!" });
  }
};

handler._checkHandler.put = (requestObj, callback) => {
  const checkId = checkType(requestObj.body.id, "string", 20);
  const tokenId = checkType(requestObj.header.tokenid, "string", 30);

  if (checkId && tokenId) {
    lib.read("checks", checkId, (err, checkData) => {
      if (!err && checkData) {
        const checkObject = parsedJson(checkData);
        tokenHandler.verifyToken(tokenId, checkObject.phone, (tokenRes) => {
          if (tokenRes) {
            // Extract new values from the request, allow partial updates
            const protocol =
              checkType(requestObj.body.protocol, "string", 0) &&
              ["http", "https"].includes(requestObj.body.protocol)
                ? requestObj.body.protocol
                : checkObject.protocol; // Use existing value if not provided
            const url = checkType(requestObj.body.url, "string", 0)
              ? requestObj.body.url
              : checkObject.url;
            const method =
              checkType(requestObj.body.method, "string", 0) &&
              ["get", "post", "put", "delete"].includes(requestObj.body.method)
                ? requestObj.body.method
                : checkObject.method;
            const successCodes = Array.isArray(requestObj.body.successCodes)
              ? requestObj.body.successCodes
              : checkObject.successCodes;
            const timeOutSeconds =
              Number.isInteger(requestObj.body.timeOutSeconds) &&
              requestObj.body.timeOutSeconds >= 1 &&
              requestObj.body.timeOutSeconds <= 5
                ? requestObj.body.timeOutSeconds
                : checkObject.timeOutSeconds;

            // Check if at least one value is updated
            if (
              protocol !== checkObject.protocol ||
              url !== checkObject.url ||
              method !== checkObject.method ||
              successCodes !== checkObject.successCodes ||
              timeOutSeconds !== checkObject.timeOutSeconds
            ) {
              // Update the check object
              const updatedCheck = {
                ...checkObject,
                protocol,
                url,
                method,
                successCodes,
                timeOutSeconds,
              };

              lib.update("checks", checkId, updatedCheck, (updateErr) => {
                if (!updateErr) {
                  callback(200, {
                    message: "Check updated successfully",
                    updatedCheck,
                  });
                } else {
                  callback(500, { error: "Failed to update check" });
                }
              });
            } else {
              callback(400, { error: "No new fields to update" });
            }
          } else {
            callback(403, { error: "Invalid or expired token" });
          }
        });
      } else {
        callback(404, { error: "Check not found" });
      }
    });
  } else {
    callback(400, { error: "Missing or invalid check ID or token ID" });
  }
};

handler._checkHandler.delete = (requestObj, callback) => {
  // Step 1: Extract and validate 'id' and 'tokenId'
  const id = checkType(requestObj.queryString.id, "string", 20);
  const tokenId = checkType(requestObj.header.tokenid, "string", 30);

  // Step 2: Check if 'id' and 'tokenId' are valid
  if (id && tokenId) {
    // Step 3: Read the check from the database
    lib.read("checks", id, (err, checksInfo) => {
      if (!err && checksInfo) {
        const checksObject = parsedJson(checksInfo);

        // Step 4: Verify token to make sure the user is authorized to delete
        tokenHandler.verifyToken(tokenId, checksObject.phone, (res) => {
          if (res) {
            // Step 5: Proceed with deletion of the check
            lib.delete("checks", id, (err2) => {
              if (!err2) {
                // Step 6: Fetch user data to remove the check from user's check list
                lib.read("user", checksObject.phone, (err3, userData) => {
                  if (!err3 && userData) {
                    const userObject = parsedJson(userData);
                    const userChecks = Array.isArray(userObject.checks)
                      ? userObject.checks
                      : [];

                    const checkIndex = userChecks.indexOf(id);
                    
                    if (checkIndex > -1) {
                      // Step 7: Remove check from user's checks array
                      userChecks.splice(checkIndex, 1);
                      userObject.checks = userChecks;

                      // Step 8: Update the user's record in the database
                      lib.update(
                        "user",
                        checksObject.phone,
                        userObject,
                        (updateErr) => {
                          if (!updateErr) {
                            callback(200, {
                              message: "Check deleted successfully",
                            });
                          } else {
                            callback(500, {
                              error: "Failed to update user data",
                            });
                          }
                        }
                      );
                    } else {
                      callback(404, {
                        error: "Check not found in user's account",
                      });
                    }
                  } else {
                    callback(500, {
                      error: "Failed to retrieve user data",
                    });
                  }
                });
              } else {
                callback(500, {
                  error: "Failed to delete check",
                });
              }
            });
          } else {
            callback(403, {
              error: "Unauthorized access. Token verification failed.",
            });
          }
        });
      } else {
        callback(404, {
          error: "Check not found",
        });
      }
    });
  } else {
    callback(400, {
      error: "Missing or invalid check ID or token ID",
    });
  }
};

module.exports = handler;
