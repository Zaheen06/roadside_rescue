import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. "whatsapp:+14155238886"

let client: any = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export async function sendWhatsAppNotification(toPhoneNumber: string, trackingUrl: string, technicianName: string) {
  if (!client) {
    console.warn("Twilio is not configured. Missing account SID or auth token.");
    return false;
  }

  // Format the toPhoneNumber. Ensure it has "whatsapp:" prefix and country code
  let formattedNumber = toPhoneNumber;
  if (!formattedNumber.startsWith("whatsapp:")) {
    formattedNumber = `whatsapp:${formattedNumber}`;
  }

  try {
    const message = await client.messages.create({
      contentSid: process.env.TWILIO_CONTENT_SID || 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
      contentVariables: JSON.stringify({
        "1": technicianName,
        "2": trackingUrl
      }),
      from: twilioWhatsAppNumber,
      to: formattedNumber,
    });
    console.log(`WhatsApp message sent! SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}
