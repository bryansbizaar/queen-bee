import { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import "../styles/AdminLogin.css";

function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Try to verify the password by making a test API call
      const response = await fetch("/api/admin/products", {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });

      if (response.ok) {
        login(password);
        navigate("/admin/dashboard");
      } else {
        setError("Invalid admin password");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>🐝 Admin Login</h1>
        <p className="admin-login-subtitle">Queen Bee Candles Dashboard</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="password">Admin Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !password}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/">← Back to Store</a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
