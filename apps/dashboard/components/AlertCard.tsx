import { Alert } from '../types/alert'
import LineIndicator from './LineIndicator'

interface AlertCardProps {
  alert: Alert
}

function formatEasternTime(dateString: string): string {
  // Create date from UTC string and subtract 4 hours
  const date = new Date(dateString)
  date.setHours(date.getHours() - 4)
  
  return date.toLocaleString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
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
          <p className="text-gray-600">{alert.description}</p>
        </div>
        <div className="text-sm text-gray-500 text-right">
          <p className="whitespace-nowrap">Started: {formatEasternTime(alert.start_time)}</p>
          <p className="whitespace-nowrap">Last Seen: {formatEasternTime(alert.last_seen_time)}</p>
        </div>
      </div>
    </div>
  )
} 