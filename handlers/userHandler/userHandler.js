const { checkType } = require("../../helper/utilities");
const lib = require("../../lib/data");

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
  const firstName = checkType(requestObj.body.firstName, "string", 0);
  const lastName = checkType(requestObj.body.lastName, "string", 0);
  const phone = checkType(requestObj.body.phone, "string", 10);
  const password = checkType(requestObj.body.password, "string", 4);
  const terms = requestObj.body.terms;

  if (firstName && lastName && phone && password && terms) {
    console.log(firstName, lastName, phone, password, terms);
  } else {
    callback(400, {
      message: "Information not Found",
    });
  }
};

handler._user.put = (requestObj, callback) => {
  console.log("This is put");
};

handler._user.delete = (requestObj, callback) => {
  console.log("This is delete");
};

module.exports = handler;
