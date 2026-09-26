import sys
import io
import requests
import time

# Force UTF-8 stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

test_queries = [
    ("Kedarnath Trip", "Hi, I want to plan a 3-day trip to Kedarnath. What is the best route and altitude advice?"),
    ("Rishikesh Rafting", "Rishikesh me best river rafting and camping places kaunse hain?"),
    ("Chopta Homestays", "Suggest me verified homestays in Chopta or Tungnath with mountain view."),
    ("Munsiyari Weather", "Munsiyari ka live weather kaisa hai abhi? Kya barish ho rahi hai?"),
    ("Auli Budget", "Calculate budget for 2 persons for a 4-day trip to Auli with bike rental.")
]

print("=" * 65)
print("TESTING 5 DIFFERENT QUERIES ON DEVBOOMI AI BRIDGE (PORT 8765)")
print("=" * 65)

passed = 0
for idx, (label, q) in enumerate(test_queries, 1):
    try:
        t0 = time.time()
        r = requests.post("http://localhost:8765/api/chat", json={"message": q}, timeout=25)
        dt = round(time.time() - t0, 2)
        if r.status_code == 200:
            data = r.json()
            resp = data.get("response", {})
            msg = resp.get("message", "").strip().replace("\n", " ")
            msg_snippet = (msg[:150] + "...") if len(msg) > 150 else msg
            tools = resp.get("toolsUsed", [])
            print(f"[{idx}/5] PASS ({dt}s) - {label}")
            print(f"      Q: {q}")
            print(f"      Tools: {tools}")
            print(f"      A: {msg_snippet}\n")
            passed += 1
        else:
            print(f"[{idx}/5] FAIL ({r.status_code}): {r.text[:100]}\n")
    except Exception as e:
        print(f"[{idx}/5] ERROR: {e}\n")

print("=" * 65)
print(f"RESULT: {passed}/5 QUERIES PASSED SUCCESSFULLY!")
print("=" * 65)
