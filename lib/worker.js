const { parsedJson } = require("../helper/utilities");
const lib = require("./data");
const url = require("url");
const http = require("http");
const https = require("https");
const worker = {};

// Retrieves all checks and processes them
worker.getAllChecks = () => {
  lib.list("checks", (err, checks) => {
    if (err || !checks || checks.length === 0) {
      console.log(
        `Error retrieving checks or no checks found: ${
          err || "No checks available"
        }`
      );
      return;
    }

    // Iterate over each check, read and process it
    checks.forEach((element) => {
      lib.read("checks", element, (err2, checkData) => {
        if (err2 || !checkData) {
          console.log(`Error: Can't read check data for ${element}`);
          return; // Continue to the next check
        }

        const checkObject = parsedJson(checkData);
        if (checkObject) {
          worker.validateCheckData(checkObject); // Process the check if it's valid JSON
        } else {
          console.log(`Error: Unable to parse JSON for ${element}`);
        }
      });
    });
  });
};

// Validates check data before performing actions
worker.validateCheckData = (checkObject) => {
  if (!checkObject || !checkObject.id) {
    console.log("Check is invalid: missing essential data!");
    return;
  }

  const demoCheckObject = { ...checkObject };

  // Ensure state is either 'Up' or 'Down'
  demoCheckObject.state =
    typeof checkObject.state === "string" &&
    ["Up", "Down"].includes(checkObject.state)
      ? checkObject.state
      : "Down"; // Default to "Down" if invalid

  // Ensure checkTime is a valid number
  demoCheckObject.checkTime =
    typeof checkObject.checkTime === "number" && checkObject.checkTime > 0
      ? checkObject.checkTime
      : false; // Handle this appropriately in the `perform` function if required

  // Pass validated object to perform function
  worker.perform(demoCheckObject);
};

// Performs the main action (currently parsing and logging URLs)
worker.perform = (checkObject) => {
  const checkOutCome = {
    error: false,
    responseCode: false,
  };

  let outComeSent = false;

  
  if (!checkObject.protocol || !checkObject.url) {
    console.log("Invalid check data: missing protocol or URL.");
    return;
  }

  // Parse the URL
  const parsedUrl = url.parse(
    `${checkObject.protocol}://${checkObject.url}`,
    true
  );

  const path = parsedUrl.path;
  const hostName = parsedUrl.hostname;
  const requestObject = {
    protocol: checkObject.protocol + ":", // 'http:' or 'https:'
    hostname: hostName, // The hostname (e.g., 'www.example.com')
    path: path, // The URL path (e.g., '/api/resource')
    method: checkObject.method.toUpperCase(), // HTTP method (e.g., 'GET', 'POST')
    timeout: checkObject.timeOutSeconds * 1000, // Timeout in milliseconds
    headers: checkObject.headers || {}, // Optional headers
  };

  const protocolToUse = checkObject.protocol === "http" ? http : https;
  protocolToUse.request(requestObject, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("error", (e) => {
      console.log(e);
    });
    res.on("end", () => {
      console.log(res, data);
    });
  });
  // Here, you might want to actually make an HTTP request or ping, based on checkObject details.
};

// Runs the checks periodically
worker.loop = () => {
  setInterval(() => {
    worker.getAllChecks();
  }, 1000 * 60); // Run every minute
};

// Initialize worker
worker.init = () => {
  worker.getAllChecks();
  worker.loop();
};

module.exports = worker;
