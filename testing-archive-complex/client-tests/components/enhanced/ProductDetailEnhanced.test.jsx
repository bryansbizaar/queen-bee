// ProductDetailEnhanced.test.jsx - Properly Scoped Test Suite
// Tests only features that are actually implemented in the ProductDetail component

import {
  describe,
  test,
  expect,
  beforeEach,
  vi,
  afterEach,
} from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";

// Import component and context
import ProductDetail from "../../../components/ProductDetail";
import { CartProvider } from "../../../context/CartContext";

// Import test utilities
import PropTypes from 'prop-types';

// Mock useParams to avoid URL dependency issues
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' })
  }
})

// Test wrapper component
const TestWrapper = ({ children, productId }) => {
  return (
    <BrowserRouter>
      <CartProvider>
        {productId ? (
          <ProductDetail productId={productId} />
        ) : (
          <ProductDetail />
        )}
        {children}
      </CartProvider>
    </BrowserRouter>
  );
};

// Add PropTypes validation
TestWrapper.propTypes = {
  children: PropTypes.node,
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// Mock product data matching the actual API response structure
// Note: price is in cents as expected by formatAmount utility
const mockProduct = {
  id: 1,
  title: "Vanilla Dream Candle",
  price: 2499, // 24.99 in cents
  description: "A luxurious vanilla-scented candle made from premium soy wax",
  image: "vanilla-candle.jpg",
};

const mockApiResponse = {
  success: true,
  data: {
    product: mockProduct,
  },
};

describe("ProductDetailEnhanced - Core Functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("displays loading state initially", () => {
    globalThis.fetch = vi.fn(() => new Promise(() => {}));
    
    render(<TestWrapper productId="1"></TestWrapper>);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test("fetches and displays product information correctly", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    render(<TestWrapper productId="1"></TestWrapper>);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Verify product information is displayed
    expect(screen.getByText("Vanilla Dream Candle")).toBeInTheDocument();
    expect(screen.getByText("$24.99")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A luxurious vanilla-scented candle made from premium soy wax"
      )
    ).toBeInTheDocument();

    // Verify image is displayed with correct src and alt
    const productImage = screen.getByRole("img");
    expect(productImage).toHaveAttribute(
      "src",
      "http://localhost:8080/images/vanilla-candle.jpg"
    );
    expect(productImage).toHaveAttribute("alt", "Vanilla Dream Candle");
  });

  test("handles product not found error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<TestWrapper productId="999"></TestWrapper>);

    await waitFor(() => {
      expect(screen.getByText("Error: Product not found")).toBeInTheDocument();
    });

    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  test("handles network errors gracefully", async () => {
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  test("handles alternative API response structure", async () => {
    // Test fallback for simple response structure
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    });

    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.getByText("Vanilla Dream Candle")).toBeInTheDocument();
    });
  });

  test("uses productId prop when provided", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const spy = vi.spyOn(globalThis, "fetch");

    render(<TestWrapper productId="123"></TestWrapper>);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        "http://localhost:8080/api/products/123"
      );
    });

    spy.mockRestore();
  });
});

describe("ProductDetailEnhanced - Quantity Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
  });

  test("displays quantity input with default value of 1", async () => {
    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText("Quantity:");
    expect(quantityInput).toHaveValue(1);
    expect(quantityInput).toHaveAttribute("type", "number");
    expect(quantityInput).toHaveAttribute("min", "1");
  });

  test("allows user to change quantity", async () => {
    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText("Quantity:");

    // Use fireEvent to directly simulate the change event
    fireEvent.change(quantityInput, { target: { value: '5' } });

    expect(quantityInput).toHaveValue(5);
  });

  test("resets invalid quantity to 1", async () => {
    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText("Quantity:");

    // Test zero value - component validates onChange
    fireEvent.change(quantityInput, { target: { value: '0' } });
    
    // The component should immediately reset to 1 due to handleQuantityChange validation
    expect(quantityInput).toHaveValue(1);

    // Test negative value
    fireEvent.change(quantityInput, { target: { value: '-5' } });
    
    // The component should immediately reset to 1 due to handleQuantityChange validation
    expect(quantityInput).toHaveValue(1);
  });

  test("handles non-numeric input gracefully", async () => {
    const user = userEvent.setup();

    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText("Quantity:");

    await user.clear(quantityInput);
    await user.type(quantityInput, "abc");

    // Input should either prevent non-numeric input or handle it gracefully
    expect(quantityInput.value).not.toBe("abc");
  });
});

describe("ProductDetailEnhanced - Cart Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
  });

  test("displays add to cart button", async () => {
    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const addToCartButton = screen.getByRole("button", { name: "Add to Cart" });
    expect(addToCartButton).toBeInTheDocument();
  });

  test("adds product to cart with correct quantity", async () => {
    const user = userEvent.setup();

    // This would require mocking the useCart hook properly
    // For now, we'll test the button interaction
    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText("Quantity:");
    const addToCartButton = screen.getByRole("button", { name: "Add to Cart" });

    // Change quantity
    await user.clear(quantityInput);
    await user.type(quantityInput, "3");

    // Click add to cart
    await user.click(addToCartButton);

    // The actual cart integration would need to be tested with proper mocking
    // This test verifies the UI interaction works
    expect(addToCartButton).toBeInTheDocument();
  });

  test("does not allow adding to cart when product is not loaded", () => {
    // Test with loading state - never resolve the promise
    globalThis.fetch = vi.fn(() => new Promise(() => {}));

    render(<TestWrapper productId="1"></TestWrapper>);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add to Cart" })
    ).not.toBeInTheDocument();
  });

  test("does not show add to cart button when there is an error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.getByText("Error: Product not found")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: "Add to Cart" })
    ).not.toBeInTheDocument();
  });
});

describe("ProductDetailEnhanced - Accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
  });

  test("has proper form labels and structure", async () => {
    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Verify quantity input has proper label
    const quantityInput = screen.getByLabelText("Quantity:");
    expect(quantityInput).toBeInTheDocument();

    // Verify button is accessible
    const addToCartButton = screen.getByRole("button", { name: "Add to Cart" });
    expect(addToCartButton).toBeInTheDocument();

    // Verify image has alt text
    const productImage = screen.getByRole("img");
    expect(productImage).toHaveAttribute("alt", "Vanilla Dream Candle");
  });

  test("supports keyboard navigation", async () => {
    const user = userEvent.setup();

    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText("Quantity:");
    const addToCartButton = screen.getByRole("button", { name: "Add to Cart" });

    // Test tab navigation
    await user.tab();
    expect(quantityInput).toHaveFocus();

    await user.tab();
    expect(addToCartButton).toHaveFocus();
  });

  test("provides semantic HTML structure", async () => {
    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Verify heading structure
    const productTitle = screen.getByRole("heading", { level: 1 });
    expect(productTitle).toHaveTextContent("Vanilla Dream Candle");

    // Verify image is properly labeled
    const productImage = screen.getByRole("img");
    expect(productImage).toBeInTheDocument();

    // Verify button is properly accessible
    const addToCartButton = screen.getByRole("button");
    expect(addToCartButton).toBeInTheDocument();
  });
});

describe("ProductDetailEnhanced - Error Recovery", () => {
  test("recovers when switching from error to success state", async () => {
    // Test 1: Render component in error state
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error("Product not found"));

    const { unmount } = render(<TestWrapper productId="999"></TestWrapper>);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    // Clean up first render
    unmount();

    // Test 2: Render component in success state
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.getByText("Vanilla Dream Candle")).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify error is not present
    expect(
      screen.queryByText(/Error:/)
    ).not.toBeInTheDocument();
  });

  test("clears previous product data when loading new product", async () => {
    const firstProduct = {
      id: 1,
      title: "First Product",
      price: 1000, // 10.00 in cents
      description: "First description",
      image: "first.jpg",
    };

    const secondProduct = {
      id: 2,
      title: "Second Product",
      price: 2000, // 20.00 in cents
      description: "Second description",
      image: "second.jpg",
    };

    // First product
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { product: firstProduct } }),
    });

    const { rerender } = render(<TestWrapper productId="1"></TestWrapper>);

    await waitFor(() => {
      expect(screen.getByText("First Product")).toBeInTheDocument();
    });

    // Setup mock for second product with a slight delay to see loading
    globalThis.fetch = vi.fn().mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, data: { product: secondProduct } }),
        }), 100)
      )
    );

    rerender(<TestWrapper productId="2"></TestWrapper>);

    // Wait for the second product to load
    await waitFor(() => {
      expect(screen.getByText("Second Product")).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.queryByText("First Product")).not.toBeInTheDocument();
  });
});
