import axios from "axios";
import { API_BASE_URL } from "./api";

// Create axios instance with auth header
const createAuthAxios = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ===== PRODUCT OPERATIONS =====

export const getAllProductsAdmin = async (token) => {
  const api = createAuthAxios(token);
  const response = await api.get("/admin/products");
  return response.data;
};

export const getProductByIdAdmin = async (id, token) => {
  const api = createAuthAxios(token);
  const response = await api.get(`/admin/products/${id}`);
  return response.data;
};

export const createProduct = async (productData, token) => {
  const api = createAuthAxios(token);
  const response = await api.post("/admin/products", productData);
  return response.data;
};

export const updateProduct = async (id, productData, token) => {
  const api = createAuthAxios(token);
  const response = await api.put(`/admin/products/${id}`, productData);
  return response.data;
};

export const updateStock = async (id, stock_quantity, token) => {
  const api = createAuthAxios(token);
  const response = await api.patch(`/admin/products/${id}/stock`, {
    stock_quantity,
  });
  return response.data;
};

export const deleteProduct = async (id, token) => {
  const api = createAuthAxios(token);
  const response = await api.delete(`/admin/products/${id}`);
  return response.data;
};

// ===== ORDER OPERATIONS =====

export const getAllOrders = async (token, filters = {}) => {
  const api = createAuthAxios(token);
  const params = new URLSearchParams(filters);
  const response = await api.get(`/admin/orders?${params}`);
  return response.data;
};

export const getOrderById = async (id, token) => {
  const api = createAuthAxios(token);
  const response = await api.get(`/admin/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status, token) => {
  const api = createAuthAxios(token);
  const response = await api.patch(`/admin/orders/${id}/status`, { status });
  return response.data;
};
