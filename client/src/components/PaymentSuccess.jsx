import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import formatAmount from "../utils/formatAmount";

const PaymentSuccess = () => {
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const storedPaymentData = sessionStorage.getItem("paymentSuccess");
    if (storedPaymentData) {
      setPaymentData(JSON.parse(storedPaymentData));
    }
  }, []);

  if (!paymentData) {
    return (
      <div className="success-container">
        <h2 className="success-error-title">No Payment Information Found</h2>
        <p className="success-error-text">
          We couldn&apos;t find your payment information. This page is only
          accessible after a successful payment.
        </p>
        <Link to="/" className="action-button action-button-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Check if there was an order creation issue
  const hasOrderIssue =
    paymentData.orderStatus === "payment_succeeded_order_pending";

  return (
    <div className="success-container">
      <div
        className={`success-icon ${
          hasOrderIssue ? "success-icon-warning" : "success-icon-green"
        }`}
      >
        {hasOrderIssue ? "⚠️" : "✅"}
      </div>

      <h1
        className={`success-title ${
          hasOrderIssue ? "success-title-warning" : "success-title-green"
        }`}
      >
        {hasOrderIssue ? "Payment Received!" : "Order Confirmed!"}
      </h1>

      <p className="success-subtitle">
        {hasOrderIssue
          ? "Your payment was successful, but we're still processing your order details."
          : "Thank you for your purchase from Queen Bee Candles!"}
      </p>

      <div
        className={`order-details-card ${
          hasOrderIssue ? "order-details-warning" : "order-details-green"
        }`}
      >
        <h3
          className={`order-details-title ${
            hasOrderIssue
              ? "order-details-title-warning"
              : "order-details-title-green"
          }`}
        >
          {hasOrderIssue ? "Payment Details" : "Order Details"}
        </h3>

        <div className="order-details-grid">
          <div className="order-details-row">
            <span className="order-details-label">Order ID:</span>
            <span className="order-details-value">{paymentData.orderId}</span>
          </div>

          <div className="order-details-row">
            <span className="order-details-label">Payment ID:</span>
            <span className="order-details-value-small">
              {paymentData.paymentIntentId}
            </span>
          </div>

          <div className="order-details-row">
            <span className="order-details-label">Amount:</span>
            <span className="order-details-value">
              {formatAmount(paymentData.amount * 100)}
            </span>
          </div>

          <div className="order-details-row">
            <span className="order-details-label">Email:</span>
            <span>{paymentData.customerEmail}</span>
          </div>

          {paymentData.itemCount && (
            <div className="order-details-row">
              <span className="order-details-label">Items:</span>
              <span>{paymentData.itemCount}</span>
            </div>
          )}

          <div className="order-details-row">
            <span className="order-details-label">Status:</span>
            <span
              className={
                hasOrderIssue
                  ? "order-details-status-warning"
                  : "order-details-status-green"
              }
            >
              {hasOrderIssue ? "Processing" : "Confirmed"}
            </span>
          </div>

          <div className="order-details-row">
            <span className="order-details-label">Date:</span>
            <span>{new Date(paymentData.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {hasOrderIssue && (
        <div className="next-steps-card next-steps-warning">
          <h4 className="next-steps-title next-steps-title-warning">
            What happens next?
          </h4>
          <p className="next-steps-text next-steps-text-warning">
            Your payment was successful and we&apos;ll process your order
            shortly. If you don&apos;t receive a confirmation email within 24
            hours, please contact us with your Payment ID:{" "}
            <strong>{paymentData.paymentIntentId}</strong>
          </p>
        </div>
      )}

      {!hasOrderIssue && (
        <div className="next-steps-card next-steps-success">
          <h4 className="next-steps-title next-steps-title-success">
            What happens next?
          </h4>
          <ul className="next-steps-list next-steps-list-success">
            <li>You&apos;ll receive a confirmation email shortly</li>
            <li>We&apos;ll prepare your handcrafted candles with care</li>
            <li>Your order will be shipped within 2-3 business days</li>
            <li>You&apos;ll receive tracking information via email</li>
          </ul>
        </div>
      )}

      <div className="action-buttons">
        <Link to="/" className="action-button action-button-primary">
          Continue Shopping
        </Link>

        <a
          href={`mailto:support@queenbeecandles.co.nz?subject=Order Inquiry - ${paymentData.orderId}&body=Hi, I have a question about my order ${paymentData.orderId} (Payment ID: ${paymentData.paymentIntentId})`}
          className="action-button action-button-secondary"
        >
          Contact Support
        </a>
      </div>

      <div className="contact-info">
        <p className="contact-info-text">
          <strong>Need help?</strong> Contact us at
          support@queenbeecandles.co.nz or reference your Order ID:{" "}
          <strong>{paymentData.orderId}</strong>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
