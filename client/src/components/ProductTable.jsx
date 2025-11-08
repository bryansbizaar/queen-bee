import { useState } from "react";
import PropTypes from "prop-types";
import { updateStock, deleteProduct } from "../services/adminApi";
import { SERVER_BASE_URL } from "../services/api";
import { Link } from "react-router-dom";
import "../styles/ProductTable.css";

function ProductTable({ products, onRefresh, authToken }) {
  const [editingStock, setEditingStock] = useState({});
  const [updating, setUpdating] = useState({});

  const handleStockChange = (productId, value) => {
    setEditingStock({
      ...editingStock,
      [productId]: value,
    });
  };

  const handleStockUpdate = async (productId) => {
    const newStock = parseInt(editingStock[productId]);
    if (isNaN(newStock) || newStock < 0) {
      alert("Please enter a valid stock quantity");
      return;
    }

    setUpdating({ ...updating, [productId]: true });
    try {
      await updateStock(productId, newStock, authToken);
      setEditingStock({ ...editingStock, [productId]: undefined });
      onRefresh();
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock");
    } finally {
      setUpdating({ ...updating, [productId]: false });
    }
  };

  const handleDelete = async (productId, productTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to deactivate "${productTitle}"? This will hide it from the store.`
      )
    ) {
      return;
    }

    try {
      await deleteProduct(productId, authToken);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to deactivate product");
    }
  };

  const getStockClass = (quantity) => {
    if (quantity === 0) return "stock-out";
    if (quantity < 5) return "stock-low";
    return "stock-ok";
  };

  return (
    <div className="product-table-container">
      <table className="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Title</th>
            <th>Price</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className={!product.is_active ? "inactive" : ""}>
              <td>{product.id}</td>
              <td>
                <img
                  src={`${SERVER_BASE_URL}/images/${product.image}`}
                  alt={product.title}
                  className="product-thumbnail"
                />
              </td>
              <td>
                <strong>{product.title}</strong>
                <br />
                <small className="text-muted">{product.description}</small>
              </td>
              <td>${(product.price / 100).toFixed(2)}</td>
              <td>
                <span className="badge">{product.category}</span>
              </td>
              <td>
                <div className="stock-editor">
                  <input
                    type="number"
                    min="0"
                    value={
                      editingStock[product.id] !== undefined
                        ? editingStock[product.id]
                        : product.stock_quantity
                    }
                    onChange={(e) =>
                      handleStockChange(product.id, e.target.value)
                    }
                    className={`stock-input ${getStockClass(
                      product.stock_quantity
                    )}`}
                    disabled={updating[product.id]}
                  />
                  {editingStock[product.id] !== undefined && (
                    <button
                      onClick={() => handleStockUpdate(product.id)}
                      className="btn-save-stock"
                      disabled={updating[product.id]}
                    >
                      {updating[product.id] ? "..." : "✓"}
                    </button>
                  )}
                </div>
              </td>
              <td>
                <span
                  className={`status-badge ${
                    product.is_active ? "active" : "inactive"
                  }`}
                >
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <Link
                    to={`/admin/products/${product.id}`}
                    className="btn-icon"
                    title="Edit"
                  >
                    ✏️
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.title)}
                    className="btn-icon danger"
                    title="Deactivate"
                    disabled={!product.is_active}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {products.length === 0 && (
        <div className="empty-state">
          <p>No products found</p>
        </div>
      )}
    </div>
  );
}

ProductTable.propTypes = {
  products: PropTypes.array.isRequired,
  onRefresh: PropTypes.func.isRequired,
  authToken: PropTypes.string.isRequired,
};

export default ProductTable;
