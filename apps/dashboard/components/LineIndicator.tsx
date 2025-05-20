interface LineIndicatorProps {
  line: string
  size?: 'sm' | 'md' | 'lg'
}

const LINE_COLORS: Record<string, string> = {
  '1': '#EE352E', // Red
  '2': '#EE352E', // Red
  '3': '#EE352E', // Red
  '4': '#00933C', // Green
  '5': '#00933C', // Green
  '6': '#00933C', // Green
  '6X': '#00933C', // Green
  '7': '#B933AD', // Purple
  '7X': '#B933AD', // Purple
  'A': '#0039A6', // Blue
  'B': '#FF6319', // Orange
  'C': '#0039A6', // Blue
  'D': '#FF6319', // Orange
  'E': '#0039A6', // Blue
  'F': '#FF6319', // Orange
  'G': '#6CBE45', // Light Green
  'H': '#0039A6', // Blue
  'J': '#996633', // Brown
  'L': '#A7A9AC', // Grey
  'M': '#FF6319', // Orange
  'N': '#FCCC0A', // Yellow
  'Q': '#FCCC0A', // Yellow
  'R': '#FCCC0A', // Yellow
  'S': '#808183', // Dark Grey
  'T': '#40E0D0', // Turqoise
  'W': '#FCCC0A', // Yellow
  'Z': '#996633', // Brown
}

const SIZE_CLASSES = {
  sm: 'w-6 h-6 text-sm',
  md: 'w-8 h-8 text-base',
  lg: 'w-12 h-12 text-lg',
}

export default function LineIndicator({ line, size = 'md' }: LineIndicatorProps) {
  const lineColor = LINE_COLORS[line] || '#808183' // Default to grey if line not found
  const sizeClass = SIZE_CLASSES[size]

  return (
    <span 
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white`}
      style={{ backgroundColor: lineColor }}
    >
      {line}
    </span>
  )
} 