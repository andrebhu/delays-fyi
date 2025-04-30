import { Alert } from '../types/alert'
import LineIndicator from './LineIndicator'

interface AlertCardProps {
  alert: Alert
}

function formatEasternTime(dateString: string): string {
  const date = new Date(dateString)
  
  // Ensure the date is treated as UTC
  const utcDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  ))
  
  return utcDate.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatDescription(description: string): React.ReactNode {
  // Replace [X] with LineIndicator components
  const parts = description.split(/(\[[A-Z0-9]+\])/g)
  
  return parts.map((part, index) => {
    if (part.match(/\[[A-Z0-9]+\]/)) {
      // Extract the route from [X]
      const route = part.slice(1, -1)
      return (
        <span key={index} className="inline-flex items-center">
          <LineIndicator line={route} size="sm" />
        </span>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export default function AlertCard({ alert }: AlertCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="flex gap-2 items-center">
          {alert.routes.map(route => (
            <LineIndicator key={route} line={route} />
          ))}
        </div>
        <div className="flex-1">
          <div className="text-gray-600">{formatDescription(alert.description)}</div>
        </div>
        <div className="text-sm text-gray-500 min-w-[240px] text-right font-mono">
          <p className="whitespace-nowrap">Last Seen: {formatEasternTime(alert.last_seen_time)}</p>
          <p className="whitespace-nowrap">Started: {formatEasternTime(alert.start_time)}</p>
        </div>
      </div>
    </div>
  )
} 