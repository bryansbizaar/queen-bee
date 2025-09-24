// Shared test data for Queen Bee Candles testing

// Test product data - matches real Queen Bee product structure
export const TEST_PRODUCTS = [
  {
    id: 1,
    title: 'Dragon',
    price: 1500,
    image: 'dragon.jpg',
    category: 'figurine',
    stock: 5,
    description: 'Handcrafted beeswax dragon candle with intricate details',
    featured: true,
    weight: 250,
    burnTime: 12,
    dimensions: '15cm x 8cm x 10cm'
  },
  {
    id: 2,
    title: 'Corn Cob',
    price: 1600,
    image: 'corn-cob.jpg',
    category: 'shaped',
    stock: 3,
    description: 'Realistic corn cob beeswax candle with natural texture',
    featured: false,
    weight: 200,
    burnTime: 10,
    dimensions: '18cm x 4cm x 4cm'
  },
  {
    id: 3,
    title: 'Bee and Flower',
    price: 850,
    image: 'bee-and-flower.jpg',
    category: 'nature',
    stock: 8,
    description: 'Beautiful bee and flower design in natural beeswax',
    featured: true,
    weight: 150,
    burnTime: 8,
    dimensions: '10cm x 6cm x 8cm'
  },
  {
    id: 4,
    title: 'Rose',
    price: 800,
    image: 'rose.jpg',
    category: 'nature',
    stock: 10,
    description: 'Elegant rose-shaped beeswax candle',
    featured: false,
    weight: 120,
    burnTime: 6,
    dimensions: '8cm x 8cm x 6cm'
  },
  {
    id: 5,
    title: 'Beehive',
    price: 1200,
    image: 'beehive.jpg',
    category: 'shaped',
    stock: 6,
    description: 'Traditional beehive candle with natural honey scent',
    featured: true,
    weight: 180,
    burnTime: 9,
    dimensions: '12cm x 9cm x 9cm'
  }
]

// Test cart items
export const TEST_CART_ITEMS = [
  {
    id: 1,
    title: 'Dragon',
    price: 1500,
    quantity: 1,
    image: 'dragon.jpg',
    category: 'figurine'
  },
  {
    id: 2,
    title: 'Corn Cob',
    price: 1600,
    quantity: 2,
    image: 'corn-cob.jpg',
    category: 'shaped'
  }
]

// Test customer data
export const TEST_CUSTOMERS = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+64 21 123 4567',
    address: {
      street: '123 Main Street',
      city: 'Auckland',
      postalCode: '1010',
      country: 'New Zealand'
    }
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+64 21 987 6543',
    address: {
      street: '456 Queen Street',
      city: 'Wellington',
      postalCode: '6011',
      country: 'New Zealand'
    }
  }
]

// Test order data
export const TEST_ORDERS = [
  {
    id: 'QBC-TEST-12345',
    customerEmail: 'john@example.com',
    customerName: 'John Smith',
    items: [
      {
        productId: 1,
        title: 'Dragon',
        price: 1500,
        quantity: 1
      }
    ],
    subtotal: 1500,
    tax: 225,
    shipping: 0,
    total: 1725,
    status: 'confirmed',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '123 Main Street',
      city: 'Auckland',
      postalCode: '1010',
      country: 'New Zealand'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'QBC-TEST-67890',
    customerEmail: 'jane@example.com',
    customerName: 'Jane Doe',
    items: [
      {
        productId: 2,
        title: 'Corn Cob',
        price: 1600,
        quantity: 2
      },
      {
        productId: 3,
        title: 'Bee and Flower',
        price: 850,
        quantity: 1
      }
    ],
    subtotal: 4050,
    tax: 607.5,
    shipping: 0,
    total: 4657.5,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '456 Queen Street',
      city: 'Wellington',
      postalCode: '6011',
      country: 'New Zealand'
    },
    createdAt: '2024-01-16T14:15:00Z',
    updatedAt: '2024-01-16T14:15:00Z'
  }
]

// Test form data
export const TEST_FORM_DATA = {
  checkout: {
    valid: {
      email: 'test@example.com',
      name: 'Test Customer',
      phone: '+64 21 123 4567',
      address: {
        street: '123 Test Street',
        city: 'Auckland',
        postalCode: '1010',
        country: 'New Zealand'
      }
    },
    invalid: {
      email: 'invalid-email',
      name: '',
      phone: 'invalid-phone',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: ''
      }
    }
  },
  
  contact: {
    valid: {
      name: 'Test Customer',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message'
    },
    invalid: {
      name: '',
      email: 'invalid-email',
      subject: '',
      message: ''
    }
  }
}

// Test API responses
export const TEST_API_RESPONSES = {
  success: {
    products: {
      success: true,
      data: TEST_PRODUCTS
    },
    order: {
      success: true,
      data: TEST_ORDERS[0]
    },
    paymentIntent: {
      success: true,
      data: {
        id: 'pi_test_12345',
        client_secret: 'pi_test_12345_secret_test',
        amount: 1725,
        currency: 'nzd'
      }
    }
  },
  
  error: {
    products: {
      success: false,
      error: 'Failed to fetch products'
    },
    order: {
      success: false,
      error: 'Failed to create order'
    },
    paymentIntent: {
      success: false,
      error: 'Payment failed'
    }
  },
  
  validation: {
    order: {
      success: false,
      error: 'Validation failed',
      details: {
        email: 'Invalid email format',
        items: 'Cart cannot be empty'
      }
    }
  }
}

// Test categories
export const TEST_CATEGORIES = [
  { id: 'all', name: 'All Products', count: 5 },
  { id: 'figurine', name: 'Figurines', count: 1 },
  { id: 'shaped', name: 'Shaped Candles', count: 2 },
  { id: 'nature', name: 'Nature', count: 2 }
]

// Test search queries
export const TEST_SEARCH_QUERIES = {
  valid: ['dragon', 'corn', 'bee', 'rose', 'beehive'],
  invalid: ['xyz', '123', ''],
  partial: ['drag', 'cor', 'be']
}

// Test price ranges
export const TEST_PRICE_RANGES = [
  { min: 0, max: 1000, label: 'Under $10' },
  { min: 1000, max: 1500, label: '$10 - $15' },
  { min: 1500, max: 2000, label: '$15 - $20' },
  { min: 2000, max: null, label: 'Over $20' }
]

// Test error scenarios
export const TEST_ERROR_SCENARIOS = {
  network: {
    message: 'Network error',
    code: 'NETWORK_ERROR'
  },
  server: {
    message: 'Internal server error',
    code: 'SERVER_ERROR',
    status: 500
  },
  validation: {
    message: 'Validation error',
    code: 'VALIDATION_ERROR',
    status: 400
  },
  notFound: {
    message: 'Not found',
    code: 'NOT_FOUND',
    status: 404
  },
  unauthorized: {
    message: 'Unauthorized',
    code: 'UNAUTHORIZED',
    status: 401
  }
}

// Test user interactions
export const TEST_USER_INTERACTIONS = {
  addToCart: {
    productId: 1,
    quantity: 1
  },
  removeFromCart: {
    productId: 1
  },
  updateQuantity: {
    productId: 1,
    quantity: 3
  },
  clearCart: true,
  checkout: {
    items: TEST_CART_ITEMS,
    customer: TEST_CUSTOMERS[0]
  }
}

// Test loading states
export const TEST_LOADING_STATES = {
  products: false,
  cart: false,
  checkout: false,
  order: false,
  payment: false
}

// Helper functions for test data
export const getProductById = (id) => {
  return TEST_PRODUCTS.find(product => product.id === id)
}

export const getProductsByCategory = (category) => {
  if (category === 'all') return TEST_PRODUCTS
  return TEST_PRODUCTS.filter(product => product.category === category)
}

export const searchProducts = (query) => {
  if (!query) return TEST_PRODUCTS
  return TEST_PRODUCTS.filter(product => 
    product.title.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase())
  )
}

export const calculateCartTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

export const calculateTax = (subtotal, rate = 0.15) => {
  return Math.round(subtotal * rate)
}

export const generateOrderId = () => {
  return `QBC-TEST-${Date.now()}`
}
