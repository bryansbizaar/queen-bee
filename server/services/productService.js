import { query } from "../config/database.js";
import MockProductService from "./mockProductService.js";

export class ProductService {
  // Get all active products
  static async getAllProducts() {
    try {
      const result = await query(
        "SELECT id, title, description, price, image, category, stock_quantity FROM products WHERE is_active = true ORDER BY display_order ASC, id ASC"
      );
      return result.rows;
    } catch (error) {
      console.error(
        "Error fetching products from database, falling back to mock data:",
        error
      );
      // Fallback to mock data if database fails
      return MockProductService.getAllProducts();
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const result = await query(
        "SELECT id, title, description, price, image, category, stock_quantity, weight_kg, length_mm, width_mm, height_mm FROM products WHERE id = $1 AND is_active = true",
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error(
        "Error fetching product from database, falling back to mock data:",
        error
      );
      return MockProductService.getProductById(id);
    }
  }

  // Get multiple products by IDs (for shipping calculation)
  static async getByIds(ids) {
    try {
      const result = await query(
        "SELECT id, title, description, price, image, category, stock_quantity, weight_kg, length_mm, width_mm, height_mm FROM products WHERE id = ANY($1) AND is_active = true",
        [ids]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
      throw new Error("Failed to fetch products");
    }
  }

  // Get products by category

  // Get products by category
  static async getProductsByCategory(category) {
    try {
      const result = await query(
        "SELECT id, title, description, price, image, category, stock_quantity FROM products WHERE category = $1 AND is_active = true ORDER BY display_order ASC, id ASC",
        [category]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw new Error("Failed to fetch products by category");
    }
  }

  // Create new product (for future admin functionality)
  static async createProduct(productData) {
    try {
      const {
        title,
        description,
        price,
        image,
        category = "candles",
        stock_quantity = 0,
      } = productData;

      const result = await query(
        "INSERT INTO products (title, description, price, image, category, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [title, description, price, image, category, stock_quantity]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }
  }

  // Update product stock (for future inventory management)
  static async updateStock(id, newStock) {
    try {
      const result = await query(
        "UPDATE products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [newStock, id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error("Error updating stock:", error);
      throw new Error("Failed to update stock");
    }
  }

  // Check if product has sufficient stock
  static async hasStock(id, quantity) {
    try {
      const result = await query(
        "SELECT stock_quantity FROM products WHERE id = $1 AND is_active = true",
        [id]
      );

      if (result.rows.length === 0) {
        return false;
      }

      return result.rows[0].stock_quantity >= quantity;
    } catch (error) {
      console.error("Error checking stock:", error);
      throw new Error("Failed to check stock");
    }
  }

  // Reduce stock after purchase
  static async reduceStock(id, quantity) {
    try {
      const result = await query(
        "UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND stock_quantity >= $1 RETURNING *",
        [quantity, id]
      );

      if (result.rows.length === 0) {
        throw new Error("Insufficient stock or product not found");
      }

      return result.rows[0];
    } catch (error) {
      console.error("Error reducing stock:", error);
      throw error;
    }
  }
}
