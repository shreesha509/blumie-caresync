
import twilio from 'twilio';

/**
 * @fileOverview A service for sending notifications using Twilio.
 */

/**
 * Sends an SMS warning message to the warden's phone number.
 * @param studentName The name of the student who triggered the warning.
 */
export async function sendSmsWarning(studentName: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  const wardenPhoneNumber = process.env.WARDEN_PHONE_NUMBER;

  const message = `MoodLight Alert: Student '${studentName}' has submitted a mood entry that was flagged as potentially inconsistent. A conversation with a caretaker is recommended. Please review the dashboard.`;

  if (!accountSid || !authToken || !twilioPhoneNumber || !wardenPhoneNumber) {
    console.error('--------------------------------------------------');
    console.error('Twilio credentials are not configured correctly in environment variables.');
    console.error('SMS not sent. Logging message instead:');
    console.log(message);
    console.error('--------------------------------------------------');
    return;
  }
  
  const client = twilio(accountSid, authToken);

  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: wardenPhoneNumber
    });
    console.log('--------------------------------------------------');
    console.log(`SMS alert sent successfully! SID: ${response.sid}`);
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('--------------------------------------------------');
    console.error('Failed to send SMS via Twilio:', error);
    console.error('--------------------------------------------------');
  }
}
