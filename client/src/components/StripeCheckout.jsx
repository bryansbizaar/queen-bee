import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import useCart from "../context/useCart";
import formatAmount from "../utils/formatAmount";
import PropTypes from "prop-types";

const StripeCheckout = ({
  clientSecret,
  orderId,
  customerEmail,
  amount,
  addressData,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart, cartItems } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async (paymentIntentId) => {
    try {
      console.log("Creating order for payment intent:", paymentIntentId);

      // Prepare shipping address from collected address data
      const shippingAddress =
        addressData.shippingOption === "pickup"
          ? {
              line1: "Local Pickup",
              city: "Whangarei",
              state: "Northland",
              postal_code: "0110",
              country: "NZ",
            }
          : {
              line1: addressData.addressLine1,
              line2: addressData.addressLine2 || null,
              city: addressData.city,
              state: "Northland", // Default for NZ
              postal_code: addressData.postalCode,
              country: "NZ",
            };

      const response = await fetch(
        "http://localhost:8080/api/stripe/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntentId,
            customerEmail,
            cartItems: cartItems.map((item) => ({
              id: item.id,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
            })),
            customerName: addressData.fullName,
            shippingAddress: shippingAddress,
            shippingOption: addressData.shippingOption,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to create order");
      }

      console.log("Order created successfully:", data);
      return data.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Step 1: Confirm the payment with Stripe
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: customerEmail,
              name: addressData.fullName,
              address: {
                country: "NZ",
                // Use shipping address as billing address if shipping, otherwise minimal info for pickup
                ...(addressData.shippingOption === "ship" && {
                  line1: addressData.addressLine1,
                  line2: addressData.addressLine2 || null,
                  city: addressData.city,
                  postal_code: addressData.postalCode,
                }),
              },
            },
          },
        });

      if (confirmError) {
        console.error("Stripe confirmation error:", confirmError);
        setError(confirmError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        console.log("Payment succeeded, creating order...");

        try {
          // Step 2: Create order in our database
          const orderData = await createOrder(paymentIntent.id);

          // Step 3: Store success data for the success page
          sessionStorage.setItem(
            "paymentSuccess",
            JSON.stringify({
              orderId: orderData.orderId,
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount / 100, // Convert back from cents
              currency: paymentIntent.currency,
              customerEmail,
              customerName: addressData.fullName,
              shippingOption: addressData.shippingOption,
              timestamp: new Date().toISOString(),
              orderStatus: orderData.status,
              itemCount: orderData.itemCount,
            })
          );

          // Step 4: Clear cart and navigate to success page
          clearCart();
          navigate("/payment/success");
        } catch (orderError) {
          console.error("Order creation failed:", orderError);

          // Payment succeeded but order creation failed
          // Store partial success data and show a different message
          sessionStorage.setItem(
            "paymentSuccess",
            JSON.stringify({
              orderId: orderId, // Use the original order ID
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              customerEmail,
              customerName: addressData.fullName,
              timestamp: new Date().toISOString(),
              orderStatus: "payment_succeeded_order_pending",
              error:
                "Order creation pending - please contact support with your payment ID",
            })
          );

          clearCart();
          navigate("/payment/success");
        }
      } else {
        setError("Payment was not successful. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
    hidePostalCode: true, // Hide postal code field since NZ validation is problematic
  };

  return (
    <div className="checkout-container">
      <h3 className="checkout-title">Complete Your Payment</h3>

      <div className="order-summary">
        <h4 className="order-summary-title">Order Summary</h4>
        <div className="order-summary-row">
          <span>Order ID:</span>
          <span className="order-summary-bold">{orderId}</span>
        </div>
        <div className="order-summary-row">
          <span>Customer:</span>
          <span>{addressData.fullName}</span>
        </div>
        <div className="order-summary-row">
          <span>Email:</span>
          <span>{customerEmail}</span>
        </div>
        <div className="order-summary-row">
          <span>Delivery:</span>
          <span>
            {addressData.shippingOption === "pickup"
              ? "Local Pickup"
              : "Ship to Address"}
          </span>
        </div>
        {addressData.shippingOption === "ship" && (
          <div className="order-summary-row">
            <span>Address:</span>
            <span>
              {addressData.addressLine1}, {addressData.city}{" "}
              {addressData.postalCode}
            </span>
          </div>
        )}
        <div className="order-summary-total">
          <span className="order-summary-bold">Total:</span>
          <span className="order-summary-bold">{formatAmount(amount)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="card-input-container">
          <label className="card-input-label">Card Details</label>
          <CardElement options={cardElementOptions} />
        </div>

        {error && <div className="payment-error">{error}</div>}

        <button
          type="submit"
          disabled={!stripe || processing}
          className={`payment-button ${
            processing ? "payment-button-processing" : "payment-button-active"
          }`}
        >
          {processing ? "Processing..." : `Pay ${formatAmount(amount)}`}
        </button>
      </form>

      <div className="payment-security-info">
        <p className="payment-security-text">
          🔒 Your payment is secured by Stripe. Your card details are never
          stored on our servers.
        </p>
      </div>
    </div>
  );
};

StripeCheckout.propTypes = {
  clientSecret: PropTypes.string.isRequired,
  orderId: PropTypes.string.isRequired,
  customerEmail: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  addressData: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
    addressLine1: PropTypes.string,
    addressLine2: PropTypes.string,
    city: PropTypes.string,
    postalCode: PropTypes.string,
    shippingOption: PropTypes.oneOf(["ship", "pickup"]).isRequired,
  }).isRequired,
};

export default StripeCheckout;
