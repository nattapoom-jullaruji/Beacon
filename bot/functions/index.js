const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const LINE_MESSAGING_API = "https://api.line.me/v2/bot";
const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization: `Bearer wXjzryM5F3+HSOkw/fe97mTcwOdauKxISXB8p55gCEUOtcyJmVeWkkjRSHgDebUUtvY5bg7hR9lG7Gs/u1nqTj/9mXra5mwjYFUcgFEfATO4ac4ZEhgHsDl6vV8IlANiIWq2L6FNujdkqp8zq0e+zAdB04t89/1O/w1cDnyilFU=`
};

exports.LineBot = functions.https.onRequest(async (req, res) =>
{
  const event = req.body.events[0];

  // Check if it's a beacon event
  if (event.type === "beacon" && event.beacon.type == "enter")
  {
    const cooldownExpired = await checkCooldown(event.source.userId);

    if (cooldownExpired)
    {
      // Process the request
      await reply(event.replyToken, [
        {
          type: "text",
          text:
            "ยินดีต้อนรับนักศึกษาวิทยาลัยเทคโนโลยีสยามบริหารธุรกิจ นักสึกษาสามารถเช็คชื่อเข้าเรียนได้ที่ลิ้งค์นี้เลยครับ",
        },
      ]);

      // Update the timestamp in Firestore
      await updateCooldown(event.source.userId);
    } else
    {
      console.log("Cooldown active. Request ignored.");
    }
  }

  return res.send(req.body);
});

const reply = (token, payload) =>
{
  return axios({
    method: "post",
    url: `${LINE_MESSAGING_API}/message/reply`,
    headers: LINE_HEADER,
    data: { replyToken: token, messages: payload },
  });
};

const checkCooldown = async (userId) =>
{
  const cooldownDoc = await admin.firestore().collection("cooldown").doc(userId).get();

  if (!cooldownDoc.exists)
  {
    // If the document doesn't exist, it means there is no cooldown, and it's expired.
    return true;
  }

  const lastRequestTimestamp = cooldownDoc.data().timestamp;
  const currentTime = new Date().getTime();
  const cooldownExpired = currentTime - lastRequestTimestamp >= 5 * 60 * 1000; // 30 minutes

  return cooldownExpired;
};

const updateCooldown = async (userId) =>
{
  await admin.firestore().collection("cooldown").doc(userId).set({
    timestamp: new Date().getTime(),
  });
};
