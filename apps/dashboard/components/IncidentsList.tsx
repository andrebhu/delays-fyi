'use client';

import { Alert } from '@/types/alert';
import { useState, useRef, useEffect } from 'react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Sort categories by count in descending order
  const sortedCategories = [...categories].sort((a, b) => getCategoryCount(b) - getCategoryCount(a));

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
          <h2 className="text-2xl font-semibold">Past Incidents</h2>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm flex items-center gap-2"
          >
            Causes
            <svg
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="py-2">
                {sortedCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleFilter(category)}
                    className={`w-full px-4 py-2 text-left text-sm flex justify-between items-center ${
                      selectedFilters.has(category)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{category}</span>
                    <span className="text-gray-500">({getCategoryCount(category)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {selectedFilters.size > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from(selectedFilters).map((category) => (
                <div
                  key={category}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full shadow-sm"
                >
                  {category}
                  <button
                    onClick={() => toggleFilter(category)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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
                    <span>Last seen: {formatEasternTime(alert.last_seen_time + 'Z')}</span>
                    <span>Started: {formatEasternTime(alert.start_time + 'Z')}</span>
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