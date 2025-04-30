import { supabase } from '../lib/supabase'
import AlertCard from '../components/AlertCard'
import CollapsibleDaySection from '../components/CollapsibleDaySection'
import { Alert } from '../types/alert'

async function getAlerts() {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .gte('last_seen_time', oneWeekAgo.toISOString())
    .order('last_seen_time', { ascending: false })

  if (error) {
    console.error('Error fetching alerts:', error)
    return []
  }

  return alerts as Alert[]
}

function groupAlertsByDay(alerts: Alert[]) {
  const grouped = new Map<string, Alert[]>()
  
  alerts.forEach(alert => {
    const date = new Date(alert.last_seen_time)
    const dayKey = date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    
    if (!grouped.has(dayKey)) {
      grouped.set(dayKey, [])
    }
    grouped.get(dayKey)!.push(alert)
  })
  
  return grouped
}

export default async function Home() {
  const alerts = await getAlerts()
  const now = new Date()
  
  // Active delays are those seen in the last 10 minutes
  const activeAlerts = alerts
    .filter(alert => {
      const lastSeen = new Date(alert.last_seen_time + 'Z')
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
      return lastSeen > tenMinutesAgo
    })
    .sort((a, b) => new Date(b.last_seen_time).getTime() - new Date(a.last_seen_time).getTime())
  
  // Past incidents are alerts that are no longer active
  const pastAlerts = alerts
    .filter(alert => {
      const lastSeen = new Date(alert.last_seen_time + 'Z')
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
      return lastSeen <= tenMinutesAgo
    })
  
  const groupedPastAlerts = groupAlertsByDay(pastAlerts)

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="bg-gray-800 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white pl-4">MTA Delay Tracker</h1>
        </div>
      </div>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Active Delays</h2>
            {activeAlerts.length > 0 ? (
              activeAlerts.map(alert => (
                <AlertCard key={alert.alert_id} alert={alert} />
              ))
            ) : (
              <p className="text-gray-600">No active delays at this time.</p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Past Incidents</h2>
            {pastAlerts.length > 0 ? (
              Array.from(groupedPastAlerts.entries()).map(([day, dayAlerts]) => (
                <CollapsibleDaySection key={day} day={day} alerts={dayAlerts} />
              ))
            ) : (
              <p className="text-gray-600">No past incidents to display.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
