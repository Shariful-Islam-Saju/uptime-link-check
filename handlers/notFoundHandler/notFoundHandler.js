const handler = {};

handler.notFoundHandler = (requestObj, callback) => {
  callback(404, {
    massage: "Your Requested Object Was not Found!",
  });
};

module.exports = handler;
