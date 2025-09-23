import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

function SimpleTest() {
  return <div>Test Component</div>;
}

describe('Simple Test', () => {
  it('should render without errors', () => {
    const { container } = render(<SimpleTest />);
    expect(container).toBeDefined();
  });
});