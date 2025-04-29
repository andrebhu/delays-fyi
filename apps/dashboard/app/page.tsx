import { supabase } from '../lib/supabase'
import AlertCard from '../components/AlertCard'
import { Alert } from '../types/alert'

async function getAlerts() {
  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .order('last_seen_time', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching alerts:', error)
    return []
  }

  return alerts as Alert[]
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
  
  // Past incidents are the 5 most recent alerts that are no longer active
  const pastAlerts = alerts
    .filter(alert => {
      const lastSeen = new Date(alert.last_seen_time + 'Z')
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
      return lastSeen <= tenMinutesAgo
    })
    // .slice(0, 5)

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">MTA Delay Tracker</h1>
        
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
            pastAlerts.map(alert => (
              <AlertCard key={alert.alert_id} alert={alert} />
            ))
          ) : (
            <p className="text-gray-600">No past incidents to display.</p>
          )}
        </section>
      </div>
    </main>
  )
}
