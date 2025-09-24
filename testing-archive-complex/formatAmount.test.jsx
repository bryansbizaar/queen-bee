import { describe, it, expect } from 'vitest'
import formatAmount from './formatAmount'

describe('formatAmount', () => {
  it('formats basic amounts correctly', () => {
    expect(formatAmount(1000)).toBe('$10.00')
    expect(formatAmount(2500)).toBe('$25.00')
    expect(formatAmount(100)).toBe('$1.00')
  })

  it('handles zero amount', () => {
    expect(formatAmount(0)).toBe('$0.00')
  })

  it('handles small amounts (less than 1 dollar)', () => {
    expect(formatAmount(50)).toBe('$0.50')
    expect(formatAmount(99)).toBe('$0.99')
    expect(formatAmount(1)).toBe('$0.01')
  })

  it('handles large amounts', () => {
    expect(formatAmount(100000)).toBe('$1,000.00')
    expect(formatAmount(1000000)).toBe('$10,000.00')
  })

  it('handles decimal precision correctly', () => {
    expect(formatAmount(1099)).toBe('$10.99')
    expect(formatAmount(2001)).toBe('$20.01')
    expect(formatAmount(1234)).toBe('$12.34')
  })

  it('handles negative amounts', () => {
    expect(formatAmount(-1000)).toBe('-$10.00')
    expect(formatAmount(-250)).toBe('-$2.50')
  })

  it('handles edge cases', () => {
    expect(formatAmount(null)).toBe('$0.00')
    expect(formatAmount(undefined)).toBe('$NaN')
    expect(formatAmount('')).toBe('$0.00')
    expect(formatAmount('1000')).toBe('$10.00')
  })

  it('formats to NZD currency with correct symbol', () => {
    const result = formatAmount(1000)
    expect(result).toMatch(/^\$\d+\.\d{2}$/)
  })
})