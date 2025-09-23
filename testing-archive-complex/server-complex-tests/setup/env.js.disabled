// Test environment variables - Override ALL database settings
process.env.NODE_ENV = 'test';

// Override database configuration to use test database
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.DATABASE_NAME = 'queen_bee_test';
process.env.DATABASE_USER = 'bryanowens';
process.env.DATABASE_PASSWORD = '';

// Legacy variable names (in case they're used anywhere)
process.env.DB_NAME = 'queen_bee_test';
process.env.DB_USER = 'bryanowens';
process.env.DB_PASSWORD = '';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';

// Stripe test keys (using real test keys for integration testing)
process.env.STRIPE_SECRET_KEY = 'sk_test_51KiUsHJeFn5NEp5heW6QNiC5NgNX4hEKigH8fpRoQlscBQmXkVIQDxjjf1UfP01wpfr5XXqIKa6m0Y0xWvBhIPxT00qMIUe49p';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_51KiUsHJeFn5NEp5hPErex1Pxw5SZMnlkBoSvS28FjvTeGNhrc8Xu5Hj4kP4GlYlEugzyhZiIja20EZFZuNXPbBl100A2oVoUN4';

// API configuration
process.env.API_PORT = '8081'; // Different port for testing
process.env.API_HOST = 'localhost';

// Disable logging in tests
process.env.LOG_LEVEL = 'error';

// Test-specific flags - DISABLE RATE LIMITING
process.env.DISABLE_RATE_LIMITING = 'true';
process.env.DISABLE_CORS = 'true';
process.env.DISABLE_SECURITY_MIDDLEWARE = 'true';
