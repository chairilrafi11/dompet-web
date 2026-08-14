export default function RupiahInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
}: {
  value: string
  onChange: (raw: string) => void
  placeholder?: string
  className?: string
}) {
  const display = value === '' ? '' : Number(value).toLocaleString('id-ID')
  return (
    <input
      inputMode="numeric"
      type="text"
      value={display}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      className={className}
    />
  )
}
