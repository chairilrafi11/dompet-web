import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import RupiahInput from './RupiahInput'

describe('RupiahInput', () => {
  it('formats digits and emits raw number', () => {
    const onChange = vi.fn()
    render(<RupiahInput value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1,000,000' } })
    expect(onChange).toHaveBeenCalledWith('1000000')
  })

  it('displays formatted value', () => {
    render(<RupiahInput value="1500000" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('1.500.000')
  })
})
