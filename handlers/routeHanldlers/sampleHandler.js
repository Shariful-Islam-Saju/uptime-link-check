const handler = {};

handler.sampleHandler = (requestObj, callback) => {
  callback(200, {
    message: "This is a Message From Callback",
  });
};

module.exports = handler;
