import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider } from './CartContext'
import useCart from './useCart'

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

describe('useCart', () => {
  const mockProduct = {
    id: 1,
    title: 'Test Candle',
    price: 2500,
    description: 'A test candle'
  }

  it('returns cart context values', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    expect(result.current).toHaveProperty('cartItems')
    expect(result.current).toHaveProperty('addToCart')
    expect(result.current).toHaveProperty('removeFromCart')
    expect(result.current).toHaveProperty('updateQuantity')
    expect(result.current).toHaveProperty('getCartTotal')
    expect(result.current).toHaveProperty('getCartCount')
  })

  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    expect(result.current.cartItems).toEqual([])
    expect(result.current.getCartCount()).toBe(0)
    expect(result.current.getCartTotal()).toBe(0)
  })

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart(mockProduct)
    })
    
    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0]).toMatchObject({
      ...mockProduct,
      quantity: 1
    })
    expect(result.current.getCartCount()).toBe(1)
    expect(result.current.getCartTotal()).toBe(2500)
  })

  it('adds item with custom quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart(mockProduct, 3)
    })
    
    expect(result.current.cartItems[0].quantity).toBe(3)
    expect(result.current.getCartCount()).toBe(3)
    expect(result.current.getCartTotal()).toBe(7500)
  })

  it('increases quantity when adding existing item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart(mockProduct, 2)
    })
    
    act(() => {
      result.current.addToCart(mockProduct, 1)
    })
    
    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].quantity).toBe(3)
    expect(result.current.getCartCount()).toBe(3)
  })

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart(mockProduct)
    })
    
    act(() => {
      result.current.removeFromCart(1)
    })
    
    expect(result.current.cartItems).toHaveLength(0)
    expect(result.current.getCartCount()).toBe(0)
    expect(result.current.getCartTotal()).toBe(0)
  })

  it('updates item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart(mockProduct)
    })
    
    act(() => {
      result.current.updateQuantity(1, 5)
    })
    
    expect(result.current.cartItems[0].quantity).toBe(5)
    expect(result.current.getCartCount()).toBe(5)
    expect(result.current.getCartTotal()).toBe(12500)
  })

  it('removes item when quantity updated to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart(mockProduct)
    })
    
    act(() => {
      result.current.updateQuantity(1, 0)
    })
    
    expect(result.current.cartItems).toHaveLength(0)
  })

  it('removes item when quantity updated to negative', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart(mockProduct)
    })
    
    act(() => {
      result.current.updateQuantity(1, -1)
    })
    
    expect(result.current.cartItems).toHaveLength(0)
  })

  it('handles multiple different products', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    const product2 = {
      id: 2,
      title: 'Another Candle',
      price: 3000,
      description: 'Another test candle'
    }
    
    act(() => {
      result.current.addToCart(mockProduct, 2)
      result.current.addToCart(product2, 1)
    })
    
    expect(result.current.cartItems).toHaveLength(2)
    expect(result.current.getCartCount()).toBe(3)
    expect(result.current.getCartTotal()).toBe(8000)
  })

  it('calculates totals correctly with multiple items', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    const products = [
      { id: 1, price: 1000 },
      { id: 2, price: 2000 },
      { id: 3, price: 1500 }
    ]
    
    act(() => {
      result.current.addToCart(products[0], 2)
      result.current.addToCart(products[1], 1)
      result.current.addToCart(products[2], 3)
    })
    
    expect(result.current.getCartCount()).toBe(6)
    expect(result.current.getCartTotal()).toBe(8500)
  })

  it('returns undefined when used outside CartProvider', () => {
    const { result } = renderHook(() => useCart())
    expect(result.current).toBeUndefined()
  })
})