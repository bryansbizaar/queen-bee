// Test environment configuration to prevent database conflicts
// client/src/tests/setup/testConfig.js

export const TEST_CONFIG = {
  // Use in-memory data only - never write to real database
  useInMemoryData: true,
  
  // Disable any database insertion attempts in tests
  disableDatabaseWrites: true,
  
  // Mock all API calls that would modify data
  mockApiCalls: true,
  
  // Use consistent test data that matches your real product schema
  realProductSchema: true
};

// Real product data for consistent testing (no database insertion)
export const REAL_PRODUCTS_FOR_TESTS = [
  {
    id: 1,
    title: "Dragon",
    price: 1500,
    description: "150g 11.5H x 8W",
    image: "dragon.jpg"
  },
  {
    id: 2,
    title: "Corn Cob", 
    price: 1600,
    description: "160g 15.5H x 4.5W",
    image: "corn-cob.jpg"
  },
  {
    id: 3,
    title: "Bee and Flower",
    price: 850, 
    description: "45g 3H X 6.5W",
    image: "bee-and-flower.jpg"
  },
  {
    id: 4,
    title: "Rose",
    price: 800,
    description: "40g 3H X 6.5W", 
    image: "rose.jpg"
  }
];

// Helper to get consistent test data without database access
export const getTestProduct = (id = 1) => {
  return REAL_PRODUCTS_FOR_TESTS.find(p => p.id === id) || REAL_PRODUCTS_FOR_TESTS[0];
};

// Mock API responses that use your real data structure
export const mockApiResponses = {
  products: {
    success: true,
    data: {
      products: REAL_PRODUCTS_FOR_TESTS
    }
  },
  
  singleProduct: (id) => ({
    success: true,
    data: getTestProduct(id)
  }),
  
  createOrder: (orderData) => ({
    success: true,
    order: {
      id: Math.floor(Math.random() * 1000),
      order_id: `QBC-TEST-${Date.now()}`,
      ...orderData,
      status: 'paid'
    }
  })
};

export default TEST_CONFIG;
