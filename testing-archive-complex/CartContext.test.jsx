import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CartProvider } from './CartContext'
import useCart from './useCart'

const TestComponent = () => {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount
  } = useCart()

  const mockProduct1 = {
    id: 1,
    title: 'Vanilla Candle',
    price: 2500,
    description: 'Sweet vanilla scented candle'
  }

  const mockProduct2 = {
    id: 2,
    title: 'Lavender Candle',
    price: 3000,
    description: 'Relaxing lavender scented candle'
  }

  return (
    <div>
      <div data-testid="cart-count">{getCartCount()}</div>
      <div data-testid="cart-total">{getCartTotal()}</div>
      <div data-testid="cart-items">{JSON.stringify(cartItems)}</div>
      
      <button 
        onClick={() => addToCart(mockProduct1)}
        data-testid="add-vanilla"
      >
        Add Vanilla
      </button>
      
      <button 
        onClick={() => addToCart(mockProduct2, 2)}
        data-testid="add-lavender-2"
      >
        Add 2 Lavender
      </button>
      
      <button 
        onClick={() => removeFromCart(1)}
        data-testid="remove-vanilla"
      >
        Remove Vanilla
      </button>
      
      <button 
        onClick={() => updateQuantity(1, 3)}
        data-testid="update-vanilla-3"
      >
        Update Vanilla to 3
      </button>
      
      <button 
        onClick={() => updateQuantity(1, 0)}
        data-testid="update-vanilla-0"
      >
        Update Vanilla to 0
      </button>
    </div>
  )
}

describe('CartContext', () => {
  const renderWithProvider = () => {
    return render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    )
  }

  it('initializes with empty cart', () => {
    renderWithProvider()
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-items')).toHaveTextContent('[]')
  })

  it('adds new item to cart', () => {
    renderWithProvider()
    
    act(() => {
      screen.getByTestId('add-vanilla').click()
    })
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('2500')
    
    const cartItems = JSON.parse(screen.getByTestId('cart-items').textContent)
    expect(cartItems).toHaveLength(1)
    expect(cartItems[0]).toMatchObject({
      id: 1,
      title: 'Vanilla Candle',
      price: 2500,
      quantity: 1
    })
  })

  it('increases quantity when adding existing item', () => {
    renderWithProvider()
    
    act(() => {
      screen.getByTestId('add-vanilla').click()
      screen.getByTestId('add-vanilla').click()
    })
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('5000')
    
    const cartItems = JSON.parse(screen.getByTestId('cart-items').textContent)
    expect(cartItems).toHaveLength(1)
    expect(cartItems[0].quantity).toBe(2)
  })

  it('adds item with custom quantity', () => {
    renderWithProvider()
    
    act(() => {
      screen.getByTestId('add-lavender-2').click()
    })
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('6000')
    
    const cartItems = JSON.parse(screen.getByTestId('cart-items').textContent)
    expect(cartItems[0].quantity).toBe(2)
  })

  it('removes item from cart', () => {
    renderWithProvider()
    
    act(() => {
      screen.getByTestId('add-vanilla').click()
      screen.getByTestId('add-lavender-2').click()
    })
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('3')
    
    act(() => {
      screen.getByTestId('remove-vanilla').click()
    })
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('6000')
    
    const cartItems = JSON.parse(screen.getByTestId('cart-items').textContent)
    expect(cartItems).toHaveLength(1)
    expect(cartItems[0].id).toBe(2)
  })

  it('updates item quantity', () => {
    renderWithProvider()
    
    act(() => {
      screen.getByTestId('add-vanilla').click()
    })
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1')
    
    act(() => {
      screen.getByTestId('update-vanilla-3').click()
    })
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('3')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('7500')
  })

  it('removes item when quantity updated to 0', () => {
    renderWithProvider()
    
    act(() => {
      screen.getByTestId('add-vanilla').click()
    })
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1')
    
    act(() => {
      screen.getByTestId('update-vanilla-0').click()
    })
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-items')).toHaveTextContent('[]')
  })

  it('removes item when quantity updated to negative', () => {
    renderWithProvider()
    
    act(() => {
      screen.getByTestId('add-vanilla').click()
    })
    
    act(() => {
      screen.getByTestId('update-vanilla-0').click()
    })
    
    expect(screen.getByTestId('cart-items')).toHaveTextContent('[]')
  })

  it('calculates total correctly with multiple items', () => {
    renderWithProvider()
    
    act(() => {
      screen.getByTestId('add-vanilla').click()
      screen.getByTestId('add-lavender-2').click()
    })
    
    expect(screen.getByTestId('cart-total')).toHaveTextContent('8500')
  })

  it('calculates count correctly with multiple items', () => {
    renderWithProvider()
    
    act(() => {
      screen.getByTestId('add-vanilla').click()
      screen.getByTestId('add-lavender-2').click()
    })
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('3')
  })

  it('handles non-existent item removal gracefully', () => {
    renderWithProvider()
    
    act(() => {
      screen.getByTestId('remove-vanilla').click()
    })
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-items')).toHaveTextContent('[]')
  })

  it('handles non-existent item quantity update gracefully', () => {
    renderWithProvider()
    
    act(() => {
      screen.getByTestId('update-vanilla-3').click()
    })
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-items')).toHaveTextContent('[]')
  })
})