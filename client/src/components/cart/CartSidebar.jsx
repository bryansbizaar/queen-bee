import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import useCart from "../../context/useCart";
import formatAmount from "../../utils/formatAmount";
import { SERVER_BASE_URL } from "../../services/api";
import "./CartSidebar.css";

const CartSidebar = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="cart-sidebar-overlay" onClick={onClose} />

      {/* Sidebar */}
      <div ref={sidebarRef} className="cart-sidebar" role="dialog" aria-modal="true" aria-label="Shopping cart">
        {/* Header */}
        <div className="cart-sidebar-header">
          <h2>Your Cart ({cartItems.length})</h2>
          <button
            onClick={onClose}
            className="cart-sidebar-close"
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="cart-sidebar-content">
          {cartItems.length === 0 ? (
            <div className="cart-sidebar-empty">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="cart-sidebar-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-sidebar-item">
                    <div className="cart-sidebar-item-image">
                      <img
                        src={`${SERVER_BASE_URL}/images/${item.image}`}
                        alt={item.title}
                      />
                    </div>

                    <div className="cart-sidebar-item-details">
                      <h3>{item.title}</h3>
                      <p className="cart-sidebar-item-price">
                        {formatAmount(item.price)}
                      </p>

                      <div className="cart-sidebar-item-controls">
                        <div className="cart-sidebar-quantity">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.title}`}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            aria-label={`Increase quantity of ${item.title}`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="cart-sidebar-remove"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-sidebar-item-total">
                      {formatAmount(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer with total */}
              <div className="cart-sidebar-footer">
                <div className="cart-sidebar-total">
                  <span>Subtotal:</span>
                  <span className="cart-sidebar-total-amount">
                    {formatAmount(getCartTotal())}
                  </span>
                </div>
                <p className="cart-sidebar-note">
                  Shipping and taxes calculated at checkout
                </p>
                <Link 
                  to="/cart" 
                  className="cart-sidebar-checkout-btn"
                  onClick={onClose}
                >
                  View Cart & Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
