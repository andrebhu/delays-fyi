type Alert = {
    alert_id: string
    routes: string[]
    start_time: string
    last_seen_time: string
    description: string
  }
  
  export function deduplicateByRoutes(alerts: Alert[]): Alert[] {
    const grouped: Record<string, Alert> = {}
  
    for (const alert of alerts) {
      const key = alert.routes.sort().join(',')
  
      if (!grouped[key]) {
        grouped[key] = alert
      } else {
        const existing = grouped[key]
        if (new Date(alert.last_seen_time) > new Date(existing.last_seen_time)) {
          grouped[key] = alert
        }
      }
    }
  
    return Object.values(grouped)
  }
  