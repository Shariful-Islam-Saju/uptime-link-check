const http = require("http");
const handler = require("../helper/handleReqRes");

const server = {};
server.config = {
  PORT: 5000,
};

server.createServer = () => {
  const createServer = http.createServer(server.handleReqRes);
  createServer.listen(server.config.PORT, () => {
    console.log(`Listening to Port Server ${server.config.PORT}`);
  });
};

server.handleReqRes = handler.handleReqRes;

module.exports = server;
