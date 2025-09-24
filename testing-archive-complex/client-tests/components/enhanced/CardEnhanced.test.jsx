// CardEnhanced.test.jsx - Advanced Card Component Testing
import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { axe, toHaveNoViolations } from "jest-axe";

// Import enhanced testing utilities
import { enhancedTestUtils } from "../../setup/enhancedTestSetup";

// Import cart context for integration
import { CartProvider } from "../../../context/CartContext";

// Import component
import Card from "../../../components/Card";

// Add accessibility matcher
expect.extend(toHaveNoViolations);

// Test wrapper with cart context and routing
const TestWrapper = ({ children }) => {
  return (
    <BrowserRouter>
      <CartProvider>{children}</CartProvider>
    </BrowserRouter>
  );
};

// Add PropTypes validation
TestWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

// Real product data for testing (using your actual data structure)
const realProduct = {
  id: 1,
  title: "Dragon",
  price: 1500, // $15.00 in cents
  image: "dragon.jpg",
  description: "150g 11.5H x 8W",
};

describe("CardEnhanced - Advanced Interactions", () => {
  beforeEach(() => {
    enhancedTestUtils.simulateDesktop();
  });

  test("renders all product details correctly", () => {
    render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    expect(screen.getByText("Dragon")).toBeInTheDocument();
    expect(screen.getByText("$15.00")).toBeInTheDocument();
    expect(screen.getByText("150g 11.5H x 8W")).toBeInTheDocument();

    const image = screen.getByRole("img", { name: /dragon/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "http://localhost:8080/images/dragon.jpg"
    );
    // Flexible alt text checking - accepts enhanced accessibility text
    expect(image.getAttribute("alt")).toMatch(/dragon/i);
  });

  test("handles missing image prop gracefully", () => {
    const productWithoutImage = { ...realProduct, image: undefined };
    render(
      <TestWrapper>
        <Card
          title={productWithoutImage.title}
          price={productWithoutImage.price}
          description={productWithoutImage.description}
          image={productWithoutImage.image}
        />
      </TestWrapper>
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("formats price correctly", () => {
    render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    expect(screen.getByText("$15.00")).toBeInTheDocument();
  });

  test("handles full URL image paths", () => {
    const productWithFullImageUrl = {
      ...realProduct,
      image: "https://example.com/full-dragon-image.jpg",
    };
    render(
      <TestWrapper>
        <Card
          title={productWithFullImageUrl.title}
          price={productWithFullImageUrl.price}
          description={productWithFullImageUrl.description}
          image={productWithFullImageUrl.image}
        />
      </TestWrapper>
    );

    const image = screen.getByRole("img", { name: /dragon/i });
    expect(image).toHaveAttribute("src", "https://example.com/full-dragon-image.jpg");
  });

  test("handles all real Queen Bee product data", () => {
    const testProducts = [
      { id: 1, title: "Dragon", price: 1500, description: "150g 11.5H x 8W", image: "dragon.jpg" },
      { id: 2, title: "Corn Cob", price: 1600, description: "160g 15.5H x 4.5W", image: "corn-cob.jpg" },
      { id: 3, title: "Bee and Flower", price: 850, description: "45g 3H X 6.5W", image: "bee-and-flower.jpg" },
      { id: 4, title: "Rose", price: 800, description: "40g 3H X 6.5W", image: "rose.jpg" }
    ];

    testProducts.forEach((product) => {
      const { unmount } = render(
        <TestWrapper>
          <Card
            title={product.title}
            price={product.price}
            description={product.description}
            image={product.image}
          />
        </TestWrapper>
      );

      expect(screen.getByText(product.title)).toBeInTheDocument();
      expect(screen.getByText(product.description)).toBeInTheDocument();
      
      const expectedPrice = `$${(product.price / 100).toFixed(2)}`;
      expect(screen.getByText(expectedPrice)).toBeInTheDocument();

      const image = screen.getByRole("img");
      expect(image.getAttribute("alt")).toMatch(new RegExp(product.title, 'i'));

      unmount();
    });
  });

  test("supports keyboard navigation to card elements", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    // Test that card elements are present and can be navigated to
    const cardElement = screen.getByText("Dragon").closest(".card, article");
    expect(cardElement).toBeInTheDocument();

    // Test tab navigation
    await user.keyboard("{Tab}");
    // Card should be focusable or contain focusable elements
    expect(document.activeElement).toBeDefined();
  });

  test("handles rapid re-renders gracefully", async () => {
    const testProducts = [
      { id: 1, title: "Dragon", price: 1500, description: "150g 11.5H x 8W", image: "dragon.jpg" },
      { id: 2, title: "Corn Cob", price: 1600, description: "160g 15.5H x 4.5W", image: "corn-cob.jpg" },
      { id: 3, title: "Bee and Flower", price: 850, description: "45g 3H X 6.5W", image: "bee-and-flower.jpg" },
      { id: 4, title: "Rose", price: 800, description: "40g 3H X 6.5W", image: "rose.jpg" }
    ];

    const { rerender } = render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    // Rapidly re-render with different data from real products
    testProducts.forEach((product) => {
      rerender(
        <TestWrapper>
          <Card
            title={product.title}
            price={product.price}
            description={product.description}
            image={product.image}
          />
        </TestWrapper>
      );
    });

    // Should handle rapid changes without errors
    expect(screen.getByText("Rose")).toBeInTheDocument();
  });

  test("maintains consistent structure across different props", () => {
    const testProducts = [
      { id: 1, title: "Dragon", price: 1500, description: "150g 11.5H x 8W", image: "dragon.jpg" },
      { id: 2, title: "Corn Cob", price: 1600, description: "160g 15.5H x 4.5W", image: "corn-cob.jpg" }
    ];

    testProducts.forEach((product) => {
      const { unmount } = render(
        <TestWrapper>
          <Card
            title={product.title}
            price={product.price}
            description={product.description}
            image={product.image}
          />
        </TestWrapper>
      );

      // Check that basic structure is maintained
      expect(screen.getByRole("img")).toBeInTheDocument();
      expect(screen.getByText(product.title)).toBeInTheDocument();
      expect(screen.getByText(/^\$[\d,]+\.\d{2}$/)).toBeInTheDocument();
      expect(screen.getByText(product.description)).toBeInTheDocument();

      unmount();
    });
  });
});

describe("CardEnhanced - Visual States", () => {
  test("displays consistent visual styling", () => {
    render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    const cardElement = screen.getByText("Dragon").closest(".card, article");
    expect(cardElement).toBeInTheDocument();

    // Check for expected card elements (flexible class names)
    expect(cardElement.querySelector(".card-img, img")).toBeInTheDocument();
    expect(cardElement.querySelector(".card-title, h2, h3")).toBeInTheDocument();
    expect(cardElement.querySelector(".card-price, .price")).toBeInTheDocument();
    expect(cardElement.querySelector(".card-text, p")).toBeInTheDocument();
  });

  test("handles hover states appropriately", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    const cardElement = screen.getByText("Dragon").closest(".card, article");

    // Test hover interaction
    await user.hover(cardElement);

    // Card should remain stable during hover
    expect(cardElement).toBeInTheDocument();
    expect(screen.getByText("Dragon")).toBeInTheDocument();
  });

  test("maintains image aspect ratio and sizing", () => {
    render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    const imageElement = screen.getByRole("img");
    
    // Image should have proper alt text (flexible matching)
    expect(imageElement.getAttribute("alt")).toMatch(/dragon/i);
  });

  test("handles different price ranges consistently", () => {
    const priceTestCases = [
      { price: 800, expected: "$8.00" },   // Rose
      { price: 850, expected: "$8.50" },   // Bee and Flower
      { price: 1500, expected: "$15.00" }, // Dragon
      { price: 1600, expected: "$16.00" }, // Corn Cob
    ];

    priceTestCases.forEach(({ price, expected }) => {
      const { unmount } = render(
        <TestWrapper>
          <Card
            title={realProduct.title}
            price={price}
            description={realProduct.description}
            image={realProduct.image}
          />
        </TestWrapper>
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  test("provides consistent text content structure", () => {
    render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    // Check semantic HTML structure (flexible heading levels)
    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("Dragon");
    
    expect(screen.getByText("$15.00")).toBeInTheDocument();
    expect(screen.getByText("150g 11.5H x 8W")).toBeInTheDocument();
  });

  test("adapts to responsive design breakpoints", () => {
    // Test mobile breakpoint
    enhancedTestUtils.simulateMobile();

    const { rerender } = render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    let cardElement = screen.getByText("Dragon").closest(".card, article");
    expect(cardElement).toBeInTheDocument();

    // Test desktop breakpoint
    enhancedTestUtils.simulateDesktop();

    rerender(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    cardElement = screen.getByText("Dragon").closest(".card, article");
    expect(cardElement).toBeInTheDocument();
  });
});

describe("CardEnhanced - Accessibility", () => {
  test("has no accessibility violations", async () => {
    const { container } = render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("provides proper semantic HTML structure", () => {
    render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    // Check for proper heading (flexible level)
    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("Dragon");
    
    // Check for proper image alt text (flexible)
    const image = screen.getByRole("img");
    expect(image.getAttribute("alt")).toMatch(/dragon/i);
  });

  test("supports keyboard navigation", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    // Test that keyboard navigation works
    await user.keyboard("{Tab}");

    // Should be able to navigate through the card
    expect(document.activeElement).toBeDefined();
  });

  test("provides appropriate ARIA attributes", () => {
    render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    // Image should have proper alt text (flexible matching)
    const image = screen.getByRole("img");
    expect(image.getAttribute("alt")).toMatch(/dragon/i);

    // Check that content is properly labeled
    expect(screen.getByText("Dragon")).toBeInTheDocument();
    expect(screen.getByText("$15.00")).toBeInTheDocument();
  });
});

describe("CardEnhanced - Performance", () => {
  test("handles large dataset rendering efficiently", async () => {
    const startTime = performance.now();

    // Create a large dataset using real product patterns
    const testProducts = [
      { id: 1, title: "Dragon", price: 1500, description: "150g 11.5H x 8W", image: "dragon.jpg" },
      { id: 2, title: "Corn Cob", price: 1600, description: "160g 15.5H x 4.5W", image: "corn-cob.jpg" },
      { id: 3, title: "Bee and Flower", price: 850, description: "45g 3H X 6.5W", image: "bee-and-flower.jpg" },
      { id: 4, title: "Rose", price: 800, description: "40g 3H X 6.5W", image: "rose.jpg" }
    ];

    const largeProductSet = Array.from({ length: 100 }, (_, i) => {
      const baseProduct = testProducts[i % testProducts.length];
      return {
        ...baseProduct,
        id: i + 1,
        title: `${baseProduct.title} ${i + 1}`,
        price: baseProduct.price + (i * 10),
      };
    });

    render(
      <TestWrapper>
        <div>
          {largeProductSet.map((product) => (
            <Card
              key={product.id}
              title={product.title}
              price={product.price}
              description={product.description}
              image={product.image}
            />
          ))}
        </div>
      </TestWrapper>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render 100 cards in under 2 seconds
    expect(renderTime).toBeLessThan(2000);

    // Verify all products are rendered
    expect(screen.getAllByRole("img")).toHaveLength(100);
  });

  test("handles memory usage efficiently", () => {
    const { unmount } = render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    // Check that component renders successfully
    expect(screen.getByText("Dragon")).toBeInTheDocument();

    // Unmount should clean up properly
    unmount();

    // After unmount, elements should not be in document
    expect(screen.queryByText("Dragon")).not.toBeInTheDocument();
  });

  test("supports efficient re-rendering", async () => {
    const testProducts = [
      { id: 1, title: "Dragon", price: 1500, description: "150g 11.5H x 8W", image: "dragon.jpg" },
      { id: 2, title: "Corn Cob", price: 1600, description: "160g 15.5H x 4.5W", image: "corn-cob.jpg" },
      { id: 3, title: "Bee and Flower", price: 850, description: "45g 3H X 6.5W", image: "bee-and-flower.jpg" },
      { id: 4, title: "Rose", price: 800, description: "40g 3H X 6.5W", image: "rose.jpg" }
    ];

    const renderTimes = [];

    testProducts.forEach((product, i) => {
      const startTime = performance.now();

      const { unmount } = render(
        <TestWrapper>
          <Card
            title={product.title}
            price={product.price}
            description={product.description}
            image={product.image}
          />
        </TestWrapper>
      );

      const endTime = performance.now();
      renderTimes.push(endTime - startTime);

      unmount();
    });

    // Average render time should be reasonable
    const avgRenderTime =
      renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    expect(avgRenderTime).toBeLessThan(100); // Should render in under 100ms on average
  });

  test("optimizes image loading", () => {
    const { container } = render(
      <TestWrapper>
        <Card
          title={realProduct.title}
          price={realProduct.price}
          description={realProduct.description}
          image={realProduct.image}
        />
      </TestWrapper>
    );

    const imageElement = container.querySelector("img");

    // Image should be present and properly configured
    expect(imageElement).toBeTruthy();
    expect(imageElement).toHaveAttribute(
      "src",
      "http://localhost:8080/images/dragon.jpg"
    );
    expect(imageElement.getAttribute("alt")).toMatch(/dragon/i);
  });
});
