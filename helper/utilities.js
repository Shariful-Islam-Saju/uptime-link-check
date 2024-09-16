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

    return value
};
module.exports = utilities;
