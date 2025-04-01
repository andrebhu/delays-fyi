import os
import logging
from datetime import datetime
from typing import Any, Dict, List

import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env vars
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)

ALERTS_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts.json"

def fetch_alert_data() -> Dict[str, Any]:
    response = requests.get(ALERTS_URL)
    if response.status_code != 200:
        logger.error(f"Failed to fetch alert data: {response.status_code} - {response.text}")
        raise RuntimeError("Unable to fetch alerts")
    return response.json()

def parse_alert(entity: Dict[str, Any], seen_time: datetime) -> Dict[str, Any]:
    alert = entity["alert"]

    alert_id = entity["id"]
    routes = [r["route_id"] for r in alert["informed_entity"] if "route_id" in r]
    start_time = datetime.fromtimestamp(alert["active_period"][0]["start"]).isoformat()
    last_seen_time = seen_time.strftime("%Y-%m-%dT%H:%M:%S")
    description = next(
        (t["text"] for t in alert["header_text"]["translation"] if t["language"] == "en"),
        ""
    )

    return {
        "alert_id": alert_id,
        "routes": routes,
        "start_time": start_time,
        "last_seen_time": last_seen_time,
        "description": description
    }

def store_alert(alert: Dict[str, Any]) -> None:
    response = supabase.table("alerts") \
        .upsert(alert, on_conflict="alert_id") \
        .execute()
    logger.info(f"Upserted alert {alert['alert_id']}: {response}")

def main():
    now = datetime.now()
    try:
        data = fetch_alert_data()
    except Exception as e:
        logger.exception("Failed to fetch or parse alert data.")
        return

    for entity in data.get("entity", []):
        try:
            if "lmm:alert" in entity["id"] and \
               entity["alert"]["transit_realtime.mercury_alert"]["alert_type"] == "Delays":
                alert = parse_alert(entity, now)
                store_alert(alert)
        except Exception as e:
            logger.exception(f"Error processing alert entity: {entity.get('id')}")

if __name__ == "__main__":
    main()
