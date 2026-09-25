# 🚨 30+ SOS Trigger Test Cases & Creative Safety Matrix

> **Discovery Uttarakhand — Community Rescue Grid**  
> *"In the Himalayas, every emergency is unique. A hiker in freezing fog needs a different beacon than someone who ran out of battery or spotted wildlife."*

---

## ⚡ TYPE 1: 1-Click Quick Triggers (5 Modes)

| # | Trigger Name | How It Works | Expected Outcome on Grid |
|---|---|---|---|
| **1** | **Panic SOS** | Single tap high-priority button | Direct `TRK-82341 MISSING - Need Immediate Help` broadcasted to Admin & Guides |
| **2** | **Long Press 3s SOS** | Press and hold button for 3 continuous seconds with circular progress | Prevents accidental pocket triggers; fires after 3.0s timer reaches 100% |
| **3** | **Double Tap SOS** | Requires 2 quick successive taps within 400ms | Single tap shows *"Tap once more to confirm"*; double tap triggers distress |
| **4** | **Shake to SOS** | Device accelerometer shake detection (`devicemotion` / mock button) | Simulates trekker slipping or falling down a slope; triggers fall alert |
| **5** | **Power Button 5x SOS** | Fast 5x tap simulation mimicking hardware emergency shortcut | Common Android/iOS panic shortcut; fires instant silent emergency packet |

---

## 🤖 TYPE 2: Smart Auto Triggers (7 Autonomous Modes)

| # | Trigger Name | Condition / Detection | Expected Outcome on Grid |
|---|---|---|---|
| **6** | **No Movement 30m** | GPS coordinates stationary for > 30 minutes on active trail | Auto prompt: *"Are you stuck? Distress beacon ready"*; triggers after timeout |
| **7** | **Battery Dead SOS (5%)** | Hardware battery API reports $\le 5\%$ remaining | Transmits final high-accuracy coordinate packet with *"Battery critical shutdown"* note |
| **8** | **Altitude Drop Fall SOS** | Barometric altimeter drops $> 20\text{m}$ in under 3 seconds | Flags high-severity *"Sudden descent / Possible crevasse fall"* alert |
| **9** | **Off-Route Deviation** | Trekker drifts $> 500\text{m}$ outside mapped trail boundaries | Auto alert: *"Off-track deviation detected near Ghuttu gorge"* |
| **10** | **Night Haze SOS (Past 9 PM)** | Trek still marked active after 21:00 IST in sub-zero terrain | Prompts trekker; notifies basecamp if unacknowledged within 15 min |
| **11** | **Weather Storm Auto SOS** | Real-time OpenWeather returns severe blizzard / cloudburst | Auto-activates advisory mode: *"Storm warning active on Kedarnath ridge"* |
| **12** | **SOS with 10s Countdown** | When triggered, screen plays 10-second countdown with audible beeps | Allows trekker to click `[Cancel False Alarm]` before wide grid broadcast |

---

## 🐻 TYPE 3: Creative Story & Situation Based (10 Modes)

| # | Trigger Name | Context / Story | Expected Outcome on Grid |
|---|---|---|---|
| **13** | **Chai & Shelter SOS** | Trekker exhausted, hypothermic, or out of hot water | Notifies nearby tea stalls & homestays: *"Trekker needs shelter / hot ration"* |
| **14** | **Wild Animal Spotted (🐻)** | Black bear / Leopard spotted near Bhojbasa or Kedarnath forest | Guide alert: *"Wildlife sighting (Caution: Not human medical emergency)"* |
| **15** | **Network Zero SOS** | Jio / Airtel signal dead, asks for mesh peer | Prompts nearby hikers with active SIMs to relay emergency packet |
| **16** | **Budget Depletion SOS** | Trekker stranded without cash / digital payments | Queries nearest GMVN dormitory and community aid camps under ₹500 |
| **17** | **Photo Attach SOS** | Trail washout or bridge collapse photo capture | Captures simulated camera snapshot to transmit visual evidence to command |
| **18** | **Voice Memo SOS (10s)** | Trekker's hands frozen, records short audio note | Transmits 10-second compressed voice message: *"Landslide near stream 3"* |
| **19** | **Group Buddy Relay** | 1 trekker triggers distress in a group | Automatically pings 3 nearest buddy devices within 1km radius to assist |
| **20** | **Fake SOS Penalty** | User triggers $> 3$ false alarms without mountain hazard | Safety penalty warning: *"Reputation score reduced; priority rank adjusted"* |
| **21** | **Guide-to-Trekker Reverse SOS** | Guide notices avalanche above trail | Reverse beacon: *"Trail ahead closed; halt ascent and shelter at checkpoint"* |
| **22** | **Silent Stealth SOS** | Screen goes completely black / disguised as battery saver | Transmits GPS beacon in background without audible sound or light |

---

## 🛠️ TYPE 4: Technical & Edge Scenarios (8 Modes)

| # | Trigger Name | Implementation Detail | Expected Outcome on Grid |
|---|---|---|---|
| **23** | **Offline Mesh Queue** | Device disconnected from Wi-Fi / cellular | Stored in offline buffer; auto-syncs the millisecond network restores |
| **24** | **Multi-Language SOS (Hindi)** | Triggered in Devanagari: `मदद चाहिए` | Command center displays bilingual alert with English + Hindi transcription |
| **25** | **Telemetry-Rich SOS** | Transmits battery, signal, elevation, ambient temp, steps | Mission control receives complete 5-point sensor telemetry |
| **26** | **3-Tier Severity Levels** | 🟡 Advisory (Guide) \| 🟠 Urgent (Guide+Ops) \| 🔴 Critical (All-Out) | Visual color coding with distinctive siren tone for Level 3 |
| **27** | **2-Minute Cancel Window** | Trekker clicks cancel within 120s of accidental trigger | Command center clears red beacon with green *"False Alarm Cleared"* status |
| **28** | **Trekker SOS Audit History** | Historical audit trail of previous emergency signals | Admin checks pattern of previous pings over last 48 hours |
| **29** | **Auto Rescue Acknowledgement**| Guide clicks `[I Am Going to Rescue]` | Trekker screen updates: *"Guide Ramesh Rawat (1.2km) is incoming (ETA 18m)"* |
| **30** | **WhatsApp Emergency Share** | Generates prefilled WhatsApp message for family | One-click `wa.me/?text=Emergency at coordinates 30.73N, 79.06E` link |

---

## 🎖️ Presentation Bonus Scenarios

- **31. Live Judge Mobile Test:** Judge opens `/trekker` on their personal smartphone, taps SOS, and watches laptop command center light up.
- **32. Mock Drone Dispatch:** Command center clicks *"Deploy Recon Drone"* to view mock aerial waypoint coordinates.
- **33. Kichha-to-Kedarnath Relay:** Visualizing multi-district telemetry hop from remote plain towns up to high Himalayan summits.
