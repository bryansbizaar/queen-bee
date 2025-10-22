# API Documentation - Queen Bee Candles

**Base URL**: `http://localhost:8080` (development)  
**API Version**: 1.0  
**Last Updated**: October 22, 2025

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Products API](#products-api)
- [Orders API](#orders-api)
- [Shipping API](#shipping-api)
- [Stripe Payment API](#stripe-payment-api)
- [Static Assets](#static-assets)

---

## Overview

The Queen Bee Candles API is a RESTful API that provides endpoints for managing products, orders, and payment processing. All endpoints return JSON responses and follow standard HTTP status codes.

### Base Endpoints

```
GET  /                          # API health check
GET  /api/products              # Product catalog
POST /api/orders                # Order management
POST /api/stripe/*              # Payment processing
GET  /images/:filename          # Static image serving
```

---

## Authentication

**Current Status**: No authentication required (public API for e-commerce)

**Future Implementation**: Admin endpoints will require JWT authentication
- Products: Create, update, delete
- Orders: Full order management
- Inventory: Stock adjustments

---

## Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional error details"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 25
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input or validation error |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource or constraint violation |
| 500 | Internal Server Error | Server-side error |

### Common Error Messages

```json
// Validation Error
{
  "success": false,
  "error": "Invalid email format"
}

// Not Found Error
{
  "success": false,
  "error": "Order not found"
}

// Conflict Error
{
  "success": false,
  "error": "Order already exists for this payment",
  "orderId": 123
}
```

---

## Rate Limiting

Rate limits are applied to protect against abuse:

| Endpoint Pattern | Limit | Window |
|-----------------|-------|--------|
| `/api/stripe/create-payment-intent` | 10 requests | 15 minutes |
| `/api/stripe/create-order` | 10 requests | 15 minutes |
| `/api/stripe/payment-intent/:id` | 20 requests | 15 minutes |
| `/api/stripe/order/:id` | 20 requests | 15 minutes |

**Response when rate limited:**
```json
{
  "success": false,
  "error": "Too many payment attempts. Please try again later."
}
```

---

## Products API

### Get All Products

Retrieve all available products with inventory information.

**Endpoint**: `GET /api/products`

**Query Parameters**: None

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Honeycomb Pillar Candle",
      "description": "Beautiful handcrafted beeswax candle",
      "price": 2499,
      "image": "/images/honeycomb-pillar.jpg",
      "category": "pillar",
      "stock_quantity": 15,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

**Notes**:
- Prices are in cents (NZD)
- Stock quantity shows current available inventory
- Images are relative paths, prepend base URL

---

### Get Product by ID

Retrieve detailed information for a specific product.

**Endpoint**: `GET /api/products/:id`

**Path Parameters**:
- `id` (integer, required): Product ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Honeycomb Pillar Candle",
    "description": "Beautiful handcrafted beeswax candle",
    "price": 2499,
    "image": "/images/honeycomb-pillar.jpg",
    "category": "pillar",
    "stock_quantity": 15,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error Response**: `404 Not Found`
```json
{
  "success": false,
  "error": "Product not found"
}
```

---

### Get Products by Category

Retrieve all products in a specific category.

**Endpoint**: `GET /api/products/category/:category`

**Path Parameters**:
- `category` (string, required): Category name (case-insensitive)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [ ... ],
  "count": 5,
  "category": "pillar"
}
```

**Valid Categories**:
- `pillar`
- `tealight`
- `taper`
- `votive`
- `container`

**Error Response**: `400 Bad Request`
```json
{
  "success": false,
  "error": "Invalid category"
}
```

---

### Get Product Categories

Retrieve list of all available product categories.

**Endpoint**: `GET /api/products/categories`

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "category": "pillar",
      "count": 8
    },
    {
      "category": "tealight",
      "count": 12
    }
  ]
}
```

---

### Get Product Stats

Retrieve product statistics and insights.

**Endpoint**: `GET /api/products/stats`

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "totalProducts": 25,
    "totalValue": 62475,
    "averagePrice": 2499,
    "categoriesCount": 5,
    "lowStockCount": 3
  }
}
```

---

### Create Product (Admin)

Create a new product. **Future feature - requires authentication**.

**Endpoint**: `POST /api/products`

**Request Body**:
```json
{
  "title": "New Candle",
  "description": "Product description",
  "price": 2499,
  "image": "/images/new-candle.jpg",
  "category": "pillar",
  "stock_quantity": 20
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 26,
    "title": "New Candle",
    "description": "Product description",
    "price": 2499,
    "image": "/images/new-candle.jpg",
    "category": "pillar",
    "stock_quantity": 20,
    "created_at": "2025-10-22T14:30:00Z"
  },
  "message": "Product created successfully"
}
```

**Validation**:
- `title` (required, string, non-empty)
- `price` (required, number, positive)
- `description` (optional, string)
- `image` (optional, string)
- `category` (optional, string, defaults to "candles")
- `stock_quantity` (optional, integer, defaults to 0)

---

### Check Product Stock

Check current stock level for a product.

**Endpoint**: `GET /api/products/:id/stock`

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "productId": 1,
    "stockQuantity": 15,
    "available": true
  }
}
```

---

### Get Low Stock Products (Admin)

Retrieve products with low stock levels.

**Endpoint**: `GET /api/products/admin/low-stock`

**Query Parameters**:
- `threshold` (integer, optional, default: 5): Stock level threshold

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "title": "Beeswax Taper",
      "stock_quantity": 2,
      "reorderNeeded": true
    }
  ],
  "count": 1
}
```

---

## Orders API

### Create Order

Create a new order after payment confirmation.

**Endpoint**: `POST /api/orders`

**Request Body**:
```json
{
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "customerPhone": "+64 21 123 4567",
  "shippingAddress": {
    "line1": "123 Main St",
    "city": "Auckland",
    "state": "Auckland",
    "postal_code": "1010",
    "country": "NZ"
  },
  "billingAddress": {
    "line1": "123 Main St",
    "city": "Auckland",
    "state": "Auckland",
    "postal_code": "1010",
    "country": "NZ"
  },
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 2499,
      "title": "Honeycomb Pillar Candle"
    }
  ],
  "paymentIntentId": "pi_1ABC2DEF3GHI4JKL",
  "totalAmount": 4998,
  "status": "completed"
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": 42,
    "customer_email": "customer@example.com",
    "customer_name": "John Doe",
    "total_amount": 4998,
    "status": "completed",
    "payment_intent_id": "pi_1ABC2DEF3GHI4JKL",
    "created_at": "2025-10-22T14:30:00Z",
    "items": [ ... ]
  }
}
```

**Validation**:
- `customerEmail` (required, valid email format)
- `items` (required, non-empty array)
- Each item must have: `productId`, `quantity` (positive), `price` (positive)
- `paymentIntentId` (required, string)
- `totalAmount` (required, positive number)

**Error Responses**:

`400 Bad Request` - Invalid input
```json
{
  "error": "Invalid email format"
}
```

`404 Not Found` - Product doesn't exist
```json
{
  "error": "One or more products not found",
  "details": "Product with ID 999 does not exist"
}
```

`409 Conflict` - Duplicate order or insufficient stock
```json
{
  "error": "Order already exists for this payment",
  "orderId": 42
}
```

```json
{
  "error": "Insufficient stock for one or more items",
  "details": "Product 'Honeycomb Pillar' has only 1 in stock, requested 2"
}
```

---

### Get Order by ID

Retrieve order details by order ID.

**Endpoint**: `GET /api/orders/:id`

**Path Parameters**:
- `id` (integer, required): Order ID (must be positive)

**Response**: `200 OK`
```json
{
  "success": true,
  "order": {
    "id": 42,
    "customer_email": "customer@example.com",
    "customer_name": "John Doe",
    "customer_phone": "+64 21 123 4567",
    "shipping_address": { ... },
    "billing_address": { ... },
    "total_amount": 4998,
    "status": "completed",
    "payment_intent_id": "pi_1ABC2DEF3GHI4JKL",
    "created_at": "2025-10-22T14:30:00Z",
    "updated_at": "2025-10-22T14:30:00Z",
    "items": [
      {
        "product_id": 1,
        "title": "Honeycomb Pillar Candle",
        "quantity": 2,
        "price": 2499
      }
    ]
  }
}
```

**Error Responses**:

`400 Bad Request` - Invalid ID
```json
{
  "error": "Valid order ID is required"
}
```

`404 Not Found` - Order doesn't exist
```json
{
  "error": "Order not found"
}
```

---

### Get Orders by Customer Email

Retrieve all orders for a specific customer.

**Endpoint**: `GET /api/orders/customer/:email`

**Path Parameters**:
- `email` (string, required): Customer email address

**Response**: `200 OK`
```json
{
  "success": true,
  "orders": [ ... ],
  "count": 3
}
```

**Error Response**: `400 Bad Request`
```json
{
  "error": "Invalid email format"
}
```

---

### Get Order by Payment Intent

Retrieve order associated with a Stripe payment intent.

**Endpoint**: `GET /api/orders/payment-intent/:paymentIntentId`

**Path Parameters**:
- `paymentIntentId` (string, required): Stripe payment intent ID

**Response**: `200 OK`
```json
{
  "success": true,
  "order": { ... }
}
```

**Error Response**: `404 Not Found`
```json
{
  "error": "Order not found for this payment intent"
}
```

---

### Get All Orders (Admin)

Retrieve all orders with pagination support.

**Endpoint**: `GET /api/orders`

**Query Parameters**:
- `limit` (integer, optional, default: 50, max: 100): Number of orders per page
- `offset` (integer, optional, default: 0): Offset for pagination
- `status` (string, optional): Filter by order status

**Response**: `200 OK`
```json
{
  "success": true,
  "orders": [ ... ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 25
  }
}
```

**Valid Status Values**:
- `pending`
- `paid`
- `completed`
- `cancelled`
- `refunded`

**Error Response**: `400 Bad Request`
```json
{
  "error": "Limit must be between 1 and 100"
}
```

---

### Get Order Statistics

Retrieve order statistics for a date range.

**Endpoint**: `GET /api/orders/stats`

**Query Parameters**:
- `startDate` (ISO date string, optional): Start of date range
- `endDate` (ISO date string, optional): End of date range

**Example**: `GET /api/orders/stats?startDate=2025-01-01&endDate=2025-01-31`

**Response**: `200 OK`
```json
{
  "success": true,
  "stats": {
    "totalOrders": 127,
    "totalRevenue": 317475,
    "averageOrderValue": 2499,
    "topProducts": [
      {
        "productId": 1,
        "title": "Honeycomb Pillar Candle",
        "quantitySold": 45
      }
    ]
  },
  "period": {
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-01-31T23:59:59Z"
  }
}
```

**Error Response**: `400 Bad Request`
```json
{
  "error": "Start date must be before end date"
}
```

---

## Shipping API

### Calculate Shipping Rates

Calculate shipping costs based on cart items and delivery postcode.

**Endpoint**: `POST /api/shipping/calculate`

**Request Body**:
```json
{
  "items": [
    {
      "id": 1,
      "quantity": 2
    }
  ],
  "postcode": "0110"
}
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "isRural": false,
  "isFallback": true,
  "options": [
    {
      "id": "FALLBACK_STANDARD",
      "service": "standard",
      "description": "Standard Delivery (Estimated)",
      "cost": 8.00,
      "estimatedDays": "3-5 business days",
      "recommended": true
    }
  ]
}
```

**With NZ Post API Key** (multiple options):
```json
{
  "status": "success",
  "isRural": false,
  "isFallback": false,
  "options": [
    {
      "id": "STANDARD",
      "service": "standard",
      "description": "Standard Delivery",
      "cost": 8.50,
      "estimatedDays": "3-5 business days",
      "recommended": true
    },
    {
      "id": "EXPRESS",
      "service": "express",
      "description": "Express Delivery",
      "cost": 15.00,
      "estimatedDays": "1-2 business days",
      "recommended": false
    },
    {
      "id": "COURIER",
      "service": "courier",
      "description": "Courier Delivery",
      "cost": 20.00,
      "estimatedDays": "Next business day",
      "recommended": false
    }
  ]
}
```

**Rural Delivery**:
```json
{
  "status": "success",
  "isRural": true,
  "isFallback": true,
  "options": [
    {
      "id": "FALLBACK_RURAL",
      "service": "rural",
      "description": "Rural Delivery (Estimated)",
      "cost": 12.00,
      "estimatedDays": "5-7 business days",
      "recommended": true
    }
  ]
}
```

**Validation**:
- `items` (required, non-empty array)
  - Each item must have `id` (integer) and `quantity` (positive integer)
- `postcode` (required, string): 4-digit NZ postcode matching `/^\d{4}$/`

**Notes**:
- Prices are in NZD dollars (not cents)
- `isFallback: true` indicates estimated rates (no NZ Post API key configured)
- `isFallback: false` indicates real-time NZ Post rates
- Rural detection: postcodes starting with 7, 8, or 9
- Packaging buffer automatically added (50g weight, 20mm padding per side)

**Error Responses**:

`400 Bad Request` - Missing items
```json
{
  "status": "failure",
  "error": "Items array required",
  "message": "Please provide cart items to calculate shipping"
}
```

`400 Bad Request` - Missing postcode
```json
{
  "status": "failure",
  "error": "Postcode required",
  "message": "Please provide a delivery postcode"
}
```

`400 Bad Request` - Invalid postcode format
```json
{
  "status": "failure",
  "error": "Invalid postcode format",
  "message": "Postcode must be 4 digits (e.g., 6011)"
}
```

`400 Bad Request` - Invalid items format
```json
{
  "status": "failure",
  "error": "Invalid items format",
  "message": "Each item must have id (integer) and quantity (positive integer)"
}
```

`500 Internal Server Error` - Calculation failed
```json
{
  "status": "failure",
  "error": "Failed to calculate shipping",
  "message": "An unexpected error occurred"
}
```

---

### Test Shipping Service

Health check endpoint to verify shipping service configuration.

**Endpoint**: `GET /api/shipping/test`

**Response**: `200 OK`
```json
{
  "status": "success",
  "message": "Shipping API is operational",
  "config": {
    "hasApiKey": false,
    "sourcePostcode": "0110",
    "packagingWeight": "0.05",
    "paddingPerSide": "20"
  }
}
```

**Configuration Details**:
- `hasApiKey`: Whether NZ Post API key is configured
- `sourcePostcode`: Origin postcode for shipping calculations
- `packagingWeight`: Weight added for packaging (kg)
- `paddingPerSide`: Padding added per dimension (mm)

**Note**: This endpoint is useful for verifying the shipping service is running and checking configuration without making actual shipping calculations.

---

## Stripe Payment API

### Create Payment Intent

Initialize a Stripe payment intent for checkout.

**Endpoint**: `POST /api/stripe/create-payment-intent`

**Rate Limit**: 10 requests per 15 minutes

**Request Body**:
```json
{
  "amount": 4998,
  "orderId": "ORDER-1234",
  "customerEmail": "customer@example.com",
  "cartItems": [
    {
      "id": 1,
      "title": "Honeycomb Pillar Candle",
      "quantity": 2,
      "price": 2499
    }
  ]
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1ABC2DEF3GHI4JKL_secret_XYZ",
    "paymentIntentId": "pi_1ABC2DEF3GHI4JKL"
  }
}
```

**Usage**:
1. Client collects cart and customer info
2. Client calls this endpoint to create payment intent
3. Client uses `clientSecret` with Stripe Elements to collect payment
4. Stripe processes payment
5. Client calls `/api/stripe/create-order` after successful payment

**Validation**:
- `amount` (required, positive number): Total amount in cents
- `orderId` (required, string): Unique order identifier
- `customerEmail` (required, valid email): Customer email
- `cartItems` (required, non-empty array): Cart items for metadata

**Error Response**: `500 Internal Server Error`
```json
{
  "success": false,
  "error": "Failed to create payment intent"
}
```

---

### Create Order After Payment

Create order in database after successful Stripe payment.

**Endpoint**: `POST /api/stripe/create-order`

**Rate Limit**: 10 requests per 15 minutes

**Request Body**:
```json
{
  "paymentIntentId": "pi_1ABC2DEF3GHI4JKL",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "shippingAddress": {
    "line1": "123 Main St",
    "city": "Auckland",
    "state": "Auckland",
    "postal_code": "1010",
    "country": "NZ"
  },
  "cartItems": [
    {
      "id": 1,
      "title": "Honeycomb Pillar Candle",
      "quantity": 2,
      "price": 2499
    }
  ]
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": 42,
    "status": "paid",
    "totalAmount": 4998,
    "customerEmail": "customer@example.com",
    "itemCount": 1,
    "createdAt": "2025-10-22T14:30:00Z"
  }
}
```

**Process**:
1. Verifies payment intent status with Stripe
2. Checks for duplicate orders
3. Validates cart items match payment intent metadata
4. Creates order in database
5. Updates product inventory

**If order already exists**: `200 OK`
```json
{
  "success": true,
  "message": "Order already exists",
  "data": {
    "orderId": 42,
    "status": "paid",
    "totalAmount": 4998
  }
}
```

**Error Responses**:

`400 Bad Request` - Payment not completed
```json
{
  "success": false,
  "error": "Payment has not been completed successfully"
}
```

`400 Bad Request` - Cart mismatch
```json
{
  "success": false,
  "error": "Cart items do not match payment intent"
}
```

`400 Bad Request` - Insufficient stock
```json
{
  "success": false,
  "error": "Insufficient stock for one or more items"
}
```

---

### Get Payment Intent Details

Retrieve Stripe payment intent information.

**Endpoint**: `GET /api/stripe/payment-intent/:paymentIntentId`

**Rate Limit**: 20 requests per 15 minutes

**Path Parameters**:
- `paymentIntentId` (string, required): Stripe payment intent ID (must start with `pi_`)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "pi_1ABC2DEF3GHI4JKL",
    "status": "succeeded",
    "amount": 4998,
    "currency": "nzd",
    "created": 1729612800,
    "metadata": {
      "orderId": "ORDER-1234",
      "customerEmail": "customer@example.com",
      "itemCount": "1"
    }
  }
}
```

**Payment Intent Statuses**:
- `requires_payment_method` - Awaiting payment method
- `requires_confirmation` - Ready for confirmation
- `requires_action` - Requires customer action (3D Secure)
- `processing` - Payment being processed
- `succeeded` - Payment successful
- `canceled` - Payment canceled

**Error Response**: `400 Bad Request`
```json
{
  "success": false,
  "error": "Invalid payment intent ID format"
}
```

---

### Get Order by Payment Intent

Retrieve order associated with a payment intent.

**Endpoint**: `GET /api/stripe/order/:paymentIntentId`

**Rate Limit**: 20 requests per 15 minutes

**Path Parameters**:
- `paymentIntentId` (string, required): Stripe payment intent ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 42,
    "customer_email": "customer@example.com",
    "total_amount": 4998,
    "status": "paid",
    "payment_intent_id": "pi_1ABC2DEF3GHI4JKL",
    "created_at": "2025-10-22T14:30:00Z",
    "items": [ ... ]
  }
}
```

**Error Response**: `404 Not Found`
```json
{
  "success": false,
  "error": "No order found for this payment intent"
}
```

---

## Static Assets

### Get Product Image

Serve product images as static files.

**Endpoint**: `GET /images/:filename`

**Path Parameters**:
- `filename` (string, required): Image filename with extension

**Example**: `GET /images/honeycomb-pillar.jpg`

**Response**: Image file (JPEG, PNG, WebP, etc.)

**Supported Formats**:
- `.jpg`, `.jpeg`
- `.png`
- `.webp`
- `.svg`

**Error Response**: `404 Not Found` if image doesn't exist

**Note**: Images are served from `server/public/images/` directory

---

## Payment Flow Example

Complete payment flow from cart to order:

```javascript
// 1. Create payment intent
const response = await fetch('/api/stripe/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 4998,
    orderId: 'ORDER-1234',
    customerEmail: 'customer@example.com',
    cartItems: [
      { id: 1, title: 'Candle', quantity: 2, price: 2499 }
    ]
  })
});
const { clientSecret, paymentIntentId } = await response.json();

// 2. Collect payment with Stripe Elements
const { error } = await stripe.confirmPayment({
  elements,
  clientSecret,
  confirmParams: {
    return_url: 'https://example.com/checkout/success'
  }
});

// 3. After successful payment, create order
if (!error) {
  await fetch('/api/stripe/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentIntentId,
      customerEmail: 'customer@example.com',
      customerName: 'John Doe',
      shippingAddress: { ... },
      cartItems: [ ... ]
    })
  });
}
```

---

## Testing

### Test Mode

Use Stripe test mode credentials for development:
- Publishable Key: `pk_test_...`
- Secret Key: `sk_test_...`

### Test Cards

| Number | Brand | Outcome |
|--------|-------|---------|
| 4242 4242 4242 4242 | Visa | Success |
| 4000 0027 6000 3184 | Visa | Requires 3D Secure |
| 4000 0000 0000 9995 | Visa | Declined (insufficient funds) |

**Expiry**: Any future date  
**CVC**: Any 3 digits  
**ZIP**: Any 5 digits

---

## Changelog

### Version 1.0 (October 2025)
- Initial API release
- Product catalog endpoints
- Order management endpoints
- Stripe payment integration
- Rate limiting and validation
- Static image serving

---

## Support

**Documentation**: [README.md](README.md), [CLAUDE.md](CLAUDE.md)  
**Issues**: GitHub Issues  
**Developer Setup**: [DEV-SETUP.md](DEV-SETUP.md)

---

*Last updated: October 22, 2025*
