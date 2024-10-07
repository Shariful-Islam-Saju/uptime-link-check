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
    value: "",
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

  // Define the request object
  const requestObject = {
    protocol: checkObject.protocol + ":", // 'http:' or 'https:'
    hostname: hostName, // The hostname (e.g., 'www.example.com')
    path: path, // The URL path (e.g., '/api/resource')
    method: (checkObject.method || "GET").toUpperCase(), // HTTP method (e.g., 'GET', 'POST'), default to 'GET'
    timeout: checkObject.timeOutSeconds * 1000, // Timeout in milliseconds
    headers: checkObject.headers || {}, // Optional headers
  };

  // Function to send the outcome of the check
  function outCome() {
    if (!outComeSent) {
      worker.processCheckOutCome(checkObject, checkOutCome);
      outComeSent = true;
    }
  }

  // Choose the correct protocol
  const protocolToUse = checkObject.protocol === "http" ? http : https;

  // Send the request
  const req = protocolToUse.request(requestObject, (res) => {
    let data = "";

    // Listen for data chunks from the response
    res.on("data", (chunk) => {
      data += chunk;
    });

    // Once the response ends, process it
    res.on("end", () => {
      checkOutCome.responseCode = res.statusCode; // Set the response code

      // Now that the request has ended, process the outcome
      outCome();
    });
  });

  // Handle request errors
  req.on("error", (e) => {
    checkOutCome.error = true; // Set error flag
    outCome(); // Process the outcome even if there's an error
  });

  // Handle timeout
  req.setTimeout(requestObject.timeout, () => {
    checkOutCome.error = true; // Set error flag
    checkOutCome.value = "Request timeout"; // Set timeout value
    req.abort(); // Abort the request
    outCome(); // Process the outcome
  });

  // End the request
  req.end();
};

// Runs the checks periodically
worker.loop = () => {
  setInterval(() => {
    worker.getAllChecks();
  }, 1000 * 60); // Run every minute
};

worker.processCheckOutCome = (checkObject, checkOutCome) => {
  console.log(checkObject);
  console.log(checkOutCome);
  const state =
    !checkOutCome.error &&
    checkOutCome.responseCode &&
    checkObject.successCodes.indexOf(checkOutCome.responseCode) > -1
      ? "Up"
      : "Down ";

  const alertWanted =
    checkObject.checkTime && checkObject.state !== state ? true : false;

  const newCheckData = { ...checkObject };
  newCheckData.state = state;
  newCheckData.checkTime = Date.now();

  lib.update("checks", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      console.log("Error Saving");
      return;
    }

    worker.alertUserCheck(newCheckData)
  });
};

// Initialize worker
worker.init = () => {
  worker.getAllChecks();
  worker.loop();
};

module.exports = worker;
