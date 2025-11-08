import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { getAllOrders, updateOrderStatus } from "../services/adminApi";
import "../styles/AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const { authToken, logout } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [filter, authToken]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const filters = filter ? { status: filter } : {};
      const response = await getAllOrders(authToken, filters);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
      if (err.response?.status === 401) {
        logout();
        navigate("/admin/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, authToken);
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusClass = (status) => {
    const statusMap = {
      pending: "status-pending",
      processing: "status-processing",
      shipped: "status-shipped",
      delivered: "status-delivered",
      cancelled: "status-cancelled",
    };
    return statusMap[status] || "";
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
            <button onClick={() => { logout(); navigate("/admin/login"); }} className="btn-danger">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="admin-nav">
        <Link to="/admin/dashboard">Products</Link>
        <Link to="/admin/orders" className="active">
          Orders
        </Link>
      </nav>

      <main className="admin-content">
        <div className="admin-section">
          <div className="section-header">
            <h2>Order Management</h2>
            <div className="filter-controls">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="loading-spinner">Loading orders...</div>
          )}

          {error && <div className="error-message">{error}</div>}

          {!isLoading && !error && (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.order_id}</strong>
                      </td>
                      <td>
                        {order.first_name && order.last_name
                          ? `${order.first_name} ${order.last_name}`
                          : "Guest"}
                      </td>
                      <td>{order.customer_email}</td>
                      <td>
                        <details className="order-items-details">
                          <summary>
                            {order.items?.length || 0} item(s)
                          </summary>
                          <ul className="order-items-list">
                            {order.items?.map((item, idx) => (
                              <li key={idx}>
                                {item.quantity}x {item.product_title} - {formatAmount(item.total_price)}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </td>
                      <td>
                        <strong>{formatAmount(order.total_amount)}</strong>
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className={`status-select ${getStatusClass(
                            order.status
                          )}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <small>{formatDate(order.created_at)}</small>
                      </td>
                      <td>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="btn-icon"
                          title="View Details"
                        >
                          👁️
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <div className="empty-state">
                  <p>No orders found</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-number">{orders.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number warn">
              {orders.filter((o) => o.status === "pending").length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Processing</h3>
            <p className="stat-number">
              {orders.filter((o) => o.status === "processing").length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-number">
              {formatAmount(
                orders.reduce((sum, o) => sum + o.total_amount, 0)
              )}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminOrders;
