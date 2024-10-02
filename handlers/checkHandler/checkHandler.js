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
  testFunction("Put", callback);
};

handler._checkHandler.delete = (requestObj, callback) => {
  testFunction("Delete", callback);
};

const testFunction = (method, callback) => {
  callback(200, { text: `This is ${method} method!` });
};

module.exports = handler;
