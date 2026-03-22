import AWS from "aws-sdk";

const sns = new AWS.SNS();

export const handler = async (event) => {

  const phoneNumber = event.phone;
  const otp = Math.floor(100000 + Math.random() * 900000);

  await sns.publish({
    Message: `Your OTP is ${otp}`,
    PhoneNumber: phoneNumber
  }).promise();

  return { message: "OTP sent" };
};