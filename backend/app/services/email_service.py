import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from dotenv import load_dotenv
from app.core.config import settings

load_dotenv()


class EmailService:
    def __init__(self):
        self.smtp_server = settings.smtp_server
        self.smtp_port = settings.smtp_port
        self.smtp_username = settings.smtp_username
        self.smtp_password = settings.smtp_password
        self.email_from = settings.email_from
        self.email_from_name = settings.email_from_name

    def _create_message(self, to_email: str, subject: str, html_body: str, text_body: Optional[str] = None) -> MIMEMultipart:
        """Create email message with both HTML and text parts"""
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{self.email_from_name} <{self.email_from}>"
        message["To"] = to_email

        # Add text body if provided
        if text_body:
            text_part = MIMEText(text_body, "plain")
            message.attach(text_part)

        # Add HTML body
        html_part = MIMEText(html_body, "html")
        message.attach(html_part)

        return message

    def _send_email(self, message: MIMEMultipart) -> bool:
        """Send email using SMTP"""
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()  # Secure the connection
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(message)
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

    def send_welcome_email(self, user_email: str, user_name: str) -> bool:
        """Send welcome email after signup"""
        subject = "Welcome to FitScan App!"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to FitScan</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #111827;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #F9FAFB;
                }}
                .container {{
                    background: #FFFFFF;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }}
                .header {{
                    background: #2563EB;
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0 0 8px 0;
                    font-size: 28px;
                    font-weight: 700;
                }}
                .header p {{
                    margin: 0;
                    font-size: 16px;
                    opacity: 0.9;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .content h2 {{
                    color: #111827;
                    font-size: 20px;
                    margin-bottom: 16px;
                }}
                .content p {{
                    color: #6B7280;
                    margin-bottom: 20px;
                    font-size: 16px;
                }}
                .features {{
                    background: #F9FAFB;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                }}
                .features ul {{
                    margin: 0;
                    padding-left: 20px;
                }}
                .features li {{
                    color: #374151;
                    margin-bottom: 12px;
                    font-size: 15px;
                }}
                .button {{
                    display: inline-block;
                    background: #2563EB;
                    color: white;
                    padding: 14px 32px;
                    text-decoration: none;
                    border-radius: 999px;
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.25);
                    transition: all 0.2s ease;
                }}
                .button:hover {{
                    background: #1D4ED8;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
                }}
                .footer {{
                    background: #F9FAFB;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #E5E7EB;
                }}
                .footer p {{
                    color: #6B7280;
                    font-size: 14px;
                    margin: 0 0 8px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to FitScan! 🎉</h1>
                    <p>Your fitness journey starts here</p>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Thank you for joining FitScan! We're excited to help you achieve your fitness goals.</p>
                    
                    <div class="features">
                        <h2>With FitScan, you can:</h2>
                        <ul>
                            <li>📊 Track your nutrition with AI-powered food scanning</li>
                            <li>🏋️ Monitor your gym equipment usage</li>
                            <li>📈 Set and achieve fitness milestones</li>
                            <li>🎯 Get personalized recommendations</li>
                        </ul>
                    </div>
                    
                    <p>Get started by exploring our features and scanning your first meal!</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="#" class="button">Get Started</a>
                    </div>
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br>The FitScan Team</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Welcome to FitScan, {user_name}!
        
        Thank you for joining FitScan! We're excited to help you achieve your fitness goals.
        
        With FitScan, you can:
        - Track your nutrition with AI-powered food scanning
        - Monitor your gym equipment usage
        - Set and achieve fitness milestones
        - Get personalized recommendations
        
        Get started by exploring our features and scanning your first meal!
        
        If you have any questions, feel free to reach out to our support team.
        
        Best regards,
        The FitScan Team
        """
        
        message = self._create_message(user_email, subject, html_body, text_body)
        return self._send_email(message)

    def send_login_notification(self, user_email: str, user_name: str) -> bool:
        """Send login notification email"""
        subject = "New Login to FitScan Account"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Notification</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #111827;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #F9FAFB;
                }}
                .container {{
                    background: #FFFFFF;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }}
                .header {{
                    background: #2563EB;
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0 0 8px 0;
                    font-size: 28px;
                    font-weight: 700;
                }}
                .header p {{
                    margin: 0;
                    font-size: 16px;
                    opacity: 0.9;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .content p {{
                    color: #6B7280;
                    margin-bottom: 20px;
                    font-size: 16px;
                }}
                .alert {{
                    background: #FEF3C7;
                    border: 1px solid #F59E0B;
                    color: #92400E;
                    padding: 20px;
                    border-radius: 12px;
                    margin: 24px 0;
                }}
                .alert strong {{
                    display: block;
                    margin-bottom: 8px;
                    font-size: 16px;
                }}
                .content ul {{
                    margin: 20px 0;
                    padding-left: 20px;
                }}
                .content li {{
                    color: #374151;
                    margin-bottom: 8px;
                    font-size: 15px;
                }}
                .footer {{
                    background: #F9FAFB;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #E5E7EB;
                }}
                .footer p {{
                    color: #6B7280;
                    font-size: 14px;
                    margin: 0 0 8px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Login Detected</h1>
                    <p>FitScan Account Security</p>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <div class="alert">
                        <strong>New login detected</strong>
                        Someone just logged into your FitScan account.
                    </div>
                    <p>If this was you, you can safely ignore this email.</p>
                    <p>If you don't recognize this activity, please:</p>
                    <ul>
                        <li>Change your password immediately</li>
                        <li>Contact our support team</li>
                        <li>Review your account activity</li>
                    </ul>
                    <p>Keep your account secure by never sharing your login credentials.</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br>The FitScan Security Team</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Login Notification - FitScan Account
        
        Hi {user_name},
        
        New login detected
        Someone just logged into your FitScan account.
        
        If this was you, you can safely ignore this email.
        
        If you don't recognize this activity, please:
        - Change your password immediately
        - Contact our support team
        - Review your account activity
        
        Keep your account secure by never sharing your login credentials.
        
        Best regards,
        The FitScan Security Team
        """
        
        message = self._create_message(user_email, subject, html_body, text_body)
        return self._send_email(message)

    def send_password_reset_email(self, user_email: str, user_name: str, reset_token: str) -> bool:
        """Send password reset email"""
        subject = "Reset Your FitScan Password"
        
        # Create web reset link
        web_reset_link = f"http://localhost:8000/web/reset-password?token={reset_token}"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #111827;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #F9FAFB;
                }}
                .container {{
                    background: #FFFFFF;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }}
                .header {{
                    background: #2563EB;
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0 0 8px 0;
                    font-size: 28px;
                    font-weight: 700;
                }}
                .header p {{
                    margin: 0;
                    font-size: 16px;
                    opacity: 0.9;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .content p {{
                    color: #6B7280;
                    margin-bottom: 20px;
                    font-size: 16px;
                }}
                .alert {{
                    background: #FEF3C7;
                    border: 1px solid #F59E0B;
                    color: #92400E;
                    padding: 20px;
                    border-radius: 12px;
                    margin: 24px 0;
                }}
                .alert strong {{
                    display: block;
                    margin-bottom: 8px;
                    font-size: 16px;
                }}
                .button {{
                    display: inline-block;
                    background: #2563EB;
                    color: white;
                    padding: 14px 32px;
                    text-decoration: none;
                    border-radius: 999px;
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.25);
                    transition: all 0.2s ease;
                }}
                .button:hover {{
                    background: #1D4ED8;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
                }}
                .footer {{
                    background: #F9FAFB;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #E5E7EB;
                }}
                .footer p {{
                    color: #6B7280;
                    font-size: 14px;
                    margin: 0 0 8px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔑 Password Reset</h1>
                    <p>FitScan Account Recovery</p>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>We received a request to reset your FitScan password.</p>
                    <div class="alert">
                        <strong>Security Notice:</strong> This password reset link will expire in 1 hour for your security.
                    </div>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{web_reset_link}" class="button">Reset Password</a>
                    </div>
                    <p>This link will expire in 1 hour for your security.</p>
                    <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
                    <p>For your security, never share this link with anyone.</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br>The FitScan Team</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Password Reset - FitScan Account
        
        Hi {user_name},
        
        We received a request to reset your FitScan password.
        
        Click the link below to reset your password:
        {web_reset_link}
        
        This link will expire in 1 hour for your security.
        
        If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.
        
        For your security, never share this link with anyone.
        
        Best regards,
        The FitScan Team
        """
        
        message = self._create_message(user_email, subject, html_body, text_body)
        return self._send_email(message)

    def send_password_change_confirmation(self, user_email: str, user_name: str) -> bool:
        """Send password change confirmation email"""
        subject = "FitScan Password Changed Successfully"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Changed</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #111827;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #F9FAFB;
                }}
                .container {{
                    background: #FFFFFF;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }}
                .header {{
                    background: #2563EB;
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0 0 8px 0;
                    font-size: 28px;
                    font-weight: 700;
                }}
                .header p {{
                    margin: 0;
                    font-size: 16px;
                    opacity: 0.9;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .content p {{
                    color: #6B7280;
                    margin-bottom: 20px;
                    font-size: 16px;
                }}
                .success {{
                    background: #D1FAE5;
                    border: 1px solid #10B981;
                    color: #065F46;
                    padding: 20px;
                    border-radius: 12px;
                    margin: 24px 0;
                }}
                .success strong {{
                    display: block;
                    margin-bottom: 8px;
                    font-size: 16px;
                }}
                .content ul {{
                    margin: 20px 0;
                    padding-left: 20px;
                }}
                .content li {{
                    color: #374151;
                    margin-bottom: 8px;
                    font-size: 15px;
                }}
                .footer {{
                    background: #F9FAFB;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #E5E7EB;
                }}
                .footer p {{
                    color: #6B7280;
                    font-size: 14px;
                    margin: 0 0 8px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Password Updated</h1>
                    <p>FitScan Account Security</p>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <div class="success">
                        <strong>Success!</strong>
                        Your FitScan password has been changed successfully.
                    </div>
                    <p>If you didn't make this change, please contact our support team immediately.</p>
                    <p>For your account security:</p>
                    <ul>
                        <li>Use a strong, unique password</li>
                        <li>Don't share your password with anyone</li>
                        <li>Enable two-factor authentication if available</li>
                    </ul>
                    <p>Thank you for keeping your FitScan account secure!</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br>The FitScan Security Team</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Password Changed - FitScan Account
        
        Hi {user_name},
        
        Success!
        Your FitScan password has been changed successfully.
        
        If you didn't make this change, please contact our support team immediately.
        
        For your account security:
        - Use a strong, unique password
        - Don't share your password with anyone
        - Enable two-factor authentication if available
        
        Thank you for keeping your FitScan account secure!
        
        Best regards,
        The FitScan Security Team
        """
        
        message = self._create_message(user_email, subject, html_body, text_body)
        return self._send_email(message)


# Global email service instance
email_service = EmailService()
