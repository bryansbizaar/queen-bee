import { query } from "../config/database.js";

// ===== PRODUCT MANAGEMENT =====

export const getAllProducts = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, description, price, image, category, 
              stock_quantity, is_active, is_featured, display_order,
              weight_kg, length_mm, width_mm, height_mm,
              created_at, updated_at 
       FROM products 
       ORDER BY display_order ASC, id ASC`
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT * FROM products WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      image,
      category = "candles",
      stock_quantity = 0,
      is_active = true,
      is_featured = false,
      display_order = 0,
      weight_kg,
      length_mm,
      width_mm,
      height_mm,
    } = req.body;

    // Validation
    if (!title || !price) {
      return res.status(400).json({
        success: false,
        message: "Title and price are required",
      });
    }

    const result = await query(
      `INSERT INTO products 
       (title, description, price, image, category, stock_quantity, 
        is_active, is_featured, display_order, weight_kg, length_mm, width_mm, height_mm)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        title,
        description,
        price,
        image,
        category,
        stock_quantity,
        is_active,
        is_featured,
        display_order,
        weight_kg,
        length_mm,
        width_mm,
        height_mm,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      image,
      category,
      stock_quantity,
      is_active,
      is_featured,
      display_order,
      weight_kg,
      length_mm,
      width_mm,
      height_mm,
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(price);
    }
    if (image !== undefined) {
      updates.push(`image = $${paramCount++}`);
      values.push(image);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (stock_quantity !== undefined) {
      updates.push(`stock_quantity = $${paramCount++}`);
      values.push(stock_quantity);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (is_featured !== undefined) {
      updates.push(`is_featured = $${paramCount++}`);
      values.push(is_featured);
    }
    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(display_order);
    }
    if (weight_kg !== undefined) {
      updates.push(`weight_kg = $${paramCount++}`);
      values.push(weight_kg);
    }
    if (length_mm !== undefined) {
      updates.push(`length_mm = $${paramCount++}`);
      values.push(length_mm);
    }
    if (width_mm !== undefined) {
      updates.push(`width_mm = $${paramCount++}`);
      values.push(width_mm);
    }
    if (height_mm !== undefined) {
      updates.push(`height_mm = $${paramCount++}`);
      values.push(height_mm);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE products 
       SET ${updates.join(", ")}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;

    if (stock_quantity === undefined || stock_quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid stock_quantity is required",
      });
    }

    const result = await query(
      `UPDATE products 
       SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, title, stock_quantity`,
      [stock_quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Stock updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update stock",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting is_active to false
    const result = await query(
      `UPDATE products 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, title`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deactivated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// ===== ORDER MANAGEMENT =====

export const getAllOrders = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let queryStr = `
      SELECT o.*, c.first_name, c.last_name, c.phone,
             json_agg(
               json_build_object(
                 'product_title', oi.product_title,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'total_price', oi.total_price
               )
             ) as items
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;

    const params = [];
    if (status) {
      queryStr += ` WHERE o.status = $1`;
      params.push(status);
    }

    queryStr += `
      GROUP BY o.id, c.first_name, c.last_name, c.phone
      ORDER BY o.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const result = await query(queryStr, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await query(
      `SELECT o.*, c.first_name, c.last_name, c.email, c.phone
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const itemsResult = await query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...orderResult.rows[0],
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const result = await query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
