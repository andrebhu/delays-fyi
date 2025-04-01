// /app/api/test-connection/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { deduplicateByRoutes } from '@/lib/data/deduplicateAlerts'


export async function GET() {
  const supabase = await createClient()
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('alerts')
    .select('alert_id, routes, start_time, last_seen_time, description')
    .gte('last_seen_time', fifteenMinutesAgo)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const deduped = deduplicateByRoutes(data || [])

  return NextResponse.json({ data: deduped })
}
