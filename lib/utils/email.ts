/**
 * Email Notification Service
 * Sends emails via SMTP (configured for Always Data)
 */

import nodemailer from 'nodemailer';

// SMTP configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp-dasdad.alwaysdata.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
};

const FROM_EMAIL = process.env.SMTP_FROM || 'noreply@dasdad.app';
const APP_NAME = 'DasDAD Banking';

/**
 * Create email transporter
 */
function createTransporter() {
  return nodemailer.createTransport(SMTP_CONFIG);
}

/**
 * Send welcome email on registration
 */
export async function sendWelcomeEmail(email: string, username: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Welcome to ${APP_NAME}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${APP_NAME}! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hello @${username}!</h2>
              <p>Thank you for joining ${APP_NAME}. Your account has been successfully created.</p>
              <p><strong>What you can do now:</strong></p>
              <ul>
                <li>✅ Manage multiple currencies (USD, EUR, GBP, CHF, JPY, CAD, AUD)</li>
                <li>💳 Create virtual and physical cards</li>
                <li>🔄 Transfer money to other users</li>
                <li>₿ Trade cryptocurrencies (BTC, ETH, USDT, and more)</li>
                <li>📊 Track your portfolio in real-time</li>
                <li>🏦 Generate IBANs for international transfers</li>
              </ul>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
              <p><strong>Important:</strong> This is a demo application for educational purposes. All transactions use fake money.</p>
            </div>
            <div class="footer">
              <p>© 2024 ${APP_NAME}. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

/**
 * Send transfer notification email
 */
export async function sendTransferNotification(
  email: string,
  username: string,
  type: 'sent' | 'received',
  amount: number,
  currency: string,
  otherParty: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();
    const action = type === 'sent' ? 'sent' : 'received';
    const preposition = type === 'sent' ? 'to' : 'from';
    
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `${APP_NAME}: You ${action} ${currency}${amount}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, ${type === 'received' ? '#10b981' : '#f59e0b'} 0%, ${type === 'received' ? '#059669' : '#d97706'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .amount { font-size: 36px; font-weight: bold; text-align: center; margin: 20px 0; color: ${type === 'received' ? '#10b981' : '#f59e0b'}; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${type === 'received' ? '💰' : '📤'} Money ${type === 'received' ? 'Received' : 'Sent'}!</h1>
            </div>
            <div class="content">
              <h2>Hello @${username}!</h2>
              <div class="amount">${currency}${amount.toFixed(2)}</div>
              <div class="details">
                <p><strong>Transaction Details:</strong></p>
                <p>You ${action} <strong>${currency}${amount.toFixed(2)}</strong> ${preposition} <strong>@${otherParty}</strong></p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Status:</strong> ✅ Completed</p>
              </div>
              <p>Check your dashboard for updated balance and complete transaction history.</p>
            </div>
            <div class="footer">
              <p>© 2024 ${APP_NAME}. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send transfer notification:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `${APP_NAME}: Password Reset Request`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello @${username}!</h2>
              <p>We received a request to reset your password for your ${APP_NAME} account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
              <div class="warning">
                <p><strong>⚠️ Security Notice:</strong></p>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share your password with anyone</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>© 2024 ${APP_NAME}. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

/**
 * Send crypto trade notification
 */
export async function sendCryptoTradeNotification(
  email: string,
  username: string,
  type: 'buy' | 'sell',
  cryptoAmount: number,
  cryptoType: string,
  fiatAmount: number,
  currency: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `${APP_NAME}: Crypto ${type === 'buy' ? 'Purchase' : 'Sale'} Confirmed`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>₿ Crypto ${type === 'buy' ? 'Purchase' : 'Sale'} Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hello @${username}!</h2>
              <div class="details">
                <p><strong>Trade Details:</strong></p>
                <p>Type: <strong>${type === 'buy' ? 'Buy' : 'Sell'}</strong></p>
                <p>Cryptocurrency: <strong>${cryptoAmount.toFixed(8)} ${cryptoType}</strong></p>
                <p>Amount: <strong>${currency}${fiatAmount.toFixed(2)}</strong></p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Status:</strong> ✅ Completed</p>
              </div>
              <p>Your portfolio has been updated. Check your dashboard to view your crypto holdings.</p>
            </div>
            <div class="footer">
              <p>© 2024 ${APP_NAME}. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send crypto trade notification:', error);
    return false;
  }
}
