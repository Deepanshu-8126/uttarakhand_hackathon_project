/**
 * SMS Provider Abstraction for Mobile OTP Delivery
 * Supported providers: 'twilio', 'fast2sms', 'msg91', 'custom'
 */

export const isSmsConfigured = () => {
  const provider = (process.env.SMS_PROVIDER || '').toLowerCase();
  const apiKey = process.env.SMS_API_KEY;
  const apiSecret = process.env.SMS_API_SECRET;

  if (!provider || !apiKey) {
    return false;
  }

  if (provider === 'twilio' && !apiSecret) {
    return false;
  }

  return true;
};

export const sendSmsOTP = async ({ phone, otp, purpose }) => {
  if (!isSmsConfigured()) {
    const error = new Error('SMS service is not configured. Please use email verification or configure SMS_PROVIDER credentials.');
    error.code = 'SMS_NOT_CONFIGURED';
    throw error;
  }

  const provider = (process.env.SMS_PROVIDER || '').toLowerCase();
  const from = process.env.SMS_FROM || 'DISCOVERY';
  const message = `Your Discovery Uttarakhand verification code is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

  switch (provider) {
    case 'twilio': {
      // Future Twilio REST API integration without heavy dependency
      const accountSid = process.env.SMS_API_KEY;
      const authToken = process.env.SMS_API_SECRET;
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      const params = new URLSearchParams();
      params.append('To', phone);
      params.append('From', from);
      params.append('Body', message);

      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Twilio error: ${errorData.message || response.statusText}`);
      }

      return { success: true, provider: 'twilio' };
    }

    case 'fast2sms': {
      // Fast2SMS Quick SMS API
      const endpoint = 'https://www.fast2sms.com/dev/bulkV2';
      const cleanNumber = phone.replace(/\D/g, '').slice(-10);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'authorization': process.env.SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: cleanNumber,
        }),
      });

      const data = await response.json();
      if (!data.return) {
        throw new Error(`Fast2SMS error: ${data.message || 'Failed to dispatch SMS'}`);
      }

      return { success: true, provider: 'fast2sms' };
    }

    default: {
      throw new Error(`Unsupported SMS provider "${provider}". Please configure 'twilio' or 'fast2sms'.`);
    }
  }
};
