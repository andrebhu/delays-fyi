#!/usr/bin/env python3
import os
import pickle
from supabase import create_client
from tensorflow.keras.models import load_model

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ['SUPABASE_URL']
SUPABASE_KEY = os.environ['SUPABASE_KEY']  # anon key (if no RLS) or service-role
MODEL_PATH           = 'subway_alert_classifier_model.keras'
VECTORIZER_PATH      = 'tfidf_vectorizer.pkl'
LABEL_ENCODER_PATH   = 'label_encoder.pkl'
TABLE_NAME           = 'alerts'

# ─── INIT CLIENTS & ARTIFACTS ──────────────────────────────────────────────────
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Loading model and preprocessing artifacts…")
model         = load_model(MODEL_PATH)
with open(VECTORIZER_PATH,   'rb') as f: vectorizer   = pickle.load(f)
with open(LABEL_ENCODER_PATH,'rb') as f: label_encoder = pickle.load(f)

# ─── HELPERS ───────────────────────────────────────────────────────────────────
def predict_cause(text: str) -> str:
    """Vectorize → model.predict → argmax → decode label."""
    X = vectorizer.transform([text])             # sparse matrix
    probs = model.predict(X.toarray())           # shape (1, n_classes)
    idx   = probs.argmax(axis=1)[0]
    return label_encoder.inverse_transform([idx])[0]

# ─── MAIN WORKFLOW ─────────────────────────────────────────────────────────────
def main():
    # 1) Fetch uncategorized alerts
    res = supabase.table(TABLE_NAME) \
        .select('alert_id, description') \
        .is_('cause', None) \
        .execute()
    rows = res.data
    if not rows:
        print("🎉 No uncategorized alerts found.")
        return

    # 2) Loop & classify
    for row in rows:
        alert_id   = row['alert_id']
        desc       = row['description']
        try:
            cause = predict_cause(desc)
            print(f"Alert {alert_id}: → {cause}")

            # 3) Push update
            upd = supabase.table(TABLE_NAME) \
                .update({'cause': cause}) \
                .eq('alert_id', alert_id) \
                .execute()

            print(f"  ✅ Updated alert {alert_id}")

        except Exception as e:
            print(f"  ⚠️ Error classifying {alert_id}: {e}")

if __name__ == '__main__':
    main()
