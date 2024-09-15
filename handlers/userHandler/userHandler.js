const handler = {};

handler.userHandler = (requestObj, callback) => {
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.indexOf(requestObj.method) > -1) {
    handler._user[requestObj.method](requestObj, callback);
    callback(200, {
      message: `This is a Message From ${requestObj.method} method.`,
    });
  } else {
    callback(405, {
      message: "Method Not Accepted",
    });
  }
};

handler._user = {};

handler._user.get = (requestObj, callback) => {
  console.log(requestObj);
  console.log("This is get");
};

handler._user.post = (requestObj, callback) => {
  console.log(requestObj);
  console.log("This is post");
};

handler._user.put = (requestObj, callback) => {
  console.log("This is put");
};

handler._user.delete = (requestObj, callback) => {
  console.log("This is delete");
};

module.exports = handler;
