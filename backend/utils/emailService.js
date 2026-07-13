import nodemailer from 'nodemailer';

// Generate a test account on the fly if SMTP is not configured
let testAccount = null;
let transporter = null;

const initTransporter = async () => {
  if (transporter) return transporter;

  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Use Ethereal for testing
      console.log('No SMTP credentials found in .env, generating Ethereal test account...');
      testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
    return transporter;
  } catch (error) {
    console.error('Error initializing email transporter:', error);
    return null;
  }
};

export const sendPillReminderEmail = async (user, medicines, alertTime) => {
  const mailer = await initTransporter();
  if (!mailer) return;

  const medListHtml = medicines.map(med => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>${med.medicineName}</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${med.dosage}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${med.frequency}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 12px;">
      <h2 style="color: #4f46e5; text-align: center;">ArogyaSaathi - Pill Reminder ⏰</h2>
      <p style="color: #374151; font-size: 16px;">Hello <strong>${user.fullName}</strong>,</p>
      <p style="color: #374151; font-size: 16px;">It's <strong>${alertTime}</strong>! This is your automated reminder to take the following medicines:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <tr style="background-color: #4f46e5; color: #ffffff;">
          <th style="padding: 10px; text-align: left;">Medicine</th>
          <th style="padding: 10px; text-align: left;">Dosage</th>
          <th style="padding: 10px; text-align: left;">Frequency</th>
        </tr>
        ${medListHtml}
      </table>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">Please take your medicines on time for a speedy recovery!<br>Stay healthy!</p>
    </div>
  `;

  try {
    const info = await mailer.sendMail({
      from: '"ArogyaSaathi Alerts" <alerts@arogyasaathi.com>',
      to: user.email,
      subject: `⏰ Pill Reminder: It's time for your ${alertTime} dose!`,
      html: html,
    });

    console.log(`Email reminder sent to ${user.email} [${alertTime}]`);
    if (testAccount) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error(`Failed to send email to ${user.email}:`, error);
  }
};
