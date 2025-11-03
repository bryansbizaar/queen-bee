import { ShoppingCart } from "lucide-react";
import useCart from "../context/useCart";

const CartIcon = ({ onClick }) => {
  // Use the existing useCart hook to access cart data
  const { getCartCount } = useCart();

  // Get the total count of items in cart
  const itemCount = getCartCount();

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="cart-icon-wrapper"
      aria-label={`Shopping cart with ${itemCount} item${itemCount === 1 ? '' : 's'}`}
    >
      <div className="cart-icon">
        <ShoppingCart size={24} aria-hidden="true" />
        {itemCount > 0 && <span className="cart-badge" aria-hidden="true">{itemCount}</span>}
      </div>
    </button>
  );
};

export default CartIcon;
