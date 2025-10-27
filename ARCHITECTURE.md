# Architecture Documentation - Queen Bee Candles

**Version**: 1.0  
**Last Updated**: October 22, 2025  
**Status**: Active Development

---

[Previous content remains the same through CI/CD Pipeline section...]

### CI/CD Pipeline

**Current**: GitHub Actions
```yaml
Trigger: Push to main branch
  │
  ├─> Install Dependencies
  │   ├─> Client dependencies
  │   └─> Server dependencies
  │
  ├─> Run Tests
  │   ├─> Client tests (Vitest)
  │   └─> Server tests (Jest)
  │
  ├─> Build Application
  │   ├─> Client: npm run build (Vite)
  │   └─> Server: Verify syntax
  │
  └─> Deploy (Manual - planned automation)
      └─> Deploy to hosting platform
```

**Test Coverage Requirements**:
- Minimum 70% code coverage (current target)
- All critical paths must have tests
- Payment flow must be fully tested
- Database transactions must be tested

**Deployment Checklist**:
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhook endpoint registered
- [ ] CORS origins updated for production
- [ ] SSL certificate active
- [ ] Monitoring and logging configured

---

## Future Enhancements

### Phase 1: Customer Accounts (Q1 2026)

**Features**:
- User registration and authentication (JWT)
- Customer dashboard
- Order history
- Saved addresses
- Wishlist functionality

**Architecture Changes**:
```
New Tables:
├── users (authentication)
├── addresses (shipping/billing)
├── wishlists
└── wishlist_items

New Endpoints:
├── POST /api/auth/register
├── POST /api/auth/login
├── GET  /api/users/profile
├── GET  /api/users/orders
└── POST /api/wishlists
```

**Security Enhancements**:
- JWT token authentication
- Refresh token rotation
- Password hashing (bcrypt)
- Email verification
- Rate limiting on auth endpoints

---

### Phase 2: Admin Dashboard (Q2 2026)

**Features**:
- Product management (CRUD)
- Inventory tracking
- Order fulfillment
- Customer management
- Sales analytics
- Report generation

**Architecture Changes**:
```
New Roles:
├── admin
├── manager
└── staff

New Endpoints:
├── Admin Products: POST/PUT/DELETE /api/admin/products
├── Admin Orders: GET/PATCH /api/admin/orders
├── Admin Analytics: GET /api/admin/analytics
└── Admin Users: GET /api/admin/users
```

**Authorization Pattern**:
```javascript
// Middleware for admin routes
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};
```

---

### Phase 3: Advanced Features (Q3-Q4 2026)

**Email Notifications**:
- Order confirmation emails
- Shipping notifications
- Marketing campaigns
- Service: SendGrid or AWS SES

**Inventory Alerts**:
- Low stock notifications
- Automatic reorder suggestions
- Stock movement tracking

**Analytics & Reporting**:
- Google Analytics integration
- Custom dashboard metrics
- Sales reports
- Customer behavior tracking

**Search & Filtering**:
- Elasticsearch for product search
- Faceted search (price, category, etc.)
- Search suggestions
- Recently viewed products

**Reviews & Ratings**:
```
New Tables:
├── product_reviews
│   ├── id
│   ├── product_id
│   ├── user_id
│   ├── rating (1-5)
│   ├── title
│   ├── comment
│   └── created_at
└── review_images
```

---

### Phase 4: Mobile & Performance (2027)

**Mobile Applications**:
- React Native mobile app
- Push notifications
- Mobile-optimized checkout
- Offline mode support

**Performance Enhancements**:
- GraphQL API (optional)
- Server-Side Rendering (SSR)
- Progressive Web App (PWA)
- Service workers for offline support

**Infrastructure Upgrades**:
- Microservices architecture (if needed)
- Message queue (RabbitMQ/Redis)
- Cache layer (Redis)
- CDN for global delivery

---

## Architectural Principles

### SOLID Principles Application

**Single Responsibility**:
- Services handle one domain (Product, Order)
- Controllers only handle HTTP layer
- Database module only handles connections

**Open/Closed**:
- Services can be extended without modification
- Middleware pattern allows adding features
- Plugin architecture for future extensions

**Liskov Substitution**:
- Service interfaces remain consistent
- Error handling follows hierarchy
- Mock implementations for testing

**Interface Segregation**:
- Minimal API contracts
- Controllers don't depend on unnecessary methods
- Clear separation between public/private methods

**Dependency Inversion**:
- Services depend on abstractions (database pool)
- External APIs wrapped in service layer
- Testable through dependency injection

---

### Design Patterns Used

**Singleton Pattern**:
```javascript
// Database connection pool
const pool = new Pool(config);
export default pool; // Single instance
```

**Service Layer Pattern**:
```javascript
// Business logic separated from HTTP
class OrderService {
  static async createOrder(data) { /* ... */ }
}
```

**Repository Pattern** (Implicit):
```javascript
// Database queries abstracted in services
ProductService.fetchAll()  // Hides SQL details
```

**Factory Pattern**:
```javascript
// Error creation
const createError = (type, message) => {
  switch(type) {
    case 'validation': return new ValidationError(message);
    case 'notFound': return new NotFoundError(message);
  }
};
```

**Middleware Pattern**:
```javascript
// Express middleware chain
app.use(cors());
app.use(rateLimit);
app.use(validateRequest);
```

---

## Documentation Standards

### Code Documentation

**Function Documentation**:
```javascript
/**
 * Create a new order with payment verification
 * @param {Object} orderData - Order details
 * @param {string} orderData.customerEmail - Customer email
 * @param {Array} orderData.items - Order items
 * @param {string} orderData.paymentIntentId - Stripe payment ID
 * @returns {Promise<Object>} Created order object
 * @throws {BadRequestError} If payment not confirmed
 * @throws {ConflictError} If insufficient stock
 */
static async createOrder(orderData) { /* ... */ }
```

**Inline Comments**:
```javascript
// Check for duplicate orders to prevent double-charging
const existingOrder = await OrderService.getOrderByPaymentIntent(
  paymentIntentId
);
```

### API Documentation

**See**: [API.md](API.md) for complete API documentation

**Documentation Includes**:
- All endpoints with examples
- Request/response formats
- Error scenarios
- Authentication requirements (future)
- Rate limiting details

---

## Testing Strategy

### Test Pyramid

```
                    ▲
                   ╱ ╲
                  ╱E2E╲        Few (Future)
                 ╱─────╲       - Playwright/Cypress
                ╱       ╲      - Critical user flows
               ╱─────────╲
              ╱Integration╲    Some (Expanding)
             ╱─────────────╲   - API integration tests
            ╱               ╲  - Database tests
           ╱─────────────────╲
          ╱       Unit        ╲ Many (Current Focus)
         ╱─────────────────────╲ - Component tests
        ╱                       ╲ - Service tests
       ╱─────────────────────────╲ - Utility tests
      ───────────────────────────── 
```

### Current Test Coverage

**Client (Vitest + React Testing Library)**:
- ✅ Cart Context functionality
- ✅ Product display components
- ✅ Cart operations (add, remove, update)
- ⏳ Checkout flow (planned)
- ⏳ Error scenarios (planned)

**Server (Jest)**:
- ✅ Order creation
- ✅ Product retrieval
- ✅ Database transactions
- ⏳ Payment flow (planned)
- ⏳ Error handling (planned)

### Coverage Targets & Performance Benchmarks

**Coverage Goals**:
- **Unit Tests**: 80%+ coverage on critical paths
- **Integration Tests**: 70%+ coverage on API flows
- **E2E Tests**: All critical user journeys covered

**Performance Benchmarks**:
- API tests: < 100ms average response time
- Database queries: < 50ms for simple queries
- Full test suite: < 30 seconds execution time
- Individual test isolation: No shared state between tests

### Test Implementation Priorities

**Priority 1: Server API Tests** (Highest Priority)
- **Framework**: Jest + Supertest
- **Target Endpoints**:
  - `GET /api/products` - All products retrieval
  - `GET /api/products/:id` - Single product with valid/invalid IDs
  - `POST /api/stripe/create-payment-intent` - Payment intent creation (mock Stripe)
  - `POST /api/stripe/create-order` - Order creation with OrderService integration
  - `GET /api/stripe/payment-intent/:id` - Payment status retrieval
  - `GET /api/stripe/order/:paymentIntentId` - Order retrieval by payment
- **Key Tests**:
  - Success and failure scenarios for every endpoint
  - Database transaction testing with proper rollback
  - Duplicate order prevention
  - Inventory updates (stock_quantity reduction)
  - Mock all Stripe API calls to avoid charges

**Priority 2: Client Integration Tests**
- **Framework**: Vitest + React Testing Library (expand existing setup)
- **Target Areas**:
  - API service layer (`services/api.js`)
  - Error handling (APIError, NetworkError, ValidationError)
  - Cart workflow with mocked API calls
  - Payment flow integration
  - Error boundary testing
- **Key Tests**:
  - Retry logic with exponential backoff
  - Timeout handling (30-second timeout)
  - Network error recovery
  - API response validation

**Priority 3: Integration Tests**
- **Complete Data Flow**:
  - Product loading: Server → Client → Display
  - Cart operations: Client → Context → State management
  - Checkout flow: Client → Stripe → Server → Database
- **Database Testing**:
  - OrderService.createOrder() with full transaction
  - Inventory updates in transactions
  - Customer creation/updates
  - Rollback scenarios on errors

**Priority 4: E2E Tests** (Future)
- **Framework**: Playwright (recommended)
- **Critical User Journeys**:
  - Browse products → Add to cart → Checkout → Payment success
  - Error scenarios (payment failures, network issues)
  - Cart persistence across navigation
  - Cross-browser compatibility (Chrome, Firefox, Safari)

### Environment-Specific Testing Considerations

**Currency & Localization**:
- All prices in NZD (New Zealand Dollars)
- Test with NZD currency formatting
- Amounts in cents (2499 = $24.99)

**Stripe Integration**:
- Use Stripe test mode (`sk_test_`, `pk_test_`)
- Mock webhook calls in tests
- Test cards: `4242 4242 4242 4242` (success), `4000 0027 6000 3184` (3D Secure)
- **NZ-Specific**: Postal code hidden in Stripe Elements (`hidePostalCode: true`) due to NZ validation issues

**Test Data**:
- Use actual product names in fixtures:
  - Dragon (id: 1, price: 1500)
  - Corn Cob (id: 2, price: 1600)
  - Bee and Flower (id: 3, price: 850)
  - Rose (id: 4, price: 800)

### Database Testing Requirements

**Test Database Setup**:
- Separate test database (`queen_bee_test`)
- Docker PostgreSQL for consistent environment
- Automated schema initialization before tests
- Complete cleanup after test runs

**Transaction Testing**:
```javascript
// Test pattern for transactions
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // Test operations
  await client.query('COMMIT');
  // Verify results
} catch (error) {
  await client.query('ROLLBACK');
  // Test rollback worked correctly
} finally {
  client.release();
}
```

**Isolation Requirements**:
- Each test must be independent
- No shared state between tests
- Reset database to known state between tests
- Use transactions for test isolation where possible

### CI/CD Testing Requirements

**GitHub Actions Pipeline**:
- All tests must run in automated environment
- PostgreSQL service container for database tests
- Environment variables injected securely
- Fail build on any test failure
- Test results reported in PR

**Performance Gates**:
- Full test suite: < 2 minutes
- No flaky tests (99%+ pass rate)
- Coverage reports generated
- Performance regression detection

---

## Monitoring & Observability

### Current State

**Logging**:
- Console logging for development
- Error logging to stdout
- No structured logging yet

**Metrics**:
- No application metrics
- Database connection pool stats
- GitHub Actions CI metrics

### Planned Improvements

**Structured Logging**:
```javascript
logger.info('Order created', {
  orderId: order.id,
  customerId: order.customer_id,
  amount: order.total_amount,
  timestamp: new Date().toISOString()
});
```

**Application Metrics**:
- Request rate and latency
- Error rates by endpoint
- Database query performance
- Payment success/failure rates
- Cart abandonment tracking

**Alerting**:
- High error rates
- Slow response times
- Payment failures
- Database connection issues
- Low inventory alerts

**Tools** (Planned):
- Logging: Winston or Pino
- Metrics: Prometheus
- Visualization: Grafana
- Error Tracking: Sentry
- APM: New Relic or DataDog

---

## Technical Debt & Known Issues

### Current Technical Debt

**High Priority**:
1. **No input validation middleware** - Joi schemas defined but not applied everywhere
2. **Limited error handling** - Generic error responses, not specific enough
3. **No request logging** - Hard to debug production issues
4. **Image optimization** - Images not compressed or served via CDN

**Medium Priority**:
1. **No code splitting** - Single bundle, slower initial load
2. **No caching strategy** - Every request hits database
3. **No database migrations** - Schema changes require manual SQL
4. **Limited test coverage** - Need more integration tests

**Low Priority**:
1. **No TypeScript** - Would improve type safety
2. **No API versioning** - Future breaking changes difficult
3. **No rate limiting on all endpoints** - Only payment endpoints protected
4. **No compression middleware** - Response sizes could be smaller

### Known Limitations

**Current Constraints**:
- Cart not persisted (clears on refresh)
- No customer accounts (anonymous checkout only)
- No order tracking after purchase
- No email notifications
- Limited product search (no filtering)
- Single payment method (cards only)
- NZD currency only

**Workarounds**:
- Users advised to complete checkout in one session
- Order confirmation page shows order details
- Manual email notifications from admin

---

## Glossary

**Terms & Definitions**:

- **Payment Intent**: Stripe object representing intent to collect payment
- **Client Secret**: Temporary key for Stripe Elements to complete payment
- **Webhook**: HTTP callback from Stripe for payment events
- **Connection Pool**: Reusable database connections for performance
- **Idempotency**: Ensuring repeated requests don't cause duplicate actions
- **Parameterized Query**: SQL query with placeholders to prevent injection
- **Soft Delete**: Marking records inactive instead of deleting
- **Transaction**: Group of database operations that succeed or fail together
- **CORS**: Cross-Origin Resource Sharing for API access
- **Rate Limiting**: Restricting number of requests per time period
- **JWT**: JSON Web Token for authentication (planned)
- **SSR**: Server-Side Rendering for improved SEO
- **PWA**: Progressive Web App with offline capabilities

---

## References

### Internal Documentation
- [README.md](README.md) - Project overview and setup
- [API.md](API.md) - Complete API documentation
- [CLAUDE.md](CLAUDE.md) - AI assistant context
- [DEV-SETUP.md](DEV-SETUP.md) - Development environment setup
- [docs/testing-context.md](docs/testing-context.md) - Testing approach

### External Resources
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Vite Documentation](https://vitejs.dev)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## Changelog

### Version 1.0 (October 2025)
- Initial architecture documentation
- Complete system design documented
- Security architecture defined
- Payment flow documented
- Future roadmap outlined

---

## Contributing to Architecture

When proposing architectural changes:

1. **Document the Problem**
   - What limitation or issue does this address?
   - Current impact on users or developers

2. **Propose Solution**
   - Architectural changes required
   - Trade-offs and alternatives considered
   - Migration path from current state

3. **Consider Impact**
   - Breaking changes?
   - Performance implications?
   - Security considerations?
   - Testing requirements?

4. **Update Documentation**
   - This ARCHITECTURE.md file
   - API.md if endpoints change
   - CLAUDE.md if patterns change
   - README.md if setup changes

---

**Questions or Suggestions?**  
Open an issue or discussion on GitHub to propose architectural improvements.

---

*Last updated: October 22, 2025*
