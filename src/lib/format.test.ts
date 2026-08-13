import { describe, expect, it } from 'vitest'
import { formatRupiah } from './format'

describe('formatRupiah', () => {
  it('formats a number as IDR currency', () => {
    const result = formatRupiah(1500000)
    expect(result).toContain('1.500.000')
    expect(result).toMatch(/^Rp/)
  })

  it('handles negative numbers', () => {
    expect(formatRupiah(-50000)).toContain('50.000')
  })
})
