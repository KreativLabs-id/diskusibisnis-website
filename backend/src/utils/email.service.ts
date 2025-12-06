import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'DiskusiBisnis <noreply@diskusibisnis.my.id>';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'DiskusiBisnis Support <support@diskusibisnis.my.id>';

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
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifikasi Email</title>
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
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600; text-align: center;">Verifikasi Email Anda</h2>
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center;">
                    Halo <strong>${userName}</strong>,
                  </p>
                  <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center;">
                    Gunakan kode OTP berikut untuk memverifikasi email Anda:
                  </p>
                  
                  <!-- OTP Code -->
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; padding: 20px 40px; background-color: #f0fdf4; border: 2px dashed #059669; border-radius: 12px;">
                      <span style="font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 8px;">${otp}</span>
                    </div>
                  </div>
                  
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
                    Kode ini akan kadaluarsa dalam <strong>10 menit</strong>.
                  </p>
                  <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.6; text-align: center;">
                    Jika Anda tidak mendaftar di DiskusiBisnis, abaikan email ini.
                  </p>
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
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifikasi Ganti Password</title>
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
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600; text-align: center;">Verifikasi Ganti Password</h2>
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center;">
                    Halo <strong>${userName}</strong>,
                  </p>
                  <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center;">
                    Anda meminta untuk mengganti password. Gunakan kode OTP berikut:
                  </p>
                  
                  <!-- OTP Code -->
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; padding: 20px 40px; background-color: #fef3c7; border: 2px dashed #d97706; border-radius: 12px;">
                      <span style="font-size: 36px; font-weight: bold; color: #d97706; letter-spacing: 8px;">${otp}</span>
                    </div>
                  </div>
                  
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
                    Kode ini akan kadaluarsa dalam <strong>10 menit</strong>.
                  </p>
                  <p style="margin: 0; color: #ef4444; font-size: 13px; line-height: 1.6; text-align: center;">
                    ⚠️ Jika Anda tidak meminta ganti password, segera amankan akun Anda.
                  </p>
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
                    Jika Anda tidak meminta reset password, abaikan email ini.
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
