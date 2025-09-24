# Queen Bee Candles API Documentation

## Base URL

- **Development:** `http://localhost:8080/api`

## Products API

### GET /products

Get all products from the database.

**Response:**

```json
[
  {
    "id": 1,
    "title": "Dragon",
    "image": "dragon.jpg",
    "price": 1500,
    "description": "150g 11.5H x 8W"
  },
  {
    "id": 2,
    "title": "Corn Cob",
    "image": "corn-cob.jpg",
    "price": 1600,
    "description": "160g 15.5H x 4.5W"
  },
  {
    "id": 3,
    "title": "Bee and Flower",
    "image": "bee-and-flower.jpg",
    "price": 850,
    "description": "45g 3H X 6.5W"
  },
  {
    "id": 4,
    "title": "Rose",
    "image": "rose.jpg",
    "price": 800,
    "description": "40g 3H X 6.5W"
  }
]
```

### GET /products/:id

Get a single product by ID.

**Parameters:**

- `id` (path) - Product ID (integer)

**Response (Success):**

```json
{
  "id": 1,
  "title": "Dragon",
  "image": "dragon.jpg",
  "price": 1500,
  "description": "150g 11.5H x 8W"
}
```

**Response (Not Found):**

```json
{
  "message": "Product not found"
}
```

## Stripe API

### POST /stripe/create-payment-intent

Create a Stripe payment intent for checkout.

**Request Body:**

```json
{
  "amount": 1500,
  "orderId": "QBC-1234567890-ABC123",
  "customerEmail": "customer@example.com",
  "cartItems": [
    {
      "id": 1,
      "title": "Dragon",
      "price": 1500,
      "quantity": 1
    }
  ]
}
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx"
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Invalid email format"
}
```

### POST /stripe/create-order

Create an order in the database after successful payment.

**Request Body:**

```json
{
  "paymentIntentId": "pi_xxx",
  "customerEmail": "customer@example.com",
  "cartItems": [
    {
      "id": 1,
      "title": "Dragon",
      "price": 1500,
      "quantity": 1
    }
  ],
  "customerName": "John Doe",
  "shippingAddress": {
    "line1": "123 Main Street",
    "city": "Whangarei",
    "state": "Northland",
    "postal_code": "",
    "country": "NZ"
  }
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": 123,
    "status": "paid",
    "totalAmount": 1500,
    "customerEmail": "customer@example.com",
    "itemCount": 1,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### GET /stripe/payment-intent/:paymentIntentId

Retrieve payment intent details from Stripe.

**Parameters:**

- `paymentIntentId` (path) - Stripe payment intent ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "pi_xxx",
    "status": "succeeded",
    "amount": 1500,
    "currency": "nzd",
    "created": 1642678800,
    "metadata": {
      "orderId": "QBC-1234567890-ABC123",
      "customerEmail": "customer@example.com"
    }
  }
}
```

### GET /stripe/order/:paymentIntentId

Get order details by payment intent ID.

**Parameters:**

- `paymentIntentId` (path) - Stripe payment intent ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "order_id": "QBC-1234567890-ABC123",
    "total_amount": 1500,
    "status": "paid",
    "customer_email": "customer@example.com",
    "items": [
      {
        "product_id": 1,
        "product_title": "Dragon",
        "quantity": 1,
        "unit_price": 1500,
        "total_price": 1500
      }
    ]
  }
}
```

## Error Responses

All endpoints follow this error format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Validation Rules

### Email Format

- Must be valid email format: `user@domain.com`

### Payment Amounts

- Minimum amount: 50 cents (50)
- Amount in cents (e.g., $15.00 = 1500)

### Cart Items

- Each item must have: `id`, `title`, `price`, `quantity`
- Quantity must be positive number
- Price must be positive number

### Address Fields

- Postal code is optional (NZ postal codes cause validation issues)
- Stripe CardElement has `hidePostalCode: true` option enabled

## Rate Limiting

- Payment endpoints: Limited to prevent abuse
- Retrieval endpoints: Limited for DoS protection
