const { sampleHandler } = require("./handlers/routeHanldlers/sampleHandler");
const { userHandler } = require("./handlers/userHandler/userHandler");

const route = {
  sample: sampleHandler,
  user:userHandler
};

module.exports = route