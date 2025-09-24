import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const PaymentFailure = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's error information in sessionStorage
    const storedError = sessionStorage.getItem("paymentError");
    if (storedError) {
      setErrorMessage(JSON.parse(storedError).message);
      // Clear the error after displaying it
      sessionStorage.removeItem("paymentError");
    } else {
      // If no error information, show generic message
      setErrorMessage("Your payment could not be processed at this time.");
    }
  }, []);

  const handleRetry = () => {
    // Navigate back to cart to retry payment
    navigate("/cart");
  };

  return (
    <div className="payment-failure-container">
      <div className="payment-failure-icon">
        ❌
      </div>

      <h1 className="payment-failure-title">
        Payment Failed
      </h1>

      <p className="payment-failure-subtitle">
        We&apos;re sorry, but your payment could not be processed.
      </p>

      <div className="payment-failure-error-card">
        <h3 className="payment-failure-error-title">
          What went wrong?
        </h3>

        <p className="payment-failure-error-text">
          {errorMessage}
        </p>
      </div>

      <div className="payment-failure-reasons-card">
        <h4 className="payment-failure-reasons-title">
          Common reasons for payment failure:
        </h4>
        <ul className="payment-failure-reasons-list">
          <li>Insufficient funds</li>
          <li>Incorrect card details</li>
          <li>Card expired or blocked</li>
          <li>Network connectivity issues</li>
          <li>Bank security restrictions</li>
        </ul>
      </div>

      <div className="payment-failure-actions">
        <button
          onClick={handleRetry}
          className="payment-failure-retry-btn"
        >
          Try Again
        </button>

        <Link
          to="/"
          className="payment-failure-shop-link"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="payment-failure-help-card">
        <p className="payment-failure-help-text">
          💡 <strong>Need help?</strong> Contact our support team if you
          continue to experience issues.
        </p>
      </div>
    </div>
  );
};

export default PaymentFailure;
