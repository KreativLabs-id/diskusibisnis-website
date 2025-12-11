import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'DiskusiBisnis <noreply@diskusibisnis.my.id>';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'DiskusiBisnis Support <support@diskusibisnis.my.id>';
const NEWSLETTER_EMAIL = process.env.NEWSLETTER_EMAIL || 'DiskusiBisnis Newsletter <newsletter@diskusibisnis.my.id>';

// Reusable font family for all emails
const FONT_FAMILY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// Common email head with Inter font
const getEmailHead = (title: string) => `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { font-family: ${FONT_FAMILY} !important; }
    h1, h2, h3, h4, h5, h6 { font-family: ${FONT_FAMILY} !important; font-weight: 700 !important; }
    p, li, td, th, span, a { font-family: ${FONT_FAMILY} !important; }
    strong, b { font-weight: 600 !important; }
  </style>
`;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log(`Email sent to ${options.to}, id: ${data?.id}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send email from support address
export const sendSupportEmail = async (options: Omit<SendEmailOptions, 'from'>): Promise<boolean> => {
  return sendEmail({ ...options, from: SUPPORT_EMAIL });
};

/**
 * Send OTP verification email for registration
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  userName: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${getEmailHead('Verifikasi Email')}
    </head>
    <body style="margin: 0; padding: 0; font-family: ${FONT_FAMILY}; background-color: #f8fafc; -webkit-font-smoothing: antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px; font-family: ${FONT_FAMILY};">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); font-family: ${FONT_FAMILY};">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #059669; font-size: 24px; font-weight: 700; font-family: ${FONT_FAMILY};">DiskusiBisnis</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px; font-family: ${FONT_FAMILY};">
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600; text-align: center; font-family: ${FONT_FAMILY};">Verifikasi Email Anda</h2>
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center; font-family: ${FONT_FAMILY};">
                    Halo <strong style="font-weight: 600;">${userName}</strong>,
                  </p>
                  <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center; font-family: ${FONT_FAMILY};">
                    Gunakan kode OTP berikut untuk memverifikasi email Anda:
                  </p>
                  
                  <!-- OTP Code -->
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; padding: 20px 40px; background-color: #f0fdf4; border: 2px dashed #059669; border-radius: 12px;">
                      <span style="font-size: 36px; font-weight: 700; color: #059669; letter-spacing: 8px; font-family: ${FONT_FAMILY};">${otp}</span>
                    </div>
                  </div>
                  
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6; text-align: center; font-family: ${FONT_FAMILY};">
                    Kode ini akan kadaluarsa dalam <strong style="font-weight: 600;">10 menit</strong>.
                  </p>
                  <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.6; text-align: center; font-family: ${FONT_FAMILY};">
                    Jika Anda tidak mendaftar di DiskusiBisnis, abaikan email ini.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center; font-family: ${FONT_FAMILY};">
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
    Verifikasi Email - DiskusiBisnis
    
    Halo ${userName},
    
    Gunakan kode OTP berikut untuk memverifikasi email Anda:
    
    ${otp}
    
    Kode ini akan kadaluarsa dalam 10 menit.
    
    Jika Anda tidak mendaftar di DiskusiBisnis, abaikan email ini.
    
    © ${new Date().getFullYear()} DiskusiBisnis
  `;

  return sendEmail({
    to: email,
    subject: `${otp} - Kode Verifikasi DiskusiBisnis`,
    html,
    text,
  });
};

/**
 * Send OTP for password change
 */
export const sendPasswordChangeOTPEmail = async (
  email: string,
  otp: string,
  userName: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${getEmailHead('Verifikasi Ganti Password')}
    </head>
    <body style="margin: 0; padding: 0; font-family: ${FONT_FAMILY}; background-color: #f8fafc; -webkit-font-smoothing: antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px; font-family: ${FONT_FAMILY};">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); font-family: ${FONT_FAMILY};">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #059669; font-size: 24px; font-weight: 700; font-family: ${FONT_FAMILY};">DiskusiBisnis</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px; font-family: ${FONT_FAMILY};">
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600; text-align: center; font-family: ${FONT_FAMILY};">Verifikasi Ganti Password</h2>
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center; font-family: ${FONT_FAMILY};">
                    Halo <strong style="font-weight: 600;">${userName}</strong>,
                  </p>
                  <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center; font-family: ${FONT_FAMILY};">
                    Anda meminta untuk mengganti password. Gunakan kode OTP berikut:
                  </p>
                  
                  <!-- OTP Code -->
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; padding: 20px 40px; background-color: #fef3c7; border: 2px dashed #d97706; border-radius: 12px;">
                      <span style="font-size: 36px; font-weight: 700; color: #d97706; letter-spacing: 8px; font-family: ${FONT_FAMILY};">${otp}</span>
                    </div>
                  </div>
                  
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6; text-align: center; font-family: ${FONT_FAMILY};">
                    Kode ini akan kadaluarsa dalam <strong style="font-weight: 600;">10 menit</strong>.
                  </p>
                  <p style="margin: 0; color: #ef4444; font-size: 13px; line-height: 1.6; text-align: center; font-family: ${FONT_FAMILY};">
                    ⚠️ Jika Anda tidak meminta ganti password, segera amankan akun Anda.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center; font-family: ${FONT_FAMILY};">
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
    Verifikasi Ganti Password - DiskusiBisnis
    
    Halo ${userName},
    
    Anda meminta untuk mengganti password. Gunakan kode OTP berikut:
    
    ${otp}
    
    Kode ini akan kadaluarsa dalam 10 menit.
    
    Jika Anda tidak meminta ganti password, segera amankan akun Anda.
    
    © ${new Date().getFullYear()} DiskusiBisnis
  `;

  return sendEmail({
    to: email,
    subject: `${otp} - Verifikasi Ganti Password DiskusiBisnis`,
    html,
    text,
  });
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
      ${getEmailHead('Reset Password')}
    </head>
    <body style="margin: 0; padding: 0; font-family: ${FONT_FAMILY}; background-color: #f8fafc; -webkit-font-smoothing: antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px; font-family: ${FONT_FAMILY};">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); font-family: ${FONT_FAMILY};">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #059669; font-size: 24px; font-weight: 700; font-family: ${FONT_FAMILY};">DiskusiBisnis</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px; font-family: ${FONT_FAMILY};">
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600; font-family: ${FONT_FAMILY};">Reset Password</h2>
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 15px; line-height: 1.6; font-family: ${FONT_FAMILY};">
                    Halo <strong style="font-weight: 600;">${userName}</strong>,
                  </p>
                  <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6; font-family: ${FONT_FAMILY};">
                    Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk membuat password baru:
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 10px 0 30px;">
                        <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 10px; font-family: ${FONT_FAMILY};">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6; font-family: ${FONT_FAMILY};">
                    Link ini akan kadaluarsa dalam <strong style="font-weight: 600;">1 jam</strong>.
                  </p>
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6; font-family: ${FONT_FAMILY};">
                    Jika Anda tidak meminta reset password, abaikan email ini.
                  </p>
                  
                  <!-- Alternative Link -->
                  <div style="margin-top: 24px; padding: 16px; background-color: #f1f5f9; border-radius: 8px;">
                    <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; font-family: ${FONT_FAMILY};">
                      Jika tombol tidak berfungsi, copy link berikut:
                    </p>
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${resetLink}" style="color: #059669; font-size: 13px; text-decoration: none; font-family: ${FONT_FAMILY};">${resetLink}</a>
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center; font-family: ${FONT_FAMILY};">
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

/**
 * Send newsletter email to a subscriber
 */
export const sendNewsletterEmail = async (
  email: string,
  subject: string,
  textContent: string,
  htmlContent: string,
  recipientName: string
): Promise<boolean> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${getEmailHead(subject)}
    </head>
    <body style="margin: 0; padding: 0; font-family: ${FONT_FAMILY}; background-color: #f8fafc; -webkit-font-smoothing: antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px; font-family: ${FONT_FAMILY};">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); font-family: ${FONT_FAMILY};">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 16px 16px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; font-family: ${FONT_FAMILY};">📬 DiskusiBisnis</h1>
                  <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-family: ${FONT_FAMILY};">Newsletter</p>
                </td>
              </tr>
              
              <!-- Greeting -->
              <tr>
                <td style="padding: 30px 40px 10px; font-family: ${FONT_FAMILY};">
                  <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.6; font-family: ${FONT_FAMILY};">
                    Halo <strong style="color: #1e293b; font-weight: 600;">${recipientName}</strong>,
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  <div style="color: #374151; font-size: 15px; line-height: 1.8; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${htmlContent}
                  </div>
                </td>
              </tr>
              
              <!-- CTA Button -->
              <tr>
                <td style="padding: 20px 40px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${frontendUrl}" style="display: inline-block; padding: 14px 32px; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 10px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                          Kunjungi DiskusiBisnis
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Divider -->
              <tr>
                <td style="padding: 0 40px;">
                  <div style="border-top: 1px solid #e2e8f0;"></div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  <p style="margin: 0 0 12px; color: #64748b; font-size: 14px; text-align: center; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    Terima kasih telah menjadi bagian dari komunitas DiskusiBisnis! 🙏
                  </p>
                  <p style="margin: 0 0 20px; color: #94a3b8; font-size: 12px; text-align: center; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    Email ini dikirim ke ${email}
                  </p>
                  <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
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
    ${subject}
    
    Halo ${recipientName},
    
    ${textContent}
    
    Kunjungi DiskusiBisnis: ${frontendUrl}
    
    Terima kasih telah menjadi bagian dari komunitas DiskusiBisnis!
    
    © ${new Date().getFullYear()} DiskusiBisnis
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: NEWSLETTER_EMAIL, // Use dedicated newsletter email
      to: email,
      subject: `📬 ${subject} - DiskusiBisnis Newsletter`,
      html,
      text,
    });

    if (error) {
      console.error(`Newsletter send error to ${email}:`, JSON.stringify(error));
      // Return error details for better debugging
      throw new Error(error.message || 'Resend API error');
    }

    console.log(`Newsletter sent to ${email}, id: ${data?.id}`);
    return true;
  } catch (error: any) {
    console.error(`Newsletter exception for ${email}:`, error.message);
    throw error; // Re-throw to get detailed error in controller
  }
};

