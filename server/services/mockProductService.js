// Mock product data for development when database is not available

const mockProducts = [
  {
    id: 1,
    title: "Lavender Dreams",
    description: "Hand-poured beeswax candle with pure lavender essential oil. Creates a calming atmosphere perfect for relaxation and sleep.",
    price: 2800, // $28.00 in cents
    image: "/images/lavender-dreams.jpg",
    category: "aromatherapy",
    stock_quantity: 15
  },
  {
    id: 2,
    title: "Vanilla Honey Glow",
    description: "Warm vanilla and local honey blend in pure beeswax. Hand-crafted for a cozy, inviting ambiance.",
    price: 3200, // $32.00 in cents
    image: "/images/vanilla-honey.jpg", 
    category: "sweet",
    stock_quantity: 12
  },
  {
    id: 3,
    title: "Eucalyptus Fresh",
    description: "Energizing eucalyptus essential oil in premium beeswax. Perfect for home office or morning meditation.",
    price: 2600, // $26.00 in cents
    image: "/images/eucalyptus-fresh.jpg",
    category: "aromatherapy", 
    stock_quantity: 18
  },
  {
    id: 4,
    title: "Cinnamon Spice",
    description: "Warming cinnamon and clove blend. Hand-poured beeswax candle brings autumn comfort year-round.",
    price: 3000, // $30.00 in cents
    image: "/images/cinnamon-spice.jpg",
    category: "spiced",
    stock_quantity: 8
  },
  {
    id: 5,
    title: "Ocean Breeze",
    description: "Fresh sea salt and marine botanicals. Pure beeswax candle captures the essence of coastal tranquility.",
    price: 3400, // $34.00 in cents
    image: "/images/ocean-breeze.jpg",
    category: "fresh",
    stock_quantity: 10
  },
  {
    id: 6,
    title: "Rose Garden",
    description: "Delicate rose petals and geranium in golden beeswax. Romantic and elegant for special occasions.",
    price: 3800, // $38.00 in cents
    image: "/images/rose-garden.jpg",
    category: "floral",
    stock_quantity: 6
  }
];

export class MockProductService {
  // Get all active products
  static async getAllProducts() {
    try {
      // Simulate database delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockProducts;
    } catch (error) {
      console.error("Error fetching mock products:", error);
      throw new Error("Failed to fetch products");
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const product = mockProducts.find(p => p.id === parseInt(id));
      return product || null;
    } catch (error) {
      console.error("Error fetching mock product:", error);
      throw new Error("Failed to fetch product");
    }
  }

  // Get products by category
  static async getProductsByCategory(category) {
    try {
      await new Promise(resolve => setTimeout(resolve, 75));
      return mockProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw new Error("Failed to fetch products by category");
    }
  }

  // Get product categories
  static async getCategories() {
    try {
      await new Promise(resolve => setTimeout(resolve, 25));
      const categories = [...new Set(mockProducts.map(p => p.category))];
      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  // Check stock
  static async checkStock(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 25));
      const product = mockProducts.find(p => p.id === parseInt(id));
      return product ? { available: product.stock_quantity > 0, quantity: product.stock_quantity } : null;
    } catch (error) {
      console.error("Error checking stock:", error);
      throw new Error("Failed to check stock");
    }
  }
}

export default MockProductService;