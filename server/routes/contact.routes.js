import express from 'express';
import ContactController from '../controllers/ContactController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for contact form to prevent spam
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 contact form submissions per windowMs
  message: {
    error: 'Too many contact form submissions. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/contact - Submit contact form
router.post('/', contactFormLimiter, ContactController.submitContactForm);

// GET /api/contact/health - Check email service status (for monitoring)
router.get('/health', ContactController.checkEmailService);

export default router;