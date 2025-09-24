import { useState } from "react";
import { Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import useCart from "../context/useCart";
import formatAmount from "../utils/formatAmount";
import StripeCheckout from "./StripeCheckout";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [step, setStep] = useState("review"); // "review", "address", or "payment"
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [emailError, setEmailError] = useState("");
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Address state
  const [addressData, setAddressData] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    shippingOption: "ship", // "ship" or "pickup"
  });
  const [addressErrors, setAddressErrors] = useState({});

  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `QBC-${timestamp}-${random}`;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAddress = () => {
    const errors = {};

    // Full Name validation
    if (!addressData.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (addressData.fullName.trim().length < 2) {
      errors.fullName = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(addressData.fullName.trim())) {
      errors.fullName =
        "Name can only contain letters, spaces, hyphens and apostrophes";
    }

    if (addressData.shippingOption === "ship") {
      // Address Line 1 validation
      if (!addressData.addressLine1.trim()) {
        errors.addressLine1 = "Address is required for shipping";
      } else if (addressData.addressLine1.trim().length < 5) {
        errors.addressLine1 = "Please enter a complete address";
      }

      // City validation
      if (!addressData.city.trim()) {
        errors.city = "City is required for shipping";
      } else if (!/^[a-zA-Z\s'-]+$/.test(addressData.city.trim())) {
        errors.city =
          "City name can only contain letters, spaces, hyphens and apostrophes";
      }

      // NZ Postal Code validation (4 digits)
      if (!addressData.postalCode.trim()) {
        errors.postalCode = "Postal code is required for shipping calculation";
      } else if (!/^\d{4}$/.test(addressData.postalCode.trim())) {
        errors.postalCode = "NZ postal codes must be 4 digits (e.g. 0110)";
      }
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailChange = (e) => {
    // Trim whitespace and convert to lowercase for consistency
    const email = e.target.value.trim().toLowerCase();
    setCustomerEmail(email);
    if (emailError && validateEmail(email)) {
      setEmailError("");
    }
  };

  const handleAddressChange = (field, value) => {
    let processedValue = value;

    // Apply input restrictions based on field type
    if (field === "fullName" || field === "city") {
      // Only allow letters, spaces, hyphens, and apostrophes
      processedValue = value.replace(/[^a-zA-Z\s'-]/g, "");
    } else if (field === "postalCode") {
      // Only allow digits, max 4 characters for NZ postal codes
      processedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setAddressData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));

    // Clear error for this field when user starts typing
    if (addressErrors[field]) {
      setAddressErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleProceedToAddress = () => {
    if (!customerEmail) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(customerEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setStep("address");
  };

  const handleProceedToPayment = async () => {
    if (!validateAddress()) {
      return;
    }

    if (paymentMethod === "stripe") {
      setLoading(true);
      setError(null);

      try {
        const newOrderId = generateOrderId();
        const total = getCartTotal();

        const response = await fetch(
          "http://localhost:8080/api/stripe/create-payment-intent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: total,
              orderId: newOrderId,
              customerEmail: customerEmail,
              cartItems: cartItems.map((item) => ({
                id: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
              })),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create payment intent");
        }

        // Handle the wrapped response format from your current server
        if (data.success && data.data && data.data.clientSecret) {
          setClientSecret(data.data.clientSecret); // ✅ Correct path
          setOrderId(newOrderId);
          setStep("payment");
        } else {
          throw new Error("Invalid response: missing client secret");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackToReview = () => {
    setStep("review");
    setClientSecret(null);
    setOrderId(null);
    setError(null);
  };

  const handleBackToAddress = () => {
    setStep("address");
    setClientSecret(null);
    setOrderId(null);
    setError(null);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link to="/" className="cart-empty-link">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Show payment step
  if (step === "payment" && clientSecret) {
    return (
      <div className="cart-container">
        <button onClick={handleBackToAddress} className="cart-back-btn">
          ← Back to Address
        </button>
        <Elements stripe={stripePromise} options={{ locale: "en" }}>
          <StripeCheckout
            clientSecret={clientSecret}
            orderId={orderId}
            customerEmail={customerEmail}
            amount={getCartTotal()}
            addressData={addressData}
          />
        </Elements>
      </div>
    );
  }

  // Show address collection step
  if (step === "address") {
    return (
      <div className="cart-address-container">
        <button onClick={handleBackToReview} className="cart-back-btn">
          ← Back to Cart Review
        </button>

        <h2 className="cart-title">Shipping & Billing Details</h2>

        <div className="cart-address-content">
          <p className="cart-customer-email">
            Email: <strong>{customerEmail}</strong>
          </p>

          <form className="cart-address-form">
            {/* Full Name */}
            <div className="cart-form-group">
              <label className="cart-form-label">Full Name *</label>
              <input
                type="text"
                value={addressData.fullName}
                onChange={(e) =>
                  handleAddressChange("fullName", e.target.value)
                }
                className={`cart-form-input ${
                  addressErrors.fullName ? "error" : ""
                }`}
                placeholder="Your full name"
              />
              {addressErrors.fullName && (
                <span className="cart-error-text">
                  {addressErrors.fullName}
                </span>
              )}
            </div>

            {/* Shipping Options */}
            <div className="cart-form-group">
              <label className="cart-form-label">Delivery Option *</label>
              <div className="cart-shipping-options">
                <label
                  className={`cart-shipping-option ${
                    addressData.shippingOption === "ship" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingOption"
                    value="ship"
                    checked={addressData.shippingOption === "ship"}
                    onChange={(e) =>
                      handleAddressChange("shippingOption", e.target.value)
                    }
                  />
                  <span>📦 Ship to my address (shipping costs apply)</span>
                </label>

                <label
                  className={`cart-shipping-option ${
                    addressData.shippingOption === "pickup" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingOption"
                    value="pickup"
                    checked={addressData.shippingOption === "pickup"}
                    onChange={(e) =>
                      handleAddressChange("shippingOption", e.target.value)
                    }
                  />
                  <span>🏪 Local pickup in Whangarei (no shipping charge)</span>
                </label>
              </div>
            </div>

            {/* Address fields - only show if shipping */}
            {addressData.shippingOption === "ship" && (
              <>
                <div className="cart-form-group">
                  <label className="cart-form-label">Address *</label>
                  <input
                    type="text"
                    value={addressData.addressLine1}
                    onChange={(e) =>
                      handleAddressChange("addressLine1", e.target.value)
                    }
                    className={`cart-form-input ${
                      addressErrors.addressLine1 ? "error" : ""
                    }`}
                    placeholder="Street address"
                  />
                  {addressErrors.addressLine1 && (
                    <span className="cart-error-text">
                      {addressErrors.addressLine1}
                    </span>
                  )}
                </div>

                <div className="cart-form-group">
                  <label className="cart-form-label">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressData.addressLine2}
                    onChange={(e) =>
                      handleAddressChange("addressLine2", e.target.value)
                    }
                    className="cart-form-input"
                    placeholder="Apartment, suite, unit, etc."
                  />
                </div>

                <div className="cart-form-row">
                  <div className="cart-form-group">
                    <label className="cart-form-label">City/Suburb *</label>
                    <input
                      type="text"
                      value={addressData.city}
                      onChange={(e) =>
                        handleAddressChange("city", e.target.value)
                      }
                      className={`cart-form-input ${
                        addressErrors.city ? "error" : ""
                      }`}
                      placeholder="City or suburb"
                    />
                    {addressErrors.city && (
                      <span className="cart-error-text">
                        {addressErrors.city}
                      </span>
                    )}
                  </div>

                  <div className="cart-form-group">
                    <label className="cart-form-label">Postal Code *</label>
                    <input
                      type="text"
                      value={addressData.postalCode}
                      onChange={(e) =>
                        handleAddressChange("postalCode", e.target.value)
                      }
                      className={`cart-form-input ${
                        addressErrors.postalCode ? "error" : ""
                      }`}
                      placeholder="e.g. 0110"
                      maxLength="4"
                      inputMode="numeric"
                    />
                    {addressErrors.postalCode && (
                      <span className="cart-error-text">
                        {addressErrors.postalCode}
                      </span>
                    )}
                  </div>
                </div>

                <div className="cart-shipping-note">
                  <p>
                    💡 <strong>Note:</strong> Shipping costs will be calculated
                    based on your postal code. Final shipping charges will be
                    displayed before payment.
                  </p>
                </div>
              </>
            )}

            {error && (
          <div className="cart-error-message" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

            <div className="cart-actions">
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={loading}
                className={`cart-proceed-btn ${
                  loading ? "disabled" : "active"
                }`}
              >
                {loading ? "Processing..." : "Continue to Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Show cart review step (default) - KEEPING YOUR EXISTING STRUCTURE
  return (
    <div className="cart-container">
      {/* Live region for cart updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="cart-status">
        {/* Screen readers will announce cart changes */}
      </div>
      <h2 className="cart-title">Your Cart</h2>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-image">
              <img
                src={`http://localhost:8080/images/${item.image}`}
                alt={item.title}
                className="cart-item-img"
              />
            </div>

            <div className="cart-item-info">
              <h3 className="cart-item-title">{item.title}</h3>
              <p className="cart-item-price">{formatAmount(item.price)}</p>
            </div>

            <div className="cart-item-controls">
              <div className="cart-item-quantity" role="group" aria-label={`Quantity for ${item.title}`}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="cart-quantity-btn"
                  aria-label={`Decrease quantity of ${item.title}`}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span aria-label={`Current quantity: ${item.quantity}`}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="cart-quantity-btn"
                  aria-label={`Increase quantity of ${item.title}`}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="cart-remove-btn"
                aria-label={`Remove ${item.title} from cart`}
              >
                Remove
              </button>
            </div>

            <div className="cart-item-total">
              {formatAmount(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="cart-checkout-section">
        <div className="cart-total">
          <span>Total:</span>
          <span>{formatAmount(getCartTotal())}</span>
        </div>

        {/* Customer Email Input */}
        <div className="cart-form-group">
          <label htmlFor="customerEmail" className="cart-form-label">
            Email Address *
          </label>
          <input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={handleEmailChange}
            placeholder="Enter your email address"
            className={`cart-email-input ${emailError ? "error" : ""}`}
            onFocus={() => setEmailError("")}
            aria-required="true"
            aria-invalid={emailError ? "true" : "false"}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && (
            <span id="email-error" className="cart-error-text" role="alert">
              {emailError}
            </span>
          )}
        </div>

        {/* Payment Method Selection */}
        <div className="cart-form-group">
          <label className="cart-form-label">Payment Method *</label>
          <div className="cart-payment-methods">
            <label
              className={`cart-payment-option ${
                paymentMethod === "stripe" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === "stripe"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>💳 Card Payment (Stripe)</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="cart-error-message" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div className="cart-actions">
          <Link to="/" className="cart-continue-shopping">
            Continue Shopping
          </Link>
          <button
            onClick={handleProceedToAddress}
            className="cart-proceed-btn active"
          >
            Continue to Shipping Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
