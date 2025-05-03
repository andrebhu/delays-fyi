'use client'

import { useState } from 'react'
import AlertCard from './AlertCard'
import { Alert } from '../types/alert'

interface CollapsibleDaySectionProps {
  day: string
  alerts: Alert[]
}

export default function CollapsibleDaySection({ day, alerts }: CollapsibleDaySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2 hover:text-gray-900"
      >
        <span>{day}</span>
        <span className="text-sm text-gray-500">
          ({alerts.length})
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <hr className="mb-4 border-gray-200" />
      {isExpanded && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {alerts.map(alert => (
              <AlertCard key={alert.alert_id} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 