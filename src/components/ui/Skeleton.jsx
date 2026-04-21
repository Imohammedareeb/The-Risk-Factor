export default function Skeleton({ className = '', style }) {
  return (
    <div
      className={['skeleton animate-pulse', className].join(' ')}
      style={style}
    />
  )
}
