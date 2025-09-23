import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import useCart from "../context/useCart";

const CartIcon = () => {
  // Use the existing useCart hook to access cart data
  const { getCartCount } = useCart();

  // Get the total count of items in cart
  const itemCount = getCartCount();

  return (
    <Link to="/cart" className="cart-icon-wrapper" aria-label={`Shopping cart with ${itemCount} item${itemCount === 1 ? '' : 's'}`}>
      <div className="cart-icon">
        <ShoppingCart size={24} aria-hidden="true" />
        {itemCount > 0 && <span className="cart-badge" aria-hidden="true">{itemCount}</span>}
      </div>
    </Link>
  );
};

export default CartIcon;
