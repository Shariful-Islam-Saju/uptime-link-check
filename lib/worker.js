const { parsedJson } = require("../helper/utilities");
const lib = require("./data");
const url = require("url");
const http = require("http");
const https = require("https");
const notifications = require("../helper/notifications");
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

    checks.forEach((element) => {
      lib.read("checks", element, (err2, checkData) => {
        if (err2 || !checkData) {
          console.log(`Error: Can't read check data for ${element}`);
          return;
        }

        const checkObject = parsedJson(checkData);
        if (checkObject) {
          worker.validateCheckData(checkObject);
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

  demoCheckObject.state =
    typeof checkObject.state === "string" &&
    ["Up", "Down"].includes(checkObject.state)
      ? checkObject.state
      : "Down"; // Default to "Down" if invalid

  demoCheckObject.checkTime =
    typeof checkObject.checkTime === "number" && checkObject.checkTime > 0
      ? checkObject.checkTime
      : false;

  worker.perform(demoCheckObject);
};

// Performs the main action (currently parsing and logging URLs)
worker.perform = (checkObject) => {
  const checkOutCome = { error: false, responseCode: false, value: "" };
  let outComeSent = false;

  if (!checkObject.protocol || !checkObject.url) {
    console.log("Invalid check data: missing protocol or URL.");
    return;
  }

  const parsedUrl = url.parse(
    `${checkObject.protocol}://${checkObject.url}`,
    true
  );
  const path = parsedUrl.path;
  const hostName = parsedUrl.hostname;

  const requestObject = {
    protocol: checkObject.protocol + ":", // 'http:' or 'https:'
    hostname: hostName,
    path: path,
    method: (checkObject.method || "GET").toUpperCase(),
    timeout: checkObject.timeOutSeconds * 1000,
    headers: checkObject.headers || {},
  };

  function outCome() {
    if (!outComeSent) {
      worker.processCheckOutCome(checkObject, checkOutCome);
      outComeSent = true;
    }
  }

  const protocolToUse = checkObject.protocol === "http" ? http : https;

  const req = protocolToUse.request(requestObject, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      checkOutCome.responseCode = res.statusCode;
      outCome();
    });
  });

  req.on("error", (e) => {
    checkOutCome.error = true;
    outCome();
  });

  req.setTimeout(requestObject.timeout, () => {
    checkOutCome.error = true;
    checkOutCome.value = "Request timeout";
    req.abort();
    outCome();
  });

  req.end();
};

// Runs the checks periodically
worker.loop = () => {
  setInterval(() => {
    worker.getAllChecks();
  }, 1000 * 60); // Run every minute
};

worker.processCheckOutCome = (checkObject, checkOutCome) => {
  const state =
    !checkOutCome.error &&
    checkOutCome.responseCode &&
    checkObject.successCodes.indexOf(checkOutCome.responseCode) > -1
      ? "Up"
      : "Down";

  const alertWanted =
    checkObject.checkTime && checkObject.state !== state ? true : false;

  const newCheckData = { ...checkObject };
  newCheckData.state = state;
  newCheckData.checkTime = Date.now();

  lib.update("checks", newCheckData.id, newCheckData, (err) => {
    if (err) {
      console.log(err);
      return;
    }

    if (alertWanted) {
      worker.alertUserCheck(newCheckData);
    }
  });
};

// Sends an SMS notification via Twilio when a check changes state
worker.alertUserCheck = (checkObject) => {
  const msg = `Your check for ${checkObject.method.toUpperCase()} ${
    checkObject.protocol
  }://${checkObject.url} is currently ${checkObject.state}.`;

  notifications.sendTwilioSms(checkObject.phone, msg, (error, info) => {
    if (error) {
      console.log(error);
      return;
    }
  });
};

// Initialize worker
worker.init = () => {
  worker.getAllChecks();
  worker.loop();
};

module.exports = worker;
