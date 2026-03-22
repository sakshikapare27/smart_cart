import AWS from 'aws-sdk';
const sns = new AWS.SNS();

export const handler = async (event) => {
  // Only send OTP on first challenge
  if (!event.request.session || event.request.session.length === 0) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    event.response.publicChallengeParameters = {
      phone: event.request.userAttributes.phone_number
    };

    event.response.privateChallengeParameters = {
      otp: otp
    };

    event.response.challengeMetadata = 'CUSTOM_CHALLENGE';

    // Send OTP via SNS
    await sns.publish({
      Message: `Your OTP is ${otp}`,
      PhoneNumber: event.request.userAttributes.phone_number
    }).promise();
  }

  return event;
};