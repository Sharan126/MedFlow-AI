"""
Fetch Real Data from Supabase using Python
Queries the 4 tables ('hospitals', 'medicines', 'inventory', 'trade_history')
using the official Supabase client and pandas.
"""

import os
import sys
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

# Ensure clean UTF-8 output
if sys.stdout and getattr(sys.stdout, "encoding", None) != 'utf-8':
    reconfig = getattr(sys.stdout, "reconfigure", None)
    if callable(reconfig):
        try:
            reconfig(encoding='utf-8')
        except Exception:
            pass

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "").strip() or os.getenv("SUPABASE_KEY", "").strip()

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_table(table_name: str, display_name: str, select_cols: str = "*", limit: int = 20):
    print("\n" + "-" * 60)
    print(f"[*] FETCHING FROM SUPABASE TABLE: '{table_name}' ({display_name})")
    print("-" * 60)
    try:
        response = supabase.table(table_name).select(select_cols).limit(limit).execute()
        data = response.data
        if not data:
            print(f"[!] Table '{table_name}' is currently empty (0 records).")
            return None
        
        df = pd.DataFrame(data)
        print(f"[+] Retrieved {len(df)} rows from Supabase:")
        print(df.to_string(index=False))
        return df
    except Exception as e:
        print(f"[!] Error querying '{table_name}': {e}")
        return None

def main():
    print("=" * 60)
    print("[*] MedFlow-AI: Live Supabase Data Fetcher")
    print(f"[*] Supabase URL: {SUPABASE_URL}")
    print("=" * 60)

    # 1. Hospitals
    fetch_table("hospitals", "Dakshina Kannada Healthcare Facilities")

    # 2. Medicines
    fetch_table("medicines", "Essential Healthcare Drug Registry")

    # 3. Inventory
    fetch_table("inventory", "Hospital Stock Reserves & Safety Buffers")

    # 4. Trade History
    fetch_table("trade_history", "Verified Emergency Dispatch Audit Trail")

    print("\n" + "=" * 60)
    print("[+] Fetch operation completed.")
    print("=" * 60)

if __name__ == "__main__":
    main()
