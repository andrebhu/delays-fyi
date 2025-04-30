import { Alert } from '../types/alert'
import { formatDescriptionWithLines } from '../lib/format'

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
  
  const dateStr = utcDate.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  })
  
  const timeStr = utcDate.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  return `${dateStr} ${timeStr}`
}

export default function AlertCard({ alert }: AlertCardProps) {
  return (
    <div className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-900 flex flex-wrap items-center gap-1">
            {formatDescriptionWithLines(alert.description)}
          </p>
          <div className="mt-2 flex items-center text-sm text-gray-500 gap-4">
            <span>Last seen: {formatEasternTime(alert.last_seen_time + 'Z')}</span>
            <span>Started: {formatEasternTime(alert.start_time + 'Z')}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 