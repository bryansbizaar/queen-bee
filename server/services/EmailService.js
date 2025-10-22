import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    // Create transporter using Gmail SMTP
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // queenbcandlesnz@gmail.com
        pass: process.env.EMAIL_PASSWORD // App-specific password
      }
    });
  }

  async sendContactEmail({ name, email, subject, message }) {
    try {
      // Email to business owner
      const businessEmail = {
        from: process.env.EMAIL_USER,
        to: 'queenbcandlesnz@gmail.com',
        subject: `Contact Form: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #fff9c4 0%, #fff3b8 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #7a5800; margin: 0;">New Contact Form Message</h2>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #fcee80;">
              <h3 style="color: #7a5800; margin-top: 0;">Contact Details:</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              
              <h3 style="color: #7a5800;">Message:</h3>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #f5d800;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #fcee80;">
              
              <p style="color: #666; font-size: 12px;">
                This email was sent from the Queen Bee Candles contact form on ${new Date().toLocaleString()}.
              </p>
            </div>
          </div>
        `,
        text: `
New Contact Form Message

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

This email was sent from the Queen Bee Candles contact form on ${new Date().toLocaleString()}.
        `
      };

      // Auto-reply to customer
      const customerEmail = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank you for contacting Queen Bee Candles',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #fff9c4 0%, #fff3b8 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #7a5800; margin: 0;">Thank You for Your Message!</h2>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #fcee80;">
              <p>Hi ${name},</p>
              
              <p>Thank you for reaching out to Queen Bee Candles! We've received your message about:</p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #f5d800; margin: 15px 0;">
                <strong>"${subject}"</strong>
              </div>
              
              <p>We typically respond to all inquiries within 24 hours. If your question is urgent, feel free to email us directly at queenbcandlesnz@gmail.com.</p>
              
              <p>In the meantime, feel free to browse our handcrafted candles on our website!</p>
              
              <p style="margin-top: 30px;">
                Warm regards,<br>
                <strong>The Queen Bee Candles Team</strong>
              </p>
              
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #fcee80;">
              
              <p style="color: #666; font-size: 12px;">
                This is an automated confirmation email. Please don't reply to this message - instead, email us at queenbcandlesnz@gmail.com.
              </p>
            </div>
          </div>
        `,
        text: `
Hi ${name},

Thank you for reaching out to Queen Bee Candles! We've received your message about: "${subject}"

We typically respond to all inquiries within 24 hours. If your question is urgent, feel free to email us directly at queenbcandlesnz@gmail.com.

In the meantime, feel free to browse our handcrafted candles on our website!

Warm regards,
The Queen Bee Candles Team

This is an automated confirmation email. Please don't reply to this message - instead, email us at queenbcandlesnz@gmail.com.
        `
      };

      // Send both emails
      await Promise.all([
        this.transporter.sendMail(businessEmail),
        this.transporter.sendMail(customerEmail)
      ]);

      return { success: true };

    } catch (error) {
      console.error('Email service error:', error);
      throw new Error('Failed to send email');
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();