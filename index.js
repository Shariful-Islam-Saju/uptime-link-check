const server = require("./lib/server");
const worker = require("./lib/worker");

const app = {};

app.init = () => {
  server.createServer();
  worker.init();
};

app.init();
