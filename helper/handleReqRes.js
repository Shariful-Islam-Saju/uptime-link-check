const url = require("url");
const { StringDecoder } = require("string_decoder");
const handler = {};

handler.handleReqRes = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathName = parsedUrl.pathname;
  const trimmedPath = pathName.replace(/^\/*|\/*$/g, "");
  const queryString = parsedUrl.query;
  const method = req.method.toLowerCase();
  const header = req.headers;
  const decoder = new StringDecoder("utf-8");
  let reqData = "";
  req.on("data", (buffer) => {
    reqData += decoder.write(buffer);
  });
  req.on("end", () => {
    reqData += decoder.end();
    res.write("This is From Server");
    res.end();
  });
};

module.exports = handler;
