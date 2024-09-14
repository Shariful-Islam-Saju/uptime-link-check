const url = require("url");
const { StringDecoder } = require("string_decoder");
const route = require("../route");
const {
  notFoundHandler,
} = require("../handlers/notFoundHandler/notFoundHandler");
const handler = {};

handler.handleReqRes = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathName = parsedUrl.pathname;
  const trimmedPath = pathName.replace(/^\/*|\/*$/g, "");
  const queryString = parsedUrl.query;
  const method = req.method.toLowerCase();
  const header = req.headers;
  const decoder = new StringDecoder("utf-8");
  const requestObj = {
    parsedUrl,
    pathName,
    trimmedPath,
    queryString,
    method,
    header,
  };
  const chosenRoute = route[trimmedPath] ? route[trimmedPath] : notFoundHandler;

  let reqData = "";
  req.on("data", (buffer) => {
    reqData += decoder.write(buffer);
  });
  req.on("end", () => {
    reqData += decoder.end();
    chosenRoute(requestObj, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 500;
      payload = typeof payload === "object" ? payload : {};
      const payloadString = JSON.stringify(payload);
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

module.exports = handler;
