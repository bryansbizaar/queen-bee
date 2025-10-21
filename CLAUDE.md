# Claude Context - Queen Bee Candles

## Project Identity
Full-stack e-commerce application for handcrafted beeswax candles. Built with React frontend, Express backend, PostgreSQL database, and Stripe payment processing.

**Purpose**: Allow customers to browse candles, manage shopping cart, and complete secure purchases.

---

## Business Context

**Project Type**: Small artisan business e-commerce site  
**Business Philosophy**: "Right-sized solutions for actual business needs"

This project demonstrates building production-ready e-commerce for a small handcrafted candle business. The architecture is intentionally scalable but appropriately sized - avoiding over-engineering while maintaining professional standards. Every technical decision balances current simplicity with future growth potential.

**Key Principles**:
- **Business value first** - Features solve real problems, not theoretical ones
- **Appropriate complexity** - Complexity matches business scale
- **Quality over quantity** - Better to do fewer things excellently
- **Future-friendly architecture** - Enables growth without rewrites

**Decision Framework**: When evaluating features or changes, ask:
- Does this solve an actual business or user problem?
- Is the complexity appropriate for our scale?
- Will this be maintainable long-term?
- Does this align with our core goals?

---

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **State Management**: React Context API (CartContext)
- **Routing**: React Router v6
- **Styling**: CSS modules
- **Testing**: Vitest + React Testing Library
- **Payment UI**: Stripe Elements

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **Payment Processing**: Stripe API
- **Testing**: Jest
- **Validation**: Joi (planned)

### Infrastructure
- **Database Container**: Docker (local development)
- **CI/CD**: GitHub Actions
- **Version Control**: Git/GitHub

---

## Architecture Overview

### Request Flow
```
User Browser → React App (Port 3000)
              ↓
      Express API (Port 8080)
              ↓
    ┌─────────┴──────────┐
    ↓                    ↓
PostgreSQL          Stripe API
 (Port 5432)        (External)
```

### Key Architectural Decisions

**1. Cart State Management**
- Uses React Context API (`CartContext.jsx`)
- No localStorage persistence (intentional for security)
- Cart state resets on page refresh
- Rationale: Simpler implementation, avoids stale data issues

**2. Services Layer Pattern**
- Controllers handle HTTP requests/responses
- Services contain business logic
- Clean separation of concerns
- Example: `ProductService.js`, `OrderService.js`

**3. Database Approach**
- Raw SQL with `pg` library (no ORM)
- Connection pooling via `pg.Pool`
- Schema defined in `database/init.sql`
- Rationale: Direct control, better performance for simple queries

**4. Payment Flow**
- Client creates payment intent → Server calls Stripe
- Client collects payment → Stripe processes
- Stripe webhook confirms → Server creates order
- Webhook signature verification is CRITICAL for security

---

## Project Structure

```
queen-bee/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Header.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── CheckoutForm.jsx
│   │   ├── pages/               # Route-level page components
│   │   │   ├── Home.jsx
│   │   │   ├── CartPage.jsx
│   │   │   └── CheckoutSuccess.jsx
│   │   ├── context/             # React Context providers
│   │   │   └── CartContext.jsx  # Shopping cart state
│   │   ├── utils/               # Helper functions
│   │   └── __tests__/           # Vitest test files
│   ├── public/images/           # Product images
│   └── package.json
├── server/                      # Express backend
│   ├── controllers/             # Route handlers (HTTP layer)
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── paymentController.js
│   ├── services/                # Business logic layer
│   │   ├── ProductService.js
│   │   └── OrderService.js
│   ├── middleware/              # Custom middleware
│   │   └── errorHandler.js
│   ├── database/                # Database configuration
│   │   ├── pool.js              # PostgreSQL connection pool
│   │   └── init.sql             # Database schema
│   ├── tests/                   # Jest test files
│   └── server.js                # Express app entry point
├── database/
│   └── init.sql                 # PostgreSQL schema definition
├── .github/workflows/
│   └── main.yml                 # CI/CD pipeline
└── docs/                        # Additional documentation
```

---

## Current Development Status

### ✅ Completed Features
- Product catalog display with images
- Shopping cart (add, remove, update quantities)
- Stripe payment integration with 3D Secure
- Order creation and storage in PostgreSQL
- Webhook handling for payment confirmation
- GitHub Actions CI/CD pipeline
- Comprehensive client-side cart testing
- Docker-based local database setup

### 🚧 In Progress
- Expanding server-side test coverage
- Implementing rate limiting middleware
- Adding input validation with Joi
- Security hardening (CORS, headers)

### 📋 Planned Features
- Admin dashboard for inventory management
- Customer accounts and order history
- Email notifications for orders
- Advanced analytics and reporting
- Performance optimization for images
- End-to-end testing with Playwright/Cypress

---

## Coding Conventions

### React Components
- **Style**: Functional components with hooks only
- **File naming**: PascalCase (e.g., `ProductCard.jsx`)
- **Props**: Destructure in function signature
- **State**: Use `useState` and `useContext` appropriately
- **Effects**: Minimize `useEffect` usage, prefer derived state

### API Design
- **Pattern**: RESTful routes
- **Format**: `/api/resource` or `/api/resource/:id`
- **Responses**: JSON with consistent structure
- **Errors**: HTTP status codes with error messages

### File Naming
- **Components**: PascalCase (`Header.jsx`)
- **Utilities**: camelCase (`formatPrice.js`)
- **Services**: PascalCase with suffix (`ProductService.js`)
- **Tests**: Match source file with `.test.js` suffix

### Code Style
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Indentation**: 2 spaces
- **Line length**: 80-100 characters preferred
- **ESLint**: Configuration enforced (see `.eslintrc` files)

---

## Critical Don'ts - DO NOT BREAK THESE

### 🚨 Security Critical
1. **Stripe Webhook Signatures**: Never skip `stripe.webhooks.constructEvent()` verification
2. **Environment Variables**: Never commit `.env` files or expose secrets
3. **SQL Injection**: Always use parameterized queries with `$1, $2` syntax
4. **CORS Origins**: Don't use `*` in production

### 🚨 Data Integrity
1. **Cart Context**: Don't modify cart state outside of CartContext provider
2. **Database Transactions**: Use transactions for order creation (order + line items)
3. **Payment Intent**: Never create orders before payment confirmation from webhook
4. **Connection Pool**: Don't create new pools; reuse the singleton from `pool.js`

### 🚨 Testing
1. **Test Database**: Always use separate test database, never development/production
2. **Mock Stripe**: Mock Stripe API calls in tests, don't hit real endpoints
3. **CI Pipeline**: All tests must pass before merging

---

## Known Constraints & Limitations

### Technical Constraints
- **PostgreSQL Version**: Requires 15+ for specific JSON functions
- **Node Version**: Requires 18+ for native fetch API
- **Stripe Version**: Using API version 2023-10-16
- **No SSR**: Client-side rendering only (Vite SPA)

### Business Constraints
- **PCI Compliance**: Must maintain Stripe's compliance requirements
- **Inventory**: No overselling - check stock before order creation
- **Payment Methods**: Credit/debit cards only (no ACH, crypto, etc.)

### Performance Considerations
- **Images**: Currently not optimized (future CDN needed)
- **No Caching**: API responses not cached (acceptable for MVP)
- **Database**: Single instance, no replication (local dev only)

---

## Environment Variables

### Required Server Variables
```bash
DATABASE_URL=postgresql://user:pass@host:port/database
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=queenbee
PGHOST=localhost
PGPORT=5432
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=8080
NODE_ENV=development|test|production
```

### Required Client Variables
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
VITE_API_URL=http://localhost:8080
```

### Test Environment
The test environment uses:
- Separate test database (`queen_bee_test`)
- Mock Stripe API calls
- In-memory test data where appropriate

---

## Database Schema (Simplified)

### Products Table
- `id` (serial primary key)
- `name` (varchar)
- `description` (text)
- `price` (decimal)
- `image_url` (varchar)
- `stock` (integer)

### Orders Table
- `id` (serial primary key)
- `stripe_payment_intent_id` (varchar, unique)
- `customer_email` (varchar)
- `total_amount` (decimal)
- `status` (varchar: 'pending', 'completed', 'failed')
- `created_at` (timestamp)

### Order Items Table
- `id` (serial primary key)
- `order_id` (foreign key → orders)
- `product_id` (foreign key → products)
- `quantity` (integer)
- `price_at_purchase` (decimal)

Full schema in: `database/init.sql`

---

## Common Development Tasks

### Adding a New API Endpoint
1. Create/update controller in `server/controllers/`
2. Add business logic to service in `server/services/`
3. Register route in `server/server.js`
4. Add validation middleware
5. Write tests in `server/tests/`
6. Update `API.md` documentation (when created)

### Adding a New React Component
1. Create component in `client/src/components/`
2. Write component with PropTypes or TypeScript types (future)
3. Add styles (CSS module or inline styles)
4. Create test file in `client/src/__tests__/`
5. Import and use in parent component/page

### Running Tests
```bash
# Client tests (watch mode)
cd client && npm run test:watch

# Client tests (single run)
cd client && npm run test:run

# Server tests
cd server && npm test

# All tests via CI
# Automatically runs on push via GitHub Actions
```

### Database Changes
1. Update `database/init.sql` schema
2. Drop and recreate local database:
   ```bash
   psql -U username -d postgres -c "DROP DATABASE queenbee;"
   psql -U username -d postgres -c "CREATE DATABASE queenbee;"
   psql -U username -d queenbee -f database/init.sql
   ```
3. Update test database schema similarly
4. Update services/queries to match new schema

---

## Troubleshooting Guide

### "Port already in use" errors
```bash
# Kill process on port 3000 (client)
lsof -ti :3000 | xargs kill -9

# Kill process on port 8080 (server)
lsof -ti :8080 | xargs kill -9
```

### Database connection errors
- Verify Docker container is running: `docker ps`
- Check credentials in `.env` match Docker setup
- Ensure PostgreSQL is listening on port 5432

### Stripe webhook not receiving events
- Verify webhook URL is registered in Stripe Dashboard
- Check webhook secret matches `.env` variable
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:8080/api/webhook`

### Tests failing
- Ensure test database exists and schema is current
- Check environment variables are set for test environment
- Clear Jest cache: `npm test -- --clearCache`

---

## When Working With AI Assistants

### Preferred Communication Style
- **Be specific**: Mention file paths and function names
- **Show errors**: Include full error messages and stack traces
- **Context first**: Reference what you're trying to accomplish
- **Test early**: Ask for tests alongside implementation code

### Information I Can Access
- Full project structure via file system tools
- All source code files
- Documentation files
- Test files and results

### What Helps Me Help You
- "The cart total calculation in CartContext.jsx is wrong when..."
- "Add input validation to the POST /api/orders endpoint"
- "Write tests for the ProductService.fetchAll() method"

### What Slows Me Down
- "Fix the bug" (which bug, where?)
- "Make it better" (what aspect, why?)
- Assuming I remember previous conversations (always provide context)

---

## Additional Resources

### Documentation Files
- `README.md` - Project overview and setup instructions
- `DEV-SETUP.md` - Development workflow and commands
- `docs/testing-context.md` - Testing philosophy and approach

### External Documentation
- [Stripe API Docs](https://stripe.com/docs/api)
- [PostgreSQL 15 Docs](https://www.postgresql.org/docs/15/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

## Version History

**Last Updated**: October 22, 2025  
**Project Version**: 1.0.0  
**Status**: Active Development

---

**Note to AI Assistants**: This file should be your first reference when working on the Queen Bee Candles project. When in doubt, ask for clarification rather than making assumptions about architecture or conventions.
