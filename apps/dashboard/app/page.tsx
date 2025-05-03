import { supabase } from '../lib/supabase'
import AlertCard from '../components/AlertCard'
import CollapsibleDaySection from '../components/CollapsibleDaySection'
import { Alert } from '../types/alert'

async function getAlerts() {
  const fourDaysAgo = new Date()
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)

  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .gte('last_seen_time', fourDaysAgo.toISOString())
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
    const date = new Date(alert.last_seen_time + 'Z')
    const dayKey = date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
      month: 'long',
      day: 'numeric'
    })
    
    if (!grouped.has(dayKey)) {
      grouped.set(dayKey, [])
    }
    grouped.get(dayKey)!.push(alert)
  })
  
  // Remove the oldest day
  const sortedDays = Array.from(grouped.keys()).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )
  if (sortedDays.length > 0) {
    grouped.delete(sortedDays[sortedDays.length - 1])
  }
  
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
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Active Delays</h2>
            {activeAlerts.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {activeAlerts.map(alert => (
                    <AlertCard key={alert.alert_id} alert={alert} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No delays at this time. 🎉</p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Past Alerts</h2>
          
            {pastAlerts.length > 0 ? (
              Array.from(groupedPastAlerts.entries()).map(([day, dayAlerts]) => (
                <CollapsibleDaySection key={day} day={day} alerts={dayAlerts} />
              ))
            ) : (
              <p className="text-gray-600">No past alerts to display. 🎉</p>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export const revalidate = 300; // Revalidate every 5 minutes
