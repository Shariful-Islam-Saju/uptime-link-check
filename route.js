const { sampleHandler } = require("./handlers/routeHanldlers/sampleHandler");
const { tokenHandler } = require("./handlers/tokenHandler/tokenHandler");
const { userHandler } = require("./handlers/userHandler/userHandler");

const route = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
};

module.exports = route;
