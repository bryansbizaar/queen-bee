// import EmailService from '../services/EmailService.js';

class ContactController {
  
  async submitContactForm(req, res) {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          error: 'All fields are required: name, email, subject, message'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Please provide a valid email address'
        });
      }

      // Sanitize inputs (basic validation)
      const sanitizedData = {
        name: name.trim().substring(0, 100),
        email: email.trim().toLowerCase(),
        subject: subject.trim().substring(0, 200),
        message: message.trim().substring(0, 2000)
      };

      // Additional validation
      if (sanitizedData.name.length < 2) {
        return res.status(400).json({
          error: 'Name must be at least 2 characters long'
        });
      }

      if (sanitizedData.subject.length < 5) {
        return res.status(400).json({
          error: 'Subject must be at least 5 characters long'
        });
      }

      if (sanitizedData.message.length < 10) {
        return res.status(400).json({
          error: 'Message must be at least 10 characters long'
        });
      }

      // TODO: Send email (temporarily disabled - will re-enable once server is stable)
      console.log(`📧 Contact form submitted from: ${sanitizedData.email}, Subject: ${sanitizedData.subject}`);

      res.status(200).json({
        success: true,
        message: 'Your message has been received! We\'ll get back to you within 24 hours.'
      });

    } catch (error) {
      console.error('Contact form submission error:', error);
      
      res.status(500).json({
        error: 'Unable to process your message at this time. Please try again later.'
      });
    }
  }

  // Health check for email service
  async checkEmailService(req, res) {
    try {
      res.status(200).json({
        emailService: 'temporarily disabled - fixing server issues',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Email service check error:', error);
      res.status(500).json({
        emailService: 'error',
        error: 'Unable to verify email service status',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new ContactController();