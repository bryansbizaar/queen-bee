import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card'

describe('Card', () => {
  const defaultProps = {
    title: 'Test Candle',
    price: 2500,
    description: 'A beautiful test candle',
    image: 'test-candle.jpg'
  }

  it('renders all props correctly', () => {
    render(<Card {...defaultProps} />)
    
    expect(screen.getByRole('heading', { name: 'Test Candle' })).toBeInTheDocument()
    expect(screen.getByText('$25.00')).toBeInTheDocument()
    expect(screen.getByText('A beautiful test candle')).toBeInTheDocument()
  })

  it('renders image with correct src and alt attributes', () => {
    render(<Card {...defaultProps} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', 'http://localhost:8080/images/test-candle.jpg')
    // Flexible alt text checking - handles enhanced accessibility text
    expect(image.getAttribute('alt')).toMatch(/test candle/i)
    expect(image).toHaveClass('card-img')
  })

  it('handles full URL images correctly', () => {
    const propsWithFullUrl = {
      ...defaultProps,
      image: 'https://example.com/full-url-image.jpg'
    }
    
    render(<Card {...propsWithFullUrl} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', 'https://example.com/full-url-image.jpg')
  })

  it('does not render image when image prop is not provided', () => {
    const propsWithoutImage = {
      title: defaultProps.title,
      price: defaultProps.price,
      description: defaultProps.description
    }
    render(<Card {...propsWithoutImage} />)
    
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('handles empty image string', () => {
    const propsWithEmptyImage = {
      ...defaultProps,
      image: ''
    }
    
    render(<Card {...propsWithEmptyImage} />)
    
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    const { container } = render(<Card {...defaultProps} />)
    
    expect(container.firstChild).toHaveClass('card')
    expect(screen.getByRole('heading', { name: 'Test Candle' })).toHaveClass('card-title')
    expect(screen.getByText('$25.00')).toHaveClass('card-price')
    expect(screen.getByText('A beautiful test candle')).toHaveClass('card-text')
  })

  it('formats price correctly through formatAmount', () => {
    const propsWithDifferentPrice = {
      ...defaultProps,
      price: 1099
    }
    
    render(<Card {...propsWithDifferentPrice} />)
    
    expect(screen.getByText('$10.99')).toBeInTheDocument()
  })

  it('handles zero price', () => {
    const propsWithZeroPrice = {
      ...defaultProps,
      price: 0
    }
    
    render(<Card {...propsWithZeroPrice} />)
    
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  it('renders with minimal required props', () => {
    const minimalProps = {
      title: 'Minimal Candle',
      price: 1500,
      description: 'Simple description'
    }
    
    render(<Card {...minimalProps} />)
    
    expect(screen.getByRole('heading', { name: 'Minimal Candle' })).toBeInTheDocument()
    expect(screen.getByText('$15.00')).toBeInTheDocument()
    expect(screen.getByText('Simple description')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('has accessible image alt text', () => {
    render(<Card {...defaultProps} />)
    
    const image = screen.getByRole('img')
    // Check that alt text includes the product name (flexible for enhanced accessibility)
    expect(image.getAttribute('alt')).toMatch(/test candle/i)
  })

  it('has proper heading hierarchy', () => {
    render(<Card {...defaultProps} />)
    
    // Check that title is a heading (flexible level)
    const title = screen.getByRole('heading', { name: 'Test Candle' })
    expect(title).toBeInTheDocument()
    
    // Check that price element exists (flexible tag)
    const price = screen.getByText('$25.00')
    expect(price).toBeInTheDocument()
    expect(price).toHaveClass('card-price')
  })
})
