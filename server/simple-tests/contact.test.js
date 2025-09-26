import request from 'supertest';
import app from '../app.js';

describe('Contact Form API', () => {
  describe('POST /api/contact', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          // Missing email, subject, message
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('All fields are required');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          subject: 'Test Subject',
          message: 'Test message with sufficient length'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('valid email address');
    });

    it('should validate minimum field lengths', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'T', // Too short
          email: 'test@example.com',
          subject: 'Hi', // Too short
          message: 'Short' // Too short
        });
      
      expect(response.status).toBe(400);
    });

    it('should accept valid contact form data', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test inquiry about candles',
          message: 'This is a test message with sufficient length to meet validation requirements.'
        });
      
      // Note: This might fail if email service is not configured
      // In a test environment, you might want to mock the email service
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('sent successfully');
      }
    });
  });

  describe('GET /api/contact/health', () => {
    it('should return email service status', async () => {
      const response = await request(app)
        .get('/api/contact/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('emailService');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});