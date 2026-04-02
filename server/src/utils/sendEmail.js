const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Sends an email using the configured SMTP transporter.
 * Fails gracefully — logs the error but never crashes the server.
 * @param {{ to: string, subject: string, html: string }} options
 * @returns {Promise<boolean>} true if sent, false on failure
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error(`Email send failed → ${to}:`, error.message);
    return false;
  }
};

// ── Email Templates ──────────────────────────────────────────────

const baseStyle = `
  font-family: 'Segoe UI', Roboto, Arial, sans-serif;
  max-width: 560px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
`;

const buttonStyle = `
  display: inline-block;
  padding: 14px 36px;
  background: #4f46e5;
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
`;

const wrapTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0; padding:24px; background:#f4f4f5;">
  <div style="${baseStyle}">
    <div style="background:#4f46e5; padding:28px 32px;">
      <h1 style="margin:0; color:#ffffff; font-size:22px;">Auth System</h1>
    </div>
    <div style="padding:32px;">
      ${content}
    </div>
    <div style="padding:20px 32px; background:#f9fafb; text-align:center; font-size:12px; color:#9ca3af;">
      <p style="margin:0;">You received this email because an action was requested on your account.</p>
      <p style="margin:4px 0 0;">If you didn't request this, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Builds the HTML for an email-verification message.
 * @param {string} name  – user's display name
 * @param {string} token – crypto verification token
 */
const verificationEmailTemplate = (name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  return wrapTemplate(`
    <h2 style="margin:0 0 8px; color:#111827; font-size:20px;">Welcome, ${name}!</h2>
    <p style="color:#4b5563; line-height:1.6;">
      Thanks for signing up. Please verify your email address by clicking the button below.
    </p>
    <div style="text-align:center; margin:28px 0;">
      <a href="${verifyUrl}" style="${buttonStyle}">Verify Email</a>
    </div>
    <p style="color:#6b7280; font-size:13px; word-break:break-all;">
      Or copy this link into your browser:<br/>
      <a href="${verifyUrl}" style="color:#4f46e5;">${verifyUrl}</a>
    </p>
  `);
};

/**
 * Builds the HTML for a password-reset message.
 * @param {string} name  – user's display name
 * @param {string} token – crypto reset token
 */
const resetPasswordEmailTemplate = (name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  return wrapTemplate(`
    <h2 style="margin:0 0 8px; color:#111827; font-size:20px;">Password Reset</h2>
    <p style="color:#4b5563; line-height:1.6;">
      Hi ${name}, we received a request to reset your password.
      Click the button below to choose a new one.
    </p>
    <div style="text-align:center; margin:28px 0;">
      <a href="${resetUrl}" style="${buttonStyle}">Reset Password</a>
    </div>
    <p style="color:#6b7280; font-size:13px; word-break:break-all;">
      Or copy this link into your browser:<br/>
      <a href="${resetUrl}" style="color:#4f46e5;">${resetUrl}</a>
    </p>
    <p style="color:#ef4444; font-size:13px; margin-top:20px;">
      This link expires in <strong>10 minutes</strong>. If you didn't request a reset, ignore this email.
    </p>
  `);
};

module.exports = {
  sendEmail,
  verificationEmailTemplate,
  resetPasswordEmailTemplate,
};
