import asyncio
import json
import random
import httpx

async def simulate_telemetry():
    uri = "ws://localhost:8000/ws/telemetry"
    victim_counter = 100
    
    print("[SIMULATOR] Starting telemetry stream...")
    
    # Standard base coordinates
    base_lat, base_lng = 17.3850, 78.4867
    
    while True:
        try:
            import websockets
            async with websockets.connect(uri) as websocket:
                print("[SIMULATOR] Connected to WebSocket broker!")
                while True:
                    victim_counter += 1
                    data = {
                        "victim_id": f"VIC-{victim_counter}",
                        "lat": base_lat + random.uniform(-0.02, 0.02),
                        "lng": base_lng + random.uniform(-0.02, 0.02),
                        "age_group": random.choice(["child", "adult", "elderly"]),
                        "injury_severity": random.choice(["minor", "moderate", "critical"]),
                        "submerged": random.choice([True, False]),
                        "trapped": random.choice([True, False])
                    }
                    await websocket.send(json.dumps(data))
                    print(f"[SIMULATOR] Transmitted victim detection: {data['victim_id']}")
                    await asyncio.sleep(4)
        except Exception as e:
            print(f"[SIMULATOR] Waiting for backend server connection... ({e})")
            await asyncio.sleep(3)

if __name__ == "__main__":
    asyncio.run(simulate_telemetry())