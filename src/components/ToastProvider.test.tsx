import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import ToastProvider from './ToastProvider'
import { useToast } from './toast-context'

function Trigger() {
  const { toast } = useToast()
  return <button onClick={() => toast('Tersimpan', 'success')}>Pesan</button>
}

describe('ToastProvider', () => {
  it('shows message and auto-dismisses', () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Pesan' }))
    expect(screen.getByText('Tersimpan')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(3600)
    })
    expect(screen.queryByText('Tersimpan')).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})
