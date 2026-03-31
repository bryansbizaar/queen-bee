import apiService from "./api";

// Create auth options for requests
const authOptions = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// ===== PRODUCT OPERATIONS =====

export const getAllProductsAdmin = async (token) => {
  const response = await apiService.get("/admin/products", {}, authOptions(token));
  return response;
};

export const getProductByIdAdmin = async (id, token) => {
  const response = await apiService.get(`/admin/products/${id}`, {}, authOptions(token));
  return response;
};

export const createProduct = async (productData, token) => {
  const response = await apiService.post("/admin/products", productData, authOptions(token));
  return response;
};

export const updateProduct = async (id, productData, token) => {
  const response = await apiService.put(`/admin/products/${id}`, productData, authOptions(token));
  return response;
};

export const updateStock = async (id, stock_quantity, token) => {
  const response = await apiService.patch(`/admin/products/${id}/stock`, {
    stock_quantity,
  }, authOptions(token));
  return response;
};

export const deleteProduct = async (id, token) => {
  const response = await apiService.delete(`/admin/products/${id}`, authOptions(token));
  return response;
};

// ===== ORDER OPERATIONS =====

export const getAllOrders = async (token, filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await apiService.get(`/admin/orders?${params}`, {}, authOptions(token));
  return response;
};

export const getOrderById = async (id, token) => {
  const response = await apiService.get(`/admin/orders/${id}`, {}, authOptions(token));
  return response;
};

export const updateOrderStatus = async (id, status, token) => {
  const response = await apiService.patch(`/admin/orders/${id}/status`, { status }, authOptions(token));
  return response;
};
