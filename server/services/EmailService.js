import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

  async sendOrderConfirmation({ customerEmail, customerName, orderId, orderItems, totalAmount, shippingOption, shippingAddress, shippingCost = 0 }) {
    try {
      // Calculate subtotal (total minus shipping)
      const subtotal = totalAmount - shippingCost;
      
      // Format items list for email
      const itemsList = orderItems.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #fcee80;">${item.title}</td>
          <td style="padding: 10px; border-bottom: 1px solid #fcee80; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #fcee80; text-align: right;">$${(item.price / 100).toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #fcee80; text-align: right;">$${(item.price * item.quantity / 100).toFixed(2)}</td>
        </tr>
      `).join('');

      const itemsTextList = orderItems.map(item => 
        `${item.title} x${item.quantity} - $${(item.price * item.quantity / 100).toFixed(2)}`
      ).join('\n');

      // Format shipping info
      const shippingInfo = shippingOption === 'pickup' 
        ? '<p><strong>Pickup Location:</strong> Whangarei, Northland</p>'
        : `
          <p><strong>Shipping Address:</strong><br>
          ${shippingAddress.line1}<br>
          ${shippingAddress.line2 ? shippingAddress.line2 + '<br>' : ''}
          ${shippingAddress.city}, ${shippingAddress.postal_code}<br>
          ${shippingAddress.country}</p>
        `;

      const shippingTextInfo = shippingOption === 'pickup'
        ? 'Pickup Location: Whangarei, Northland'
        : `Shipping Address:\n${shippingAddress.line1}\n${shippingAddress.line2 ? shippingAddress.line2 + '\n' : ''}${shippingAddress.city}, ${shippingAddress.postal_code}\n${shippingAddress.country}`;

      // Send confirmation email to customer
      const emailOptions = {
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: `Order Confirmation - ${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #fff9c4 0%, #fff3b8 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #7a5800; margin: 0;">🐝 Order Confirmed!</h2>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #fcee80;">
              <p>Hi ${customerName || 'Valued Customer'},</p>
              
              <p>Thank you for your order! We're excited to handcraft your beautiful candles.</p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #f5d800; margin: 15px 0;">
                <p style="margin: 0;"><strong>Order ID:</strong> ${orderId}</p>
              </div>
              
              <h3 style="color: #7a5800;">Order Details:</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <thead>
                  <tr style="background: #fff3b8;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #f5d800;">Item</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #f5d800;">Qty</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #f5d800;">Price</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #f5d800;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                  <tr style="background: #f9f9f9;">
                    <td colspan="3" style="padding: 10px; text-align: right; border-top: 2px solid #f5d800;"><strong>Subtotal:</strong></td>
                    <td style="padding: 10px; text-align: right; border-top: 2px solid #f5d800;"><strong>$${(subtotal / 100).toFixed(2)}</strong></td>
                  </tr>
                  ${shippingCost > 0 ? `
                  <tr style="background: #f9f9f9;">
                    <td colspan="3" style="padding: 10px; text-align: right;">Shipping:</td>
                    <td style="padding: 10px; text-align: right;">$${(shippingCost / 100).toFixed(2)}</td>
                  </tr>
                  ` : `
                  <tr style="background: #f9f9f9;">
                    <td colspan="3" style="padding: 10px; text-align: right;">Shipping:</td>
                    <td style="padding: 10px; text-align: right; color: #059669;">FREE (Pickup)</td>
                  </tr>
                  `}
                  <tr style="background: #fff3b8;">
                    <td colspan="3" style="padding: 10px; text-align: right; border-top: 2px solid #f5d800;"><strong>Total:</strong></td>
                    <td style="padding: 10px; text-align: right; border-top: 2px solid #f5d800;"><strong>$${(totalAmount / 100).toFixed(2)} NZD</strong></td>
                  </tr>
                </tbody>
              </table>
              
              <h3 style="color: #7a5800;">Delivery Information:</h3>
              ${shippingInfo}
              
              <div style="background: #fff3b8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="color: #7a5800; margin-top: 0;">What happens next?</h4>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>We'll prepare your handcrafted candles with care</li>
                  <li>${shippingOption === 'pickup' ? 'Your order will be ready for pickup in 2-3 business days' : 'Your order will be shipped within 2-3 business days'}</li>
                  <li>${shippingOption === 'pickup' ? "We'll notify you when your order is ready" : "You'll receive tracking information via email"}</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px;">
                If you have any questions about your order, please don't hesitate to contact us at queenbcandlesnz@gmail.com
              </p>
              
              <p style="margin-top: 30px;">
                Warm regards,<br>
                <strong>The Queen Bee Candles Team</strong> 🐝
              </p>
              
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #fcee80;">
              
              <p style="color: #666; font-size: 12px; text-align: center;">
                Queen Bee Candles - Handcrafted with Love in Whangarei, New Zealand
              </p>
            </div>
          </div>
        `,
        text: `
Order Confirmation - ${orderId}

Hi ${customerName || 'Valued Customer'},

Thank you for your order! We're excited to handcraft your beautiful candles.

Order ID: ${orderId}

Order Details:
${itemsTextList}

Subtotal: $${(subtotal / 100).toFixed(2)}
Shipping: ${shippingCost > 0 ? '$' + (shippingCost / 100).toFixed(2) : 'FREE (Pickup)'}
Total: $${(totalAmount / 100).toFixed(2)} NZD

Delivery Information:
${shippingTextInfo}

What happens next?
- We'll prepare your handcrafted candles with care
- ${shippingOption === 'pickup' ? 'Your order will be ready for pickup in 2-3 business days' : 'Your order will be shipped within 2-3 business days'}
- ${shippingOption === 'pickup' ? "We'll notify you when your order is ready" : "You'll receive tracking information via email"}

If you have any questions about your order, please don't hesitate to contact us at queenbcandlesnz@gmail.com

Warm regards,
The Queen Bee Candles Team 🐝

Queen Bee Candles - Handcrafted with Love in Whangarei, New Zealand
        `
      };

      await this.transporter.sendMail(emailOptions);
      console.log(`✅ Order confirmation email sent to ${customerEmail}`);
      
      // Also send notification to business email
      try {
        const businessNotification = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER, // Send to business email
          subject: `New Order: ${orderId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #fff9c4 0%, #fff3b8 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: #7a5800; margin: 0;">🐝 New Order Received!</h2>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #fcee80;">
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #f5d800; margin: 15px 0;">
                  <p style="margin: 0;"><strong>Order ID:</strong> ${orderId}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
                  <p style="margin: 5px 0 0 0;"><strong>Delivery:</strong> ${shippingOption === 'pickup' ? 'Local Pickup' : 'Shipping'}</p>
                </div>
                
                <h3 style="color: #7a5800;">Order Items:</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                  <thead>
                    <tr style="background: #fff3b8;">
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #f5d800;">Item</th>
                      <th style="padding: 10px; text-align: center; border-bottom: 2px solid #f5d800;">Qty</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #f5d800;">Price</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #f5d800;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsList}
                    <tr style="background: #f9f9f9;">
                      <td colspan="3" style="padding: 10px; text-align: right; border-top: 2px solid #f5d800;"><strong>Subtotal:</strong></td>
                      <td style="padding: 10px; text-align: right; border-top: 2px solid #f5d800;"><strong>$${(subtotal / 100).toFixed(2)}</strong></td>
                    </tr>
                    ${shippingCost > 0 ? `
                    <tr style="background: #f9f9f9;">
                      <td colspan="3" style="padding: 10px; text-align: right;">Shipping:</td>
                      <td style="padding: 10px; text-align: right;">$${(shippingCost / 100).toFixed(2)}</td>
                    </tr>
                    ` : `
                    <tr style="background: #f9f9f9;">
                      <td colspan="3" style="padding: 10px; text-align: right;">Shipping:</td>
                      <td style="padding: 10px; text-align: right; color: #059669;">FREE (Pickup)</td>
                    </tr>
                    `}
                    <tr style="background: #fff3b8;">
                      <td colspan="3" style="padding: 10px; text-align: right; border-top: 2px solid #f5d800;"><strong>Total:</strong></td>
                      <td style="padding: 10px; text-align: right; border-top: 2px solid #f5d800;"><strong>$${(totalAmount / 100).toFixed(2)} NZD</strong></td>
                    </tr>
                  </tbody>
                </table>
                
                ${shippingOption === 'ship' ? `
                  <h3 style="color: #7a5800;">Shipping Address:</h3>
                  <p>
                    ${shippingAddress.line1}<br>
                    ${shippingAddress.line2 ? shippingAddress.line2 + '<br>' : ''}
                    ${shippingAddress.city}, ${shippingAddress.postal_code}<br>
                    ${shippingAddress.country}
                  </p>
                ` : '<p><strong>Customer will pick up in Whangarei</strong></p>'}
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #fcee80;">
                
                <p style="color: #666; font-size: 12px; text-align: center;">
                  Order received at ${new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })}
                </p>
              </div>
            </div>
          `,
          text: `
New Order Received!

Order ID: ${orderId}
Customer: ${customerName} (${customerEmail})
Delivery: ${shippingOption === 'pickup' ? 'Local Pickup' : 'Shipping'}

Order Items:
${itemsTextList}

Subtotal: $${(subtotal / 100).toFixed(2)}
Shipping: ${shippingCost > 0 ? '$' + (shippingCost / 100).toFixed(2) : 'FREE (Pickup)'}
Total: $${(totalAmount / 100).toFixed(2)} NZD

${shippingOption === 'ship' ? `Shipping Address:\n${shippingAddress.line1}\n${shippingAddress.line2 ? shippingAddress.line2 + '\n' : ''}${shippingAddress.city}, ${shippingAddress.postal_code}\n${shippingAddress.country}` : 'Customer will pick up in Whangarei'}

Order received at ${new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })}
          `
        };
        
        await this.transporter.sendMail(businessNotification);
        console.log(`✅ Business notification sent for order ${orderId}`);
      } catch (businessEmailError) {
        console.error('Failed to send business notification:', businessEmailError);
        // Don't throw - customer email already sent successfully
      }
      
      return { success: true };

    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      // Don't throw - we don't want to fail the order if email fails
      return { success: false, error: error.message };
    }
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
