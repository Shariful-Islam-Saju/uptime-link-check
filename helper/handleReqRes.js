// Dependencies
const url = require("url"); // Module for URL parsing
const { StringDecoder } = require("string_decoder"); // Module for decoding buffer streams
const route = require("../route"); // Importing route module
const {
  notFoundHandler,
} = require("../handlers/notFoundHandler/notFoundHandler"); // Importing the 404 handler
const { parsedJson } = require("./utilities"); // Utility function for parsing JSON

// Handler object
const handler = {};

// Main request and response handler
handler.handleReqRes = (req, res) => {
  // Parse the incoming URL
  const parsedUrl = url.parse(req.url, true);
  const pathName = parsedUrl.pathname; // Extract the pathname
  const trimmedPath = pathName.replace(/^\/*|\/*$/g, ""); // Trim slashes from the pathname
  const queryString = parsedUrl.query; // Get the query string parameters
  const method = req.method.toLowerCase(); // Get the HTTP method
  const header = req.headers; // Get the headers
  const decoder = new StringDecoder("utf-8"); // Initialize the string decoder

  // Create a request object to pass to the handler
  const requestObj = {
    parsedUrl, // Full parsed URL object
    pathName, // Raw pathname
    trimmedPath, // Trimmed path
    queryString, // Query parameters
    method, // HTTP method
    header, // HTTP headers
  };

  // Choose the appropriate route handler, or the 404 handler if no match
  const chosenRoute = route[trimmedPath] ? route[trimmedPath] : notFoundHandler;

  let reqData = "";

  // Handle incoming data (in case of POST/PUT with body)
  req.on("data", (buffer) => {
    reqData += decoder.write(buffer); // Decode buffer into a string
  });

  // When the request ends, process the full body
  req.on("end", () => {
    reqData += decoder.end(); // End the decoding

    // Parse the request body into JSON
    requestObj.body = parsedJson(reqData);

    // Call the chosen route handler with the request object
    chosenRoute(requestObj, (statusCode, payload) => {
      // Ensure the status code is valid, defaulting to 500 if not provided
      statusCode = typeof statusCode === "number" ? statusCode : 500;

      // Ensure the payload is an object, defaulting to an empty object if not
      payload = typeof payload === "object" ? payload : {};

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // Set the response header to JSON
      res.setHeader("Content-Type", "application/json");

      // Write the response with the status code
      res.writeHead(statusCode);

      // End the response with the payload
      res.end(payloadString);
    });
  });
};

// Export the handler
module.exports = handler;
