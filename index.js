const http = require("http");
const handler = require("./helper/handleReqRes");
const lib = require("./lib/data");

lib.update(
  "test",
  "newFile",
  { name: "Shariful Islam", age: 21, roll: 532420 },
  (err) => {
    console.log(err);
  }
);

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
