# Queen Bee Candles - Project Context & Planning

## Project Overview
Professional React/Express e-commerce site for handcrafted beeswax candles.
- **Business Type**: Small artisan candle business with growth potential
- **Core Functionality**: Product catalog, cart management, secure Stripe checkout
- **Philosophy**: "Right-sized solutions for actual business needs"

## Current State
Clean, production-ready e-commerce application with modern architecture:
- ✅ Working product catalog with expandable inventory
- ✅ Full shopping cart functionality
- ✅ Secure Stripe payment integration
- ✅ PostgreSQL database with proper schema
- ✅ Clean component architecture
- ✅ Responsive design for all devices

## Project Goals

### Primary Objectives
1. **Functional E-commerce Site** - Reliable platform for selling candles
2. **Portfolio Demonstration** - Showcase professional development skills
3. **Scalable Foundation** - Architecture that can grow with business needs
4. **Maintainable Codebase** - Clean, readable code for long-term sustainability

### Technical Standards
- **Security First**: Proper validation, CORS, secure payment processing
- **Performance Optimized**: Efficient database queries, fast loading times
- **Accessible Design**: WCAG compliance for inclusive user experience  
- **Mobile Ready**: Responsive design across all device sizes
- **Production Quality**: Error handling, logging, proper deployment practices

## Architecture Decisions

### Technology Stack Rationale
- **React**: Component-based architecture for maintainable UI
- **Express**: Lightweight, flexible server framework
- **PostgreSQL**: Reliable, scalable database for transactional data
- **Stripe**: Industry-standard payment processing
- **Docker**: Consistent development and deployment environments

### Testing Strategy
- **Focused Testing**: 11 essential tests covering critical business functionality
- **Manual Verification**: Quick checklist for release validation
- **Right-Sized Approach**: Testing effort proportional to business complexity

## Current Technical Implementation

### Frontend Architecture
```
client/
├── components/     # Reusable UI components
├── context/        # Global state management (cart, user)
├── services/       # API communication layer
└── __tests__/      # Essential functionality tests
```

### Backend Architecture
```
server/
├── routes/         # API endpoint definitions
├── services/       # Business logic layer
├── middleware/     # Security, validation, error handling
└── simple-tests/   # API health and integration tests
```

### Database Design
- **products**: Expandable catalog with inventory tracking
- **customers**: User information and preferences
- **orders**: Complete order history and tracking
- **order_items**: Detailed purchase records

## Development Workflow

### Daily Development
```bash
npm run dev          # Start both client and server
npm run test         # Run essential test suite
```

### Quality Assurance
- **Automated**: Essential test suite (< 10 seconds)
- **Manual**: Quick smoke test before releases (2 minutes)
- **Code Review**: Clean, readable code standards

### Deployment Process
- **Environment**: Production database and Stripe configuration
- **Build**: Optimized client bundle
- **Validation**: Full manual testing checklist
- **Monitoring**: Error tracking and performance metrics

## Growth Planning

### Immediate Opportunities
- **Product Expansion**: Architecture supports unlimited products
- **Feature Enhancement**: User accounts, order history, reviews
- **Payment Options**: Additional payment methods, subscriptions
- **Marketing Integration**: SEO optimization, analytics, email capture

### Scalability Considerations
- **Database**: PostgreSQL can handle significant growth
- **Caching**: Redis integration for high-traffic scenarios
- **CDN**: Static asset optimization for global performance
- **Microservices**: Service separation if complexity increases

## Success Metrics

### Business Metrics
- **Conversion Rate**: Percentage of visitors who complete purchases
- **Average Order Value**: Revenue per transaction
- **Customer Retention**: Repeat purchase behavior
- **Site Performance**: Page load times and user experience

### Technical Metrics
- **Uptime**: Site availability and reliability
- **Security**: No breaches or vulnerabilities
- **Performance**: Fast loading across all devices
- **Maintainability**: Easy to update and extend

## Key Principles

### Development Philosophy
1. **Business Value First**: Every feature should solve a real problem
2. **Right-Sized Solutions**: Complexity should match business scale
3. **Quality Over Quantity**: Better to do fewer things excellently
4. **Future-Friendly**: Architecture that enables growth without rewrites

### Decision Framework
When evaluating new features or changes, ask:
- Does this solve an actual business or user problem?
- Is the complexity appropriate for our scale?
- Will this be maintainable long-term?
- Does this align with our core goals?

## Current Priorities

### Maintenance Focus
- **Security Updates**: Keep dependencies current
- **Performance Monitoring**: Track and optimize key metrics
- **User Experience**: Continuous improvement based on feedback
- **Documentation**: Keep setup and usage instructions current

### Growth Preparation
- **Analytics Implementation**: Understanding user behavior
- **SEO Optimization**: Improving search visibility
- **Content Management**: Easy product addition workflows
- **Customer Insights**: Order patterns and preferences

## Technical Standards

### Code Quality
- **Consistent Patterns**: Follow established architectural decisions
- **Clear Naming**: Self-documenting code and components
- **Error Handling**: Graceful failure and user feedback
- **Performance**: Efficient algorithms and database queries

### Security Requirements
- **Input Validation**: All user data properly sanitized
- **Authentication**: Secure session management
- **Payment Security**: PCI compliance through Stripe
- **Data Protection**: Proper handling of customer information

---

**Last Updated**: January 2025  
**Purpose**: Strategic planning and development guidance for Queen Bee Candles project