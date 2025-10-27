import express from 'express';

const router = express.Router();

// Basic health check
router.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development'
  };

  res.status(200).json(health);
});

// Readiness check (for Kubernetes)
router.get('/ready', (req, res) => {
  // Add any checks for dependencies here
  // For now, just return ready
  res.status(200).json({
    status: 'ready',
    timestamp: Date.now()
  });
});

// Liveness check (for Kubernetes)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: Date.now()
  });
});

export default router;