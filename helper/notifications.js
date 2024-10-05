const https = require("https");
const notifications = {};
const { checkType } = require("./utilities");
const authToken = process.env.AUTH_TOKEN;
const accountSid = process.env.ACCOUNT_SID;

notifications.sendTwilioSms = (phone, msg, callback) => {
  const userPhone = checkType(phone, "string", 10);
  const userMsg = checkType(msg, "string", 0);

  if (userMsg && userPhone) {
    const payLoad = new URLSearchParams({
      From: "+8801617134236",
      To: `+88${userPhone}`,
      Body: userMsg,
    }).toString();

    const requestDetails = {
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      auth: `${accountSid}:${authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(payLoad),
      },
    };

    const req = https.request(requestDetails, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        callback(null, data);
      });
    });

    req.on("error", (e) => {
      callback(`Error: ${e.message}`);
    });

    req.write(payLoad);
    req.end();
  } else {
    callback("Given parameters were missing or invalid");
  }
};

module.exports = notifications;
