'use client';

import { Alert } from '@/types/alert';
import { useState } from 'react';
import { formatDescriptionWithLines } from '../lib/format';

interface IncidentsListProps {
  alerts: Alert[];
  categories: string[];
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
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  })
  
  return `${dateStr} ${timeStr}`
}

export default function IncidentsList({ alerts, categories }: IncidentsListProps) {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());

  const getCategoryCount = (category: string) => {
    return alerts.filter(alert => {
      const lowerDesc = alert.description.toLowerCase();
      switch (category) {
        case 'NYPD':
          return lowerDesc.includes('nypd');
        case 'EMS':
          return lowerDesc.includes('ems');
        case 'FDNY':
          return lowerDesc.includes('fdny');
        case 'Brakes':
          return lowerDesc.includes('brake');
        case 'Door':
          return lowerDesc.includes('door');
        case 'Signal':
          return lowerDesc.includes('signal');
        case 'Track':
          return lowerDesc.includes('track');
        case 'Cleaning':
          return lowerDesc.includes('clean');
        case 'Switch':
          return lowerDesc.includes('switch');
        case 'Disruptive':
          return lowerDesc.includes('disruptive');
        case 'Mechanical':
          return lowerDesc.includes('mechanical');
        case 'Other':
          return !lowerDesc.includes('nypd') && 
                 !lowerDesc.includes('ems') && 
                 !lowerDesc.includes('fdny') && 
                 !lowerDesc.includes('brake') && 
                 !lowerDesc.includes('door') &&
                 !lowerDesc.includes('signal') &&
                 !lowerDesc.includes('track') &&
                 !lowerDesc.includes('clean') &&
                 !lowerDesc.includes('switch') &&
                 !lowerDesc.includes('disruptive') &&
                 !lowerDesc.includes('mechanical');
        default:
          return true;
      }
    }).length;
  };

  const toggleFilter = (category: string) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(category)) {
      newFilters.delete(category);
    } else {
      newFilters.add(category);
    }
    setSelectedFilters(newFilters);
  };

  const filteredAlerts = alerts
    .filter(alert => {
      if (selectedFilters.size === 0) return true;
      const lowerDesc = alert.description.toLowerCase();
      return Array.from(selectedFilters).some(category => {
        switch (category) {
          case 'NYPD':
            return lowerDesc.includes('nypd');
          case 'EMS':
            return lowerDesc.includes('ems');
          case 'FDNY':
            return lowerDesc.includes('fdny');
          case 'Brakes':
            return lowerDesc.includes('brake');
          case 'Door':
            return lowerDesc.includes('door');
          case 'Signal':
            return lowerDesc.includes('signal');
          case 'Track':
            return lowerDesc.includes('track');
          case 'Cleaning':
            return lowerDesc.includes('clean');
          case 'Switch':
            return lowerDesc.includes('switch');
          case 'Disruptive':
            return lowerDesc.includes('disruptive');
          case 'Mechanical':
            return lowerDesc.includes('mechanical');
          case 'Other':
            return !lowerDesc.includes('nypd') && 
                   !lowerDesc.includes('ems') && 
                   !lowerDesc.includes('fdny') && 
                   !lowerDesc.includes('brake') && 
                   !lowerDesc.includes('door') &&
                   !lowerDesc.includes('signal') &&
                   !lowerDesc.includes('track') &&
                   !lowerDesc.includes('clean') &&
                   !lowerDesc.includes('switch') &&
                   !lowerDesc.includes('disruptive') &&
                   !lowerDesc.includes('mechanical');
          default:
            return true;
        }
      });
    })
    .sort((a, b) => new Date(b.last_seen_time).getTime() - new Date(a.last_seen_time).getTime());

  return (
    <div className="mt-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Incident Details</h2>
          <div className="text-sm text-gray-500">
            Total Incidents: {alerts.length}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => toggleFilter(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                selectedFilters.has(category)
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
              }`}
            >
              {category} ({getCategoryCount(category)})
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredAlerts.map((alert) => (
            <div key={alert.alert_id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-900 flex flex-wrap items-center gap-1">
                    {formatDescriptionWithLines(alert.description)}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500 gap-4">
                    <span>Last seen: {formatEasternTime(alert.last_seen_time)}</span>
                    <span>Started: {formatEasternTime(alert.start_time)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredAlerts.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No incidents found 👀
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 