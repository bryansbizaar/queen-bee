import React from "react";
import PropTypes from "prop-types";

// Get NODE_ENV from build-time environment or default to development
const NODE_ENV = import.meta.env?.MODE || "development";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate a unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Log error details
    console.error("🚨 Error Boundary caught an error:", {
      errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // In production, you would send this to an error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            maxWidth: "600px",
            margin: "2rem auto",
            border: "1px solid #fee2e2",
            borderRadius: "0.5rem",
            backgroundColor: "#fef2f2",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>

          <h2
            style={{
              color: "#dc2626",
              marginBottom: "1rem",
              fontSize: "1.5rem",
            }}
          >
            {this.props.title || "Something went wrong"}
          </h2>

          <p
            style={{
              color: "#7f1d1d",
              marginBottom: "2rem",
              lineHeight: "1.5",
            }}
          >
            {this.props.message ||
              "We encountered an unexpected error. Our team has been notified and is working to fix this issue."}
          </p>

          {NODE_ENV === "development" && this.state.error && (
            <details
              style={{
                marginBottom: "2rem",
                textAlign: "left",
                backgroundColor: "#f9fafb",
                padding: "1rem",
                borderRadius: "0.375rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                Error Details (Development)
              </summary>
              <pre
                style={{
                  fontSize: "0.875rem",
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                <strong>Error:</strong> {this.state.error.message}
                {"\n\n"}
                <strong>Stack:</strong> {this.state.error.stack}
                {this.state.errorInfo.componentStack && (
                  <>
                    {"\n\n"}
                    <strong>Component Stack:</strong>{" "}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={this.handleRetry}
              style={{
                backgroundColor: "#4f46e5",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.375rem",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Try Again
            </button>

            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: "#6b7280",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.375rem",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Reload Page
            </button>
          </div>

          {this.state.errorId && (
            <p
              style={{
                marginTop: "1.5rem",
                fontSize: "0.875rem",
                color: "#6b7280",
              }}
            >
              Error ID: <code>{this.state.errorId}</code>
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  onError: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
};

export default ErrorBoundary;

// Specific error boundaries for different parts of the app
export const APIErrorBoundary = ({ children }) => (
  <ErrorBoundary
    title="API Error"
    message="We're having trouble connecting to our servers. Please check your internet connection and try again."
    onError={(error, errorInfo, errorId) => {
      // Log API-specific errors
      console.error("API Error:", { error, errorInfo, errorId });
    }}
  >
    {children}
  </ErrorBoundary>
);

APIErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export const CartErrorBoundary = ({ children }) => (
  <ErrorBoundary
    title="Cart Error"
    message="There was an issue with your shopping cart. Your items should still be saved."
    onError={(error, errorInfo, errorId) => {
      // Log cart-specific errors and maybe preserve cart state
      console.error("Cart Error:", { error, errorInfo, errorId });
    }}
  >
    {children}
  </ErrorBoundary>
);

CartErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export const PaymentErrorBoundary = ({ children }) => (
  <ErrorBoundary
    title="Payment Error"
    message="There was an issue processing your payment. Please try again or contact support."
    onError={(error, errorInfo, errorId) => {
      // Log payment errors - these are critical
      console.error("Payment Error:", { error, errorInfo, errorId });
    }}
  >
    {children}
  </ErrorBoundary>
);

PaymentErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
