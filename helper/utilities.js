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
module.exports = utilities;
