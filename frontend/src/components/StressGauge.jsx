const COLORS = {
  Low: '#6FA287',
  Moderate: '#D9A441',
  High: '#D97A45',
  Critical: '#C1502E',
}

// A hand-set arc dial (270°) that reads like an old ledger gauge.
// score: 0-100, level: Low | Moderate | High | Critical
export default function StressGauge({ score, level, size = 96 }) {
  const color = COLORS[level] || '#9DAFA6'
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const arcFraction = 0.75 // 270 degrees of the circle is the visible track
  const trackLength = circumference * arcFraction
  const filled = (score / 100) * trackLength

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ transform: 'rotate(135deg)' }}
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(157,175,166,0.15)"
          strokeWidth="6"
          strokeDasharray={`${trackLength} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: size * 0.24, fontWeight: 500, color }}>
          {score}
        </span>
      </div>
    </div>
  )
}
