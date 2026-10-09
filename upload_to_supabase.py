import os
from pathlib import Path
import pandas as pd

from supabase import create_client, Client
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
# Support SUPABASE_SERVICE_KEY as well as common aliases SUPABASE_KEY / SUPABASE_SERVICE_ROLE_KEY
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_KEY") 
    or os.getenv("SUPABASE_KEY") 
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

def get_supabase_client() -> Client:
    """Initialize and return the Supabase client, prompting if keys are missing from .env."""
    global SUPABASE_URL, SUPABASE_KEY

    if not SUPABASE_URL:
        SUPABASE_URL = input("Enter your SUPABASE_URL (e.g. https://xyz.supabase.co): ").strip()
    if not SUPABASE_KEY:
        SUPABASE_KEY = input("Enter your SUPABASE_SERVICE_KEY or anon key: ").strip()

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Both SUPABASE_URL and SUPABASE_KEY are required to connect to Supabase.")

    return create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_hospitals_from_csv(csv_file_path="dakshina_kannada_hospitals.csv"):
    """Reads hospital data from CSV and inserts/upserts it into Supabase."""
    file_path = Path(csv_file_path)
    if not file_path.exists():
        print(f"❌ Error: File '{csv_file_path}' not found.")
        return

    # Initialize client
    try:
        supabase: Client = get_supabase_client()
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
        return

    # 3. Read CSV into a pandas DataFrame
    df = pd.read_csv(file_path)

    # Clean empty cells (convert pandas NaN to Python None so it serializes cleanly to JSON null)
    df = df.where(pd.notnull(df), None)

    # Ensure latitude and longitude are numeric floats
    if "latitude" in df.columns:
        df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    if "longitude" in df.columns:
        df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")

    # 4. Convert DataFrame to a list of dictionaries (JSON records)
    records = df.to_dict(orient="records")

    # 5. Insert / Upsert into the 'hospitals' table
    try:
        # Using upsert on hfr_id prevents duplicate key errors on repeated runs
        response = supabase.table("hospitals").upsert(records, on_conflict="hfr_id").execute()
        count = len(response.data) if response.data else len(records)
        print(f"✅ Successfully inserted/upserted {count} hospitals into Supabase!")
        print(f"📋 First record inserted: {response.data[0] if response.data else records[0]}")
    except Exception as e:
        print(f"❌ An error occurred while uploading to Supabase: {e}")
        print("\n💡 Troubleshooting Tip:")
        print("1. Ensure the 'hospitals' table exists in Supabase. You can create it using the provided 'supabase_schema.sql'.")
        print("2. Ensure your SUPABASE_SERVICE_KEY has write permissions.")

if __name__ == "__main__":
    # Ensure your CSV file is named correctly and in the same directory
    upload_hospitals_from_csv("dakshina_kannada_hospitals.csv")
