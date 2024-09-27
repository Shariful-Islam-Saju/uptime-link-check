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
  if (type === "string") {
    const value =
      typeof body === type && body.trim().length > length ? body : false;

    return value;
  } else if (type === 'boolean') {
     const value =
       typeof body === type ? body : false;

     return value;
  }
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

utilities.randomKey = (stringLength) => {
  if (typeof stringLength !== "number" || stringLength <= 0) {
    return false;
  }

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < stringLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
};

module.exports = utilities;
