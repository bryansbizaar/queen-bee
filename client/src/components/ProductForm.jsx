import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import {
  getProductByIdAdmin,
  updateProduct,
  createProduct,
} from "../services/adminApi";
import "../styles/ProductForm.css";

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAdmin();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    category: "candles",
    stock_quantity: 0,
    is_active: true,
    is_featured: false,
    display_order: 0,
    weight_kg: "",
    length_mm: "",
    width_mm: "",
    height_mm: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await getProductByIdAdmin(id, authToken);
      const product = response.data;
      
      // Convert price from cents to dollars for the form
      setFormData({
        ...product,
        price: (product.price / 100).toFixed(2),
        weight_kg: product.weight_kg || "",
        length_mm: product.length_mm || "",
        width_mm: product.width_mm || "",
        height_mm: product.height_mm || "",
      });
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Convert price from dollars to cents
      const productData = {
        ...formData,
        price: Math.round(parseFloat(formData.price) * 100),
        stock_quantity: parseInt(formData.stock_quantity),
        display_order: parseInt(formData.display_order),
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        length_mm: formData.length_mm ? parseInt(formData.length_mm) : null,
        width_mm: formData.width_mm ? parseInt(formData.width_mm) : null,
        height_mm: formData.height_mm ? parseInt(formData.height_mm) : null,
      };

      if (isEditMode) {
        await updateProduct(id, productData, authToken);
      } else {
        await createProduct(productData, authToken);
      }

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading product...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>{isEditMode ? "Edit Product" : "Add New Product"}</h1>
          <Link to="/admin/dashboard" className="btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="admin-content">
        <div className="product-form-container">
          <form onSubmit={handleSubmit} className="product-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-section">
              <h2>Basic Information</h2>
              
              <div className="form-group">
                <label htmlFor="title">Product Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (NZD) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock_quantity">Stock Quantity *</label>
                  <input
                    type="number"
                    id="stock_quantity"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="candles">Candles</option>
                    <option value="votives">Votives</option>
                    <option value="pillars">Pillars</option>
                    <option value="novelty">Novelty</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="image">Image Filename</label>
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="e.g., dragon.jpg"
                  />
                  <small className="form-hint">
                    Upload image to /server/public/images/ first
                  </small>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Dimensions (for shipping)</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="weight_kg">Weight (kg)</label>
                  <input
                    type="number"
                    id="weight_kg"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleChange}
                    step="0.001"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="length_mm">Length (mm)</label>
                  <input
                    type="number"
                    id="length_mm"
                    name="length_mm"
                    value={formData.length_mm}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="width_mm">Width (mm)</label>
                  <input
                    type="number"
                    id="width_mm"
                    name="width_mm"
                    value={formData.width_mm}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="height_mm">Height (mm)</label>
                  <input
                    type="number"
                    id="height_mm"
                    name="height_mm"
                    value={formData.height_mm}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Display Settings</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="display_order">Display Order</label>
                  <input
                    type="number"
                    id="display_order"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleChange}
                    min="0"
                  />
                  <small className="form-hint">Lower numbers appear first</small>
                </div>
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <span>Active (visible in store)</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                  />
                  <span>Featured Product</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
              </button>
              <Link to="/admin/dashboard" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProductForm;
