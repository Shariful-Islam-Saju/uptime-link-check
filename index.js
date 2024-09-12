const http = require("http");
const handler = require("./helper/handleReqRes");

const app = {};
app.config = {
  PORT: 5000,
};
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(app.config.PORT, () => {
    console.log(`Listening to Port ${app.config.PORT}`);
  });
};

app.handleReqRes = handler.handleReqRes;

app.createServer();
