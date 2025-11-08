import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("adminToken");
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (password) => {
    // Store token in localStorage
    localStorage.setItem("adminToken", password);
    setAuthToken(password);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    authToken,
    login,
    logout,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

AdminProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
