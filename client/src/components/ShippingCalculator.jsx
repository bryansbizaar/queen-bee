import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function ShippingCalculator({
  cartItems,
  onShippingSelected,
  onError,
}) {
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isRural, setIsRural] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Auto-calculate when postcode is valid
    if (postcode.length === 4 && /^\d{4}$/.test(postcode)) {
      calculateShipping();
    } else {
      setOptions([]);
      setSelectedOption(null);
    }
  }, [postcode, cartItems]);

  const calculateShipping = async () => {
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

      if (!response.ok) throw new Error("Failed to calculate shipping");

      const data = await response.json();
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
      setError("Unable to calculate shipping. Please try again.");
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

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
      <h3>Shipping Address</h3>

      <div style={{ marginBottom: "15px" }}>
        <label
          htmlFor="postcode"
          style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}
        >
          Postcode *
        </label>
        <input
          id="postcode"
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.slice(0, 4))}
          placeholder="e.g., 6011"
          maxLength={4}
          pattern="\d{4}"
          required
          style={{
            width: "200px",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <small
          style={{
            display: "block",
            color: "#666",
            fontSize: "12px",
            marginTop: "4px",
          }}
        >
          4-digit NZ postcode
        </small>
      </div>

      {loading && (
        <div
          style={{
            padding: "10px",
            background: "#f0f8ff",
            borderRadius: "4px",
            color: "#0066cc",
          }}
        >
          Calculating shipping...
        </div>
      )}

      {error && (
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

      {isRural && (
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

      {options.length > 0 && (
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
  onShippingSelected: PropTypes.func,
  onError: PropTypes.func,
};
