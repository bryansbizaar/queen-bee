import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import useCart from "../context/useCart";
import formatAmount from "../utils/formatAmount";
import LoadingSpinner from "./LoadingSpinner";
import { productAPI, API_BASE_URL } from "../services/api";

const ProductDetail = ({ productId }) => {
  const { id: paramId } = useParams();
  const id = productId || paramId;
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productAPI.getById(id);
        console.log('ProductDetail - Received data:', data);
        
        // Handle different response structures
        if (data?.product) {
          console.log('ProductDetail - Using data.product');
          setProduct(data.product);
        } else if (data) {
          console.log('ProductDetail - Using data directly');
          setProduct(data);
        } else {
          throw new Error('No product data received');
        }
      } catch (err) {
        console.error('ProductDetail - Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError('No product ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(value > 0 ? value : 1);
  };

  // Add to cart functionality
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      <div className="product-image">
        <img
          src={`${API_BASE_URL}/images/${product.image}`}
          alt={product.title}
          className="card-img"
        />
      </div>

      <div className="product-info">
        <h1 className="product-title">{product.title}</h1>
        <p className="product-price">{formatAmount(product.price)}</p>
        <p className="product-description">{product.description}</p>

        <div className="product-actions">
          <div className="quantity-selector">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="quantity-input"
            />
          </div>

          <button onClick={handleAddToCart} className="add-to-cart-btn">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

ProductDetail.propTypes = {
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ProductDetail;
