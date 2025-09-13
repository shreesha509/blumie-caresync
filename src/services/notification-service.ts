
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
  console.log("auth token", authToken);
  // The AI has flagged this submission as high-risk.
  const message = `IMMEDIATE ATTENTION: MoodLight has flagged a submission from student '${studentName}' as high-risk. Their responses suggest they may be in a dangerous emotional state. A conversation with a caretaker is strongly recommended. Please review the dashboard immediately.`;

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
    console.log(`High-risk SMS alert sent successfully! SID: ${response.sid}`);
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('--------------------------------------------------');
    console.error('Failed to send SMS via Twilio:', error);
    console.error('--------------------------------------------------');
  }
}
