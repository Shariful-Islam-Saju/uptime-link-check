const handler = {};

handler.userHandler = (requestObj, callback) => {
  callback(200, {
    message: "This is a Message From UserHanlder",
  });
};

module.exports = handler;
