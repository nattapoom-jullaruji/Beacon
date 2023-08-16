
const functions = require("firebase-functions");
const axios = require("axios");
const LINE_MESSAGING_API = "https://api.line.me/v2/bot";
const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization: `Bearer wXjzryM5F3+HSOkw/fe97mTcwOdauKxISXB8p55gCEUOtcyJmVeWkkjRSHgDebUUtvY5bg7hR9lG7Gs/u1nqTj/9mXra5mwjYFUcgFEfATO4ac4ZEhgHsDl6vV8IlANiIWq2L6FNujdkqp8zq0e+zAdB04t89/1O/w1cDnyilFU=`
};

exports.LineBot = functions.https.onRequest(async(req, res) => {
    console.log(req.body.events);
    const event = req.body.events[0];
  if (event.type === "beacon") {
    if(event.beacon.type == "enter"){
        await reply(
            event.replyToken,
            [{ type: "text", text: "ยินดีต้อนรับนักศึกษาวิทยาลัยเทคโนโลยีสยามบริหารธุรกิจ นักสึกษาสามารถเช็คชื่อเข้าเรียนได้ที่ลิ้งค์นี้เลยครับ" }]
          );
    }
  }
  return res.send(req.body);
});

const reply = (token, payload) => {
  return axios({
    method: "post",
    url: `${LINE_MESSAGING_API}/message/reply`,
    headers: LINE_HEADER,
    data: { replyToken: token, messages: payload }
  });
};