import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";

export default function ShippingCalculator({
  cartItems,
  postcode,
  onShippingSelected,
  onError,
}) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isRural, setIsRural] = useState(false);
  const [error, setError] = useState("");
  const lastCalculatedRef = useRef("");

  const calculateShipping = useCallback(async () => {
    console.log('[ShippingCalculator] Starting calculation for postcode:', postcode);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/shipping/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
            postcode: postcode,
          }),
        }
      );

      console.log('[ShippingCalculator] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[ShippingCalculator] Error response:', errorData);
        throw new Error(errorData.message || "Failed to calculate shipping");
      }

      const data = await response.json();
      console.log('[ShippingCalculator] Success data:', data);
      setOptions(data.options || []);
      setIsRural(data.isRural || false);

      // Auto-select recommended option
      const recommended =
        data.options?.find((opt) => opt.recommended) || data.options?.[0];
      if (recommended) {
        setSelectedOption(recommended);
        onShippingSelected(recommended);
      }
    } catch (err) {
      console.error('[ShippingCalculator] Calculation error:', err);
      setError("Unable to calculate shipping. Please try again.");
      onError?.(err);
    } finally {
      setLoading(false);
      console.log('[ShippingCalculator] Calculation complete');
    }
  }, [cartItems, postcode, onShippingSelected, onError]);

  useEffect(() => {
    // Auto-calculate when postcode is valid and hasn't been calculated yet
    if (postcode.length === 4 && /^\d{4}$/.test(postcode) && lastCalculatedRef.current !== postcode) {
      console.log('[ShippingCalculator] Triggering calculation');
      lastCalculatedRef.current = postcode;
      calculateShipping();
    } else if (postcode.length !== 4) {
      console.log('[ShippingCalculator] Invalid postcode, clearing options');
      lastCalculatedRef.current = "";
      setOptions([]);
      setSelectedOption(null);
    }
  }, [postcode, calculateShipping]); // Removed cartItems from dependencies

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    onShippingSelected(option);
  };

  return (
    <div
      style={{
        margin: "20px 0",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h3>Shipping Options</h3>

      {loading && (
        <div
          style={{
            padding: "10px",
            background: "#f0f8ff",
            borderRadius: "4px",
            color: "#0066cc",
            marginBottom: "15px",
          }}
        >
          Calculating shipping...
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            padding: "10px",
            background: "#fee",
            borderRadius: "4px",
            color: "#c00",
          }}
        >
          {error}
        </div>
      )}

      {!loading && isRural && (
        <div
          style={{
            padding: "8px 12px",
            background: "#fff3cd",
            borderRadius: "4px",
            margin: "10px 0",
          }}
        >
          🚜 Rural Delivery Area
        </div>
      )}

      {!loading && options.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Delivery Options</h4>
          {options.map((option) => (
            <label
              key={option.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "6px",
                marginBottom: "10px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="shipping"
                value={option.id}
                checked={selectedOption?.id === option.id}
                onChange={() => handleOptionSelect(option)}
                style={{ marginRight: "12px", marginTop: "4px" }}
              />
              <div style={{ flex: 1 }}>
                <strong>{option.description}</strong>
                {option.recommended && (
                  <span
                    style={{
                      background: "#0066cc",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      marginLeft: "8px",
                    }}
                  >
                    Recommended
                  </span>
                )}
                <div
                  style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}
                >
                  ${option.cost.toFixed(2)} • {option.estimatedDays}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

ShippingCalculator.propTypes = {
  cartItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      quantity: PropTypes.number,
    })
  ).isRequired,
  postcode: PropTypes.string.isRequired,
  onShippingSelected: PropTypes.func,
  onError: PropTypes.func,
};
