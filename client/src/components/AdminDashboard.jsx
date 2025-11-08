import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { getAllProductsAdmin } from "../services/adminApi";
import ProductTable from "./ProductTable";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken, logout } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [authToken]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await getAllProductsAdmin(authToken);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      if (err.response?.status === 401) {
        logout();
        navigate("/admin/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>🐝 Queen Bee Admin Dashboard</h1>
          <div className="admin-header-actions">
            <Link to="/" className="btn-secondary">
              View Store
            </Link>
            <button onClick={handleLogout} className="btn-danger">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="admin-nav">
        <Link to="/admin/dashboard" className="active">
          Products
        </Link>
        <Link to="/admin/orders">Orders</Link>
      </nav>

      <main className="admin-content">
        <div className="admin-section">
          <div className="section-header">
            <h2>Product Inventory</h2>
            <Link to="/admin/products/new" className="btn-primary">
              + Add Product
            </Link>
          </div>

          {isLoading && (
            <div className="loading-spinner">Loading products...</div>
          )}

          {error && <div className="error-message">{error}</div>}

          {!isLoading && !error && (
            <ProductTable
              products={products}
              onRefresh={fetchProducts}
              authToken={authToken}
            />
          )}
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Products</h3>
            <p className="stat-number">{products.length}</p>
          </div>
          <div className="stat-card">
            <h3>Active Products</h3>
            <p className="stat-number">
              {products.filter((p) => p.is_active).length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Low Stock</h3>
            <p className="stat-number warn">
              {products.filter((p) => p.stock_quantity < 5).length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Total Stock Value</h3>
            <p className="stat-number">
              $
              {(
                products.reduce(
                  (sum, p) => sum + p.price * p.stock_quantity,
                  0
                ) / 100
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
