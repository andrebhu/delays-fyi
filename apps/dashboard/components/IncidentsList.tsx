'use client';

import { Alert } from '@/types/alert';
import { useState } from 'react';
import { formatDescriptionWithLines } from '../lib/format';

interface IncidentsListProps {
  alerts: Alert[];
  categories: string[];
}

export default function IncidentsList({ alerts, categories }: IncidentsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredAlerts = alerts.filter(alert => {
    if (selectedCategory === 'All') return true;
    const lowerDesc = alert.description.toLowerCase();
    switch (selectedCategory) {
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

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Incident Details</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredAlerts.map((alert) => (
            <div key={alert.alert_id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-900 flex flex-wrap items-center gap-1">
                    {formatDescriptionWithLines(alert.description)}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span>Last seen: {new Date(alert.last_seen_time).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredAlerts.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No incidents found for this category
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 