const crypto = require("crypto");

const utilities = {};

utilities.parsedJson = (string) => {
  let output;
  try {
    output = JSON.parse(string);
  } catch (error) {
    output = {};
  }

  return output;
};

utilities.checkType = (body, type, length) => {
  const value =
    typeof body === type && body.trim().length > length ? body : false;

  return value;
};

utilities.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", "This_is_Secret_key")
      .update(str)
      .digest("hex");
    return hash;
  }

  return false;
};
module.exports = utilities;
