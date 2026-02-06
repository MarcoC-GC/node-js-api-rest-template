import { describe, it, expect } from 'vitest'

// Función de ejemplo para testear
function sum(a: number, b: number): number {
  return a + b
}

describe('Example Test Suite', () => {
  it('should add two numbers correctly', () => {
    expect(sum(2, 3)).toBe(5)
    expect(sum(-1, 1)).toBe(0)
    expect(sum(0, 0)).toBe(0)
  })

  it('should handle negative numbers', () => {
    expect(sum(-5, -3)).toBe(-8)
    expect(sum(-10, 5)).toBe(-5)
  })
})
