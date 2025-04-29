import { Alert } from '../types/alert'

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
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Routes: {alert.routes.join(', ')}</h3>
          <p className="text-gray-600 mt-2">{alert.description}</p>
        </div>
        <div className="text-sm text-gray-500">
          <p>Started: {formatEasternTime(alert.start_time)}</p>
          <p>Last Seen: {formatEasternTime(alert.last_seen_time)}</p>
        </div>
      </div>
    </div>
  )
} 