# test_reports.py
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_main.settings')
django.setup()

from core_db.reports import get_system_stats

# 1. Call the function
stats = get_system_stats()

# 2. PRINT THE RESULTS manually
print("\n--- FINAL SYSTEM REPORT ---")
print(f"Total Users:    {stats['total_users']}")
print(f"Total Bids:     {stats['total_bids']}")
print(f"Total Volume:   ${stats['total_money_in_play']}")
print("---------------------------\n")