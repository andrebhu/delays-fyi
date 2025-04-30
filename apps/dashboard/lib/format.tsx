import React, { ReactNode } from 'react';
import LineIndicator from '../components/LineIndicator';

export function formatDescriptionWithLines(description: string, size: 'sm' | 'md' | 'lg' = 'sm'): ReactNode {
  // Match line numbers in brackets like [1], [A], etc.
  const parts = description.split(/(\[[A-Z0-9]+\])/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      const lineNumber = part.slice(1, -1);
      return (
        <span key={index} className="inline-flex items-center">
          <LineIndicator line={lineNumber} size={size} />
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
} 