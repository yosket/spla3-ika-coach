
import json
import sys

# Pythonパスを明示的に追加
sys.path.insert(0, '/opt/homebrew/lib/python3.13/site-packages')

try:
    from splatnet3_scraper.query import QueryHandler
except ImportError as e:
    print(f"ERROR: splatnet3_scraper not installed. Import error: {e}")
    print("Available paths:")
    for path in sys.path:
        print(f"  {path}")
    sys.exit(1)

session_token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwYzg1YTI2ZWVkMmYyMjdmIiwiYXVkIjoiNzFiOTYzYzFiN2I2ZDExOSIsInN0OnNjcCI6WzAsOCw5LDE3LDIzXSwianRpIjoxNzc4MTg0MDg3MSwiaWF0IjoxNzUwNTAzODkxLCJ0eXAiOiJzZXNzaW9uX3Rva2VuIiwiZXhwIjoxODEzNTc1ODkxLCJpc3MiOiJodHRwczovL2FjY291bnRzLm5pbnRlbmRvLmNvbSJ9.5gosrgZGgHjhvdlPlgacRxLH9Y2smtxyHyyMi9i_GW4"

try:
    print("Creating QueryHandler with session token...")
    handler = QueryHandler.from_session_token(session_token)
    print("QueryHandler created successfully!")
    
    print("Fetching battle history data...")
    response = handler.query("BattleHistoryQuery")
    print("Battle history query successful!")
    
    # レスポンスデータを取得
    battle_data = response.data
    print(f"Fetched battle data: {type(battle_data)}")
    
    # バトルデータをJSONファイルに保存
    output_file = "battles_splatnet3_scraper.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(battle_data, f, ensure_ascii=False, indent=2)
    
    print(f"Battle data saved to {output_file}")
    
except Exception as e:
    print(f"ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
