# Changelog

All notable changes to Queen Bee Candles will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Shipping Calculator Feature**
  - Real-time shipping cost calculation integrated into checkout flow
  - NZ Post API integration with fallback rates for development
  - Automatic rural delivery detection based on postcode
  - Support for multiple delivery options (standard, express, courier)
  - Packaging-aware calculations (automatic weight and dimension buffers)
  - Product dimension tracking in database (migration script included)
  - ShippingCalculator React component with auto-calculation
  - Backend shipping service with validation and error handling
  - Comprehensive shipping API endpoints (`/api/shipping/calculate`, `/api/shipping/test`)
  - Complete documentation in SHIPPING-CALCULATOR.md
- Comprehensive documentation suite
  - CLAUDE.md for AI assistant context and project overview
  - ARCHITECTURE.md for system design and technical decisions
  - API.md for complete API endpoint documentation (updated with shipping endpoints)
  - DEPLOYMENT.md for production deployment guide
  - Enhanced testing strategy with detailed implementation priorities
- Environment configuration templates
  - server/.env.example with detailed comments including shipping config
  - client/.env.example with Vite-specific guidance
- Business context and development philosophy documentation
- Detailed testing requirements with NZ-specific considerations

### Changed
- README.md updated with documentation index and shipping calculator feature
- API.md updated with Shipping API section
- Cart checkout flow enhanced to include shipping cost calculation
- Database schema extended with product dimensions (weight_kg, length_mm, width_mm, height_mm)
- Consolidated documentation from /docs folder into root-level files
- Enhanced testing documentation with coverage targets and benchmarks

### Fixed
- Database connection properly configured (removed accidental command from .env)
- ShippingCalculator infinite render loop resolved with useRef
- React Hook dependency warnings resolved with useCallback
- Test configuration updated (Jest and Vitest) for proper test discovery
- CI/CD pipeline fixed to run tests from correct directories

---

## [1.0.0] - 2025-01-15

### Added

#### Core E-commerce Functionality
- **Product Catalog**
  - Display of handcrafted beeswax candles (Dragon, Corn Cob, Bee and Flower, Rose)
  - Product details with images, descriptions, and pricing
  - Inventory tracking with stock quantities
  - Category-based organization

- **Shopping Cart**
  - Add products to cart with quantity selection
  - Update item quantities
  - Remove items from cart
  - Real-time cart total calculation
  - Cart state management using React Context API

- **Secure Checkout**
  - Stripe payment integration with Payment Intents
  - Support for 3D Secure authentication
  - Real-time payment status updates
  - Order confirmation page
  - Customer email collection

- **Order Management**
  - Order creation with complete transaction support
  - Order history storage in database
  - Customer information management
  - Order tracking by payment intent ID
  - Automatic inventory updates on purchase

#### Frontend (React)
- **Technology Stack**
  - React 18 with hooks (useState, useEffect, useContext)
  - React Router 6 for client-side routing
  - Vite for fast development and optimized builds
  - Stripe Elements for secure payment UI

- **Components**
  - Header with navigation and cart indicator
  - ProductCard for product display
  - Cart component with sidebar functionality
  - CheckoutForm with Stripe integration
  - CartPage for full cart view
  - CheckoutSuccess for order confirmation

- **State Management**
  - CartContext for global cart state
  - No external state management library (appropriate for scale)
  - Local component state for UI interactions

- **Design**
  - Responsive layout for mobile, tablet, and desktop
  - Mobile-optimized navigation
  - Accessible design with ARIA labels
  - Loading states and error handling

#### Backend (Express)
- **API Architecture**
  - RESTful API design
  - Services layer pattern for business logic
  - Controllers for HTTP request handling
  - Clean separation of concerns

- **Endpoints**
  - `GET /api/products` - Retrieve all products
  - `GET /api/products/:id` - Get single product
  - `POST /api/stripe/create-payment-intent` - Initialize payment
  - `POST /api/stripe/create-order` - Create order after payment
  - `GET /api/stripe/payment-intent/:id` - Get payment status
  - `GET /api/stripe/order/:paymentIntentId` - Get order by payment
  - `POST /api/orders` - Create order
  - `GET /api/orders/:id` - Get order details
  - `GET /api/orders/customer/:email` - Get customer orders

- **Services**
  - ProductService for product operations
  - OrderService for order management with transactions
  - Stripe integration for payment processing

- **Middleware**
  - Error handling with proper HTTP status codes
  - CORS configuration
  - JSON body parsing
  - Request logging

#### Database (PostgreSQL)
- **Schema Design**
  - `products` table with inventory tracking
  - `customers` table for user information
  - `orders` table with payment integration
  - `order_items` table for order line items
  - Proper foreign key relationships and constraints

- **Features**
  - Transaction support for data integrity
  - Connection pooling for performance
  - Parameterized queries for SQL injection prevention
  - Indexes on frequently queried fields
  - Automatic timestamps (created_at, updated_at)

- **Data Management**
  - Price storage in cents for precision
  - Denormalized order items for historical accuracy
  - Soft delete support with is_active flag
  - Stock quantity tracking and updates

#### Payment Processing (Stripe)
- **Integration**
  - Payment Intent API for secure payments
  - Webhook handling for payment confirmation
  - Support for multiple payment methods
  - 3D Secure authentication support
  - PCI compliance through Stripe

- **Features**
  - Currency: NZD (New Zealand Dollars)
  - Payment intent creation with metadata
  - Order creation only after confirmed payment
  - Duplicate order prevention via payment intent ID
  - Webhook signature verification for security

- **Error Handling**
  - Payment failure scenarios
  - Network error recovery
  - Timeout handling
  - User-friendly error messages

#### Testing
- **Client Testing (Vitest)**
  - Cart Context functionality tests
  - Component rendering tests
  - User interaction tests
  - React Testing Library integration

- **Server Testing (Jest)**
  - Order creation tests
  - Product retrieval tests
  - Database transaction tests
  - API endpoint tests

- **CI/CD Pipeline (GitHub Actions)**
  - Automated test execution on push
  - Client and server test suites
  - PostgreSQL test database setup
  - Build verification
  - Deployment readiness checks

#### Security
- **Input Validation**
  - Email format validation
  - Required field validation
  - Data type checking
  - Range validation for quantities and prices

- **API Security**
  - Rate limiting on payment endpoints (10 requests/15 min)
  - Rate limiting on retrieval endpoints (20 requests/15 min)
  - CORS whitelist configuration
  - Helmet.js security headers

- **Database Security**
  - Parameterized SQL queries (prevents SQL injection)
  - Connection string in environment variables
  - Database credentials never committed to repo
  - Transaction rollback on errors

- **Payment Security**
  - Stripe webhook signature verification
  - Payment intent verification before order creation
  - No direct card data handling (PCI compliant via Stripe)
  - Secure API key management

- **Environment Protection**
  - All secrets in .env files
  - .env files in .gitignore
  - Separate test/development/production environments
  - .env.example templates without real credentials

#### Development Tools
- **Docker**
  - PostgreSQL container for local development
  - docker-compose.yml for easy setup
  - Consistent development environment

- **Development Workflow**
  - Concurrent client and server development
  - Hot module replacement (HMR) in Vite
  - Automatic server restart with nodemon
  - ESLint for code quality

- **Scripts**
  - `npm run dev` - Start both client and server
  - `npm run test` - Run all tests
  - `npm run build` - Build for production
  - `npm run install:all` - Install all dependencies

#### Documentation
- **Setup Documentation**
  - README.md with project overview and quick start
  - DEV-SETUP.md with development workflow
  - Environment variable examples
  - Troubleshooting guides

- **Code Quality**
  - ESLint configuration
  - Consistent code formatting
  - Clear component and function naming
  - Comments for complex logic

### Security
- Secure payment processing with Stripe Payment Intents
- Environment variable protection (never committed)
- SQL injection prevention through parameterized queries
- Rate limiting on payment and order endpoints (10-20 requests per 15 minutes)
- CORS configuration for production domains
- Stripe webhook signature verification
- Input validation on all user inputs
- Session security preparation (JWT-ready architecture)

### Technical Debt / Known Limitations
- Cart state not persisted (clears on page refresh)
- No customer authentication (anonymous checkout only)
- Limited product search functionality
- Single currency support (NZD only)
- No email notifications for orders
- No admin dashboard for inventory management
- Images not optimized or served via CDN
- No caching layer for API responses

---

## Version History

- **1.0.0** (2025-01-15) - Initial production release with full e-commerce functionality
- **Unreleased** - Documentation improvements and testing enhancements

---

## Future Roadmap

### Planned Features
- Customer accounts and authentication
- Order history for registered users
- Admin dashboard for inventory management
- Email notifications (order confirmation, shipping updates)
- Product search and filtering
- Customer reviews and ratings
- Wishlist functionality
- Multiple payment methods
- Inventory low stock alerts
- Sales analytics and reporting

### Technical Improvements
- Image optimization and CDN integration
- Redis caching layer
- Enhanced testing (E2E with Playwright)
- Performance monitoring
- Structured logging
- Database migrations system
- TypeScript migration (consideration)

---

## Notes

### Semantic Versioning
This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for added functionality in a backward compatible manner
- **PATCH** version for backward compatible bug fixes

### Changelog Maintenance
- Update [Unreleased] section as features are developed
- Move to versioned section when deploying to production
- Include dates in ISO format (YYYY-MM-DD)
- Group changes by category (Added, Changed, Deprecated, Removed, Fixed, Security)

---

*For more information, see the complete documentation in ARCHITECTURE.md, API.md, and DEPLOYMENT.md*
