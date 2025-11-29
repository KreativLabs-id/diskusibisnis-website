import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // Use Gmail SMTP or other SMTP service
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"DiskusiBisnis" <${process.env.SMTP_USER || 'noreply@diskusibisnis.my.id'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  userName: string
): Promise<boolean> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #059669; font-size: 24px; font-weight: bold;">DiskusiBisnis</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px;">
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600;">Reset Password</h2>
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 15px; line-height: 1.6;">
                    Halo <strong>${userName}</strong>,
                  </p>
                  <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6;">
                    Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk membuat password baru:
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 10px 0 30px;">
                        <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 10px;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6;">
                    Link ini akan kadaluarsa dalam <strong>1 jam</strong>.
                  </p>
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6;">
                    Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tidak akan berubah.
                  </p>
                  
                  <!-- Alternative Link -->
                  <div style="margin-top: 24px; padding: 16px; background-color: #f1f5f9; border-radius: 8px;">
                    <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">
                      Jika tombol tidak berfungsi, copy link berikut:
                    </p>
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${resetLink}" style="color: #059669; font-size: 13px; text-decoration: none;">${resetLink}</a>
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">
                    © ${new Date().getFullYear()} DiskusiBisnis. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Reset Password - DiskusiBisnis
    
    Halo ${userName},
    
    Kami menerima permintaan untuk mereset password akun Anda.
    
    Klik link berikut untuk membuat password baru:
    ${resetLink}
    
    Link ini akan kadaluarsa dalam 1 jam.
    
    Jika Anda tidak meminta reset password, abaikan email ini.
    
    © ${new Date().getFullYear()} DiskusiBisnis
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Password - DiskusiBisnis',
    html,
    text,
  });
};
