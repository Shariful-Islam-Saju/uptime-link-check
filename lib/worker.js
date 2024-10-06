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

worker.validateCheckData = (checkObject) => {};
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
