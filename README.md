# Queen Bee Candles 🐝

A professional e-commerce platform for handcrafted beeswax candles, showcasing modern web development practices and enterprise-grade architecture.

## 🎯 Overview

This full-stack e-commerce application demonstrates complete product lifecycle management - from browsing beautiful handcrafted candles to secure payment processing. Built with React, Node.js, PostgreSQL, and Stripe integration, it showcases production-ready development practices that businesses can trust.

**Live Features**: Product catalog, shopping cart, secure checkout, order management, and inventory tracking.

---

## 🏆 Key Highlights

### **Business Value**

- **Secure Payment Processing**: Full Stripe integration with webhook validation
- **Production Ready**: PostgreSQL database, automated testing, CI/CD pipeline
- **Accessible Design**: WCAG compliance improvements for inclusive user experience
- **Mobile Optimized**: Responsive design across all devices

### **Technical Excellence**

- **Comprehensive Testing**: Automated test suites for reliability and maintainability
- **Security First**: Input validation, rate limiting, CORS protection, secure credential management
- **Performance Optimized**: Efficient database queries, optimized bundles, error boundaries
- **Professional Code**: Clean architecture, consistent patterns, comprehensive documentation

### **Modern Stack**

- **Frontend**: React, React Router, Context API, Stripe Elements
- **Backend**: Node.js, Express, PostgreSQL, Stripe webhook handling
- **DevOps**: GitHub Actions CI/CD, Docker containerization, automated testing
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

---

## 🚀 Quick Start

```bash
# Start PostgreSQL with Docker
docker run --name postgres-db -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres

# Server setup
cd server && npm install && npm run dev

# Client setup
cd client && npm install && npm run dev
```

**Prerequisites**: Node.js 18+, Docker, Stripe account

---

## 🧪 Quality Assurance

- **Full Test Coverage**: Server and client test suites with automated CI/CD validation
- **Accessibility Testing**: Automated compliance checks with axe-core integration
- **Security Validation**: Input sanitization, rate limiting, secure payment processing
- **Performance Monitoring**: Optimized queries, efficient rendering, error tracking

---

## 💼 Why This Matters

This project demonstrates the kind of **reliable, scalable, and maintainable** software architecture that businesses need. From secure payment processing to accessibility compliance, every aspect reflects enterprise-level development practices.

**Perfect for**: E-commerce platforms, small business websites, or any application requiring secure transactions and professional user experience.

---

## 📱 API Endpoints

- `GET /api/products` - Product catalog
- `POST /api/orders` - Order management
- `POST /api/stripe/*` - Payment processing
- `GET /images/*` - Static asset delivery

---

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)** - Complete project context for AI assistants
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design decisions
- **[API.md](API.md)** - Comprehensive API documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes
- **[DEV-SETUP.md](DEV-SETUP.md)** - Development environment setup
- **[.env.example](server/.env.example)** - Environment configuration templates

---

_Showcasing professional web development with modern technologies, comprehensive testing, and production-ready architecture._
