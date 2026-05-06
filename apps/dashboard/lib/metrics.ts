import type { Alert } from '@/types/alert';

export type RouteCount = {
  route: string;
  count: number;
};

export type DailyChartPoint = {
  date: string;
  count: number;
};

export type TimeOfDayChartPoint = {
  hour: number;
  avgWeekday: number;
  avgWeekend: number;
};

export type MetricsData = {
  timeSummary: string;
  hasResults: boolean;
  totalAlerts: number;
  routeCounts: RouteCount[];
  mostDelayedRoute: string | null;
  mostCommonCause: string | null;
  chartData: DailyChartPoint[];
  timeOfDayChartData: TimeOfDayChartPoint[];
};

type DailyCounts = {
  date: Date;
  dateKey: string;
  total: number;
};

type HourBucket = {
  weekday: { count: number; days: Set<string> };
  weekend: { count: number; days: Set<string> };
};

const METRICS_WINDOW_DAYS = 30;
const METRICS_TIME_SUMMARY = 'the last 30 days';

const CAUSE_LABELS: Record<string, string> = {
  police_medical_activity: 'Police/Medical Activity',
  signals: 'Signals',
  stations_structures: 'Stations & Structures',
  subway_cars: 'Subway Cars',
  tracks: 'Tracks',
  other: 'Other',
};

export function getMetricsStartDate(now: Date) {
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - METRICS_WINDOW_DAYS);
  return startDate;
}

function parseTimestamp(value: string) {
  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

function getNewYorkDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const partMap = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${partMap.year}-${partMap.month}-${partMap.day}`;
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  });
}

function formatCause(cause: string) {
  if (CAUSE_LABELS[cause]) {
    return CAUSE_LABELS[cause];
  }

  return cause
    .split('_')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getRouteCounts(alerts: Alert[]): RouteCount[] {
  const counts = new Map<string, number>();

  alerts.forEach(alert => {
    alert.routes.forEach(route => {
      counts.set(route, (counts.get(route) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count || a.route.localeCompare(b.route));
}

function getMostCommonCause(alerts: Alert[]) {
  const counts = new Map<string, number>();

  alerts.forEach(alert => {
    const cause = alert.cause?.trim();
    if (cause) {
      counts.set(cause, (counts.get(cause) ?? 0) + 1);
    }
  });

  const topCause = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];

  return topCause ? formatCause(topCause) : null;
}

function getDailyData(alerts: Alert[]) {
  const dailyMap = alerts.reduce(
    (acc, alert) => {
      const date = parseTimestamp(alert.last_seen_time);
      const dateKey = getNewYorkDateKey(date);

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date,
          dateKey,
          total: 0,
        };
      }

      const entry = acc[dateKey];
      entry.total += 1;

      return acc;
    },
    {} as Record<string, DailyCounts>
  );

  return Object.values(dailyMap).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}

function getDailyChartData(
  alerts: Alert[],
  startDate: Date,
  endDate: Date
) {
  const dailyData = getDailyData(alerts);
  const allDates: DailyChartPoint[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = getNewYorkDateKey(d);
    const dateLabel = formatDayLabel(d);
    allDates.push({
      date: dateLabel,
      count: dailyData.find(day => day.dateKey === dateKey)?.total || 0,
    });
  }

  return allDates;
}

function getTimeOfDayChartData(alerts: Alert[]) {
  const timeOfDayData = alerts.reduce((acc, alert) => {
    const date = parseTimestamp(alert.start_time);
    const hour = date.getUTCHours();
    const dateKey = date.toISOString().slice(0, 10);
    const isWeekend = [0, 6].includes(date.getUTCDay());

    if (!acc[hour]) {
      acc[hour] = {
        weekday: { count: 0, days: new Set<string>() },
        weekend: { count: 0, days: new Set<string>() },
      };
    }

    const bucket = isWeekend ? acc[hour].weekend : acc[hour].weekday;
    bucket.count += 1;
    bucket.days.add(dateKey);

    return acc;
  }, {} as Record<number, HourBucket>);

  return Object.entries(timeOfDayData)
    .map(([hourStr, { weekday, weekend }]) => {
      const hour = parseInt(hourStr, 10);
      return {
        hour,
        avgWeekday: weekday.days.size > 0 ? weekday.count / weekday.days.size : 0,
        avgWeekend: weekend.days.size > 0 ? weekend.count / weekend.days.size : 0,
      };
    })
    .sort((a, b) => a.hour - b.hour);
}

export function buildMetricsData(
  alerts: Alert[],
  now = new Date()
): MetricsData {
  const hasResults = alerts.length > 0;
  const startDate = getMetricsStartDate(now);
  const routeCounts = getRouteCounts(alerts);

  return {
    timeSummary: METRICS_TIME_SUMMARY,
    hasResults,
    totalAlerts: alerts.length,
    routeCounts,
    mostDelayedRoute: routeCounts[0]?.route ?? null,
    mostCommonCause: getMostCommonCause(alerts),
    chartData: getDailyChartData(alerts, startDate, now),
    timeOfDayChartData: getTimeOfDayChartData(alerts),
  };
}
