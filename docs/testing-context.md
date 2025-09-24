# Queen Bee Candles - Testing Implementation Context

## Project Overview

Full-stack e-commerce application for handcrafted beeswax candles with React frontend, Express backend, PostgreSQL database, and Stripe payments.

## Key Files to Reference

### Frontend Architecture

- `client/src/services/api.js` - **CRITICAL** - Client-side API service layer with error handling
- `client/src/context/CartContext.jsx` - Cart state management
- `client/src/components/` - React components needing integration tests
- `client/src/test/setup.js` - Existing Vitest test setup
- `client/package.json` - Current testing dependencies and scripts

### Backend Architecture

- `server/routes/` - API routes (products, stripe)
- `server/services/OrderService.js` - Database service layer (comprehensive)
- `server/controllers/` - Route controllers
- `server/middleware/` - Validation, error handling, security
- `server/config/database.js` - PostgreSQL connection

### Data & Configuration

- `server/data/data.json` - Current product data (Dragon, Corn Cob, Bee and Flower, Rose)
- `server/.env` - Environment variables (Stripe keys, DB config)
- `init.sql` - Database schema (products, customers, orders, order_items)

## Current Testing State

### ✅ Existing Tests

- **Client:** Basic Vitest setup with some component tests
- **Test files:** `client/src/components/ProductDetail.test.jsx`
- **Setup:** React Testing Library, Jest DOM matchers

### ❌ Missing Tests

- **Server:** No API testing infrastructure
- **Integration:** No client-server communication tests
- **E2E:** No end-to-end workflow tests
- **Database:** No service layer tests

## Critical Implementation Details

### API Service Patterns (from `services/api.js`)

```javascript
// Error types to test
APIError, NetworkError, ValidationError

// Key methods needing tests
productAPI.getAll()
productAPI.getById(id)
paymentAPI.createPaymentIntent(data)
paymentAPI.createOrder(data)

// Retry logic and timeout handling
fetchWithRetry() with exponential backoff
30-second timeout with abort controller
```

### Actual Product Data (from `data.json`)

```javascript
[
  { id: 1, title: "Dragon", price: 1500, image: "dragon.jpg" },
  { id: 2, title: "Corn Cob", price: 1600, image: "corn-cob.jpg" },
  { id: 3, title: "Bee and Flower", price: 850, image: "bee-and-flower.jpg" },
  { id: 4, title: "Rose", price: 800, image: "rose.jpg" },
];
```

### Database Schema (from `init.sql`)

```sql
-- Key tables to test
products (id, title, price, description, image, stock_quantity)
customers (id, email, first_name, created_at)
orders (id, order_id, customer_id, total_amount, status, payment_intent_id)
order_items (id, order_id, product_id, quantity, unit_price, total_price)
```

### Stripe Integration Specifics

- **Test mode:** Uses Stripe test keys
- **Currency:** NZD (New Zealand Dollars)
- **Postal code:** Hidden due to NZ validation issues (`hidePostalCode: true`)
- **Payment flow:** Client creates intent → Stripe payment → Server creates order

## Testing Priorities & Requirements

### 1. Server API Tests (HIGHEST PRIORITY)

**Framework:** Jest + Supertest  
**Target routes:**

- `GET /api/products` - Test with actual product data
- `GET /api/products/:id` - Test valid/invalid IDs
- `POST /api/stripe/create-payment-intent` - Mock Stripe calls
- `POST /api/stripe/create-order` - Test OrderService integration
- `GET /api/stripe/payment-intent/:id` - Test Stripe retrieval
- `GET /api/stripe/order/:paymentIntentId` - Test order retrieval

**Database testing:**

- Test OrderService.createOrder() with transactions
- Test inventory updates (stock_quantity reduction)
- Test customer creation/updates
- Test duplicate order prevention

### 2. Enhanced Client Tests

**Framework:** Expand existing Vitest setup  
**Key components:**

- Cart workflow with real API calls (mocked)
- Payment flow integration
- Error boundary testing
- API service method testing (`services/api.js`)

### 3. Integration Tests

**Test complete data flow:**

- Product loading: Server → Client → Display
- Cart operations: Client → Context → Persistence
- Checkout flow: Client → Stripe → Server → Database

### 4. E2E Tests

**Framework:** Playwright (recommended)  
**Critical user journeys:**

- Browse products → Add to cart → Checkout → Payment success
- Error scenarios (payment failures, network issues)
- Cart persistence across page refreshes

## Implementation Constraints

### Environment Setup

- **Server testing:** Requires separate test database
- **Stripe testing:** Must use test mode and mock webhooks
- **Client testing:** Mock all external API calls
- **Database:** Use Docker PostgreSQL for consistent test environment

### Existing Patterns to Follow

- **Error handling:** Follow patterns in `services/api.js`
- **Validation:** Use existing middleware patterns
- **Response formats:** Match current API response structures
- **Naming:** Follow existing component and service naming

### Technical Requirements

- **Coverage targets:** 80%+ on critical paths
- **Performance:** API tests under 100ms average
- **Isolation:** Each test must be independent
- **CI/CD ready:** Tests must run in automated pipelines

## Success Criteria

1. **Complete API test coverage** for all endpoints
2. **Database transaction testing** with proper rollback scenarios
3. **Client service testing** covering all error scenarios
4. **Integration testing** of payment flow end-to-end
5. **E2E testing** of complete user purchase journey
6. **Performance baseline** establishment for optimization
7. **CI/CD integration** ready for automated testing

## Notes for Implementation

- Use existing product data (Dragon, Corn Cob, etc.) in all test fixtures
- Follow the error patterns established in `services/api.js`
- Test both success and failure scenarios for every endpoint
- Mock Stripe API calls to avoid charges during testing
- Ensure test database isolation and cleanup
- Consider NZ-specific requirements (currency, postal codes)
