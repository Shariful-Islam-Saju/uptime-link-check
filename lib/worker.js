const { parsedJson } = require("../helper/utilities");
const lib = require("./data");

const worker = {};

worker.getAllChecks = () => {
  // Call lib.list to get all check file names in the 'checks' directory
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
          console.log("Error: Can't Read one of the Check Data");
          return;
        }
        const checkObject = parsedJson(checkData);
        worker.validateCheckData(checkObject);
      });
    });

    // Additional logic to handle the retrieved check data could go here
  });
};

worker.validateCheckData = (checkObject) => {
  if (!checkObject || !checkObject.id) {
    console.log("Check is Invalid!!!");
    return;
  }

  const demoCheckObject = { ...checkObject };

  // Validate the state (it should be either "Up" or "Down")
  demoCheckObject.state =
    typeof checkObject.state === "string" &&
    ["Up", "Down"].indexOf(checkObject.state) > -1
      ? checkObject.state
      : "Down"; // Default to "Down" if invalid

  // Validate the checkTime (should be a number greater than 0)
  demoCheckObject.checkTime =
    typeof checkObject.checkTime === "number" && checkObject.checkTime > 0
      ? checkObject.checkTime
      : false; // Default to false if invalid

  worker.perform(demoCheckObject);
};

worker.loop = () => {
  setInterval(() => {
    worker.getAllChecks();
  }, 1000 * 60);
};

worker.init = () => {
  worker.getAllChecks();
  worker.loop();
};

module.exports = worker;
