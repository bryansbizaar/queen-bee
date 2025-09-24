import { useContext } from "react";
import CartContext from "./CartContext";

// Custom hook to use the cart context
const useCart = () => {
  return useContext(CartContext);
};

export default useCart;
