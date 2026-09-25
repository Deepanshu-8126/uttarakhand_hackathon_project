# 🏔️ Discovery Uttarakhand - Flutter Mobile App

Official cross-platform Flutter application for **Discover Uttarakhand**.

---

## ⚡ Zero Local Setup: Download APK directly from GitHub Actions

Aapko apne computer par **Flutter ya Android Studio download karne ki bilkul zaroorat nahi hai**.

Har push par ya manually GitHub par ek click karne par **GitHub Actions cloud runner** automatic Android APK build karega:

### APK Download Karne Ka Tareeqa:
1. Apne GitHub repository ko open karo (`github.com/<your-username>/discover`).
2. Top tabs me **Actions** par click karo.
3. Left sidebar me **"Build Discovery Uttarakhand Android APK"** select karo.
4. **"Run workflow"** button par click karo (ya latest commit ka run open karo).
5. Workflow complete hone ke baad (~3-4 minute), page ke bottom me **Artifacts** section me:
   - **`Discover-Uttarakhand-Android-APK`** file par click karo.
6. Zip file download hogi, usko extract karke `.apk` file ko apne phone me install kar lo! 📱

---

## 📦 App Architecture & Features

- **Pahadi Aesthetic Design System**:
  - Forest Green (`#1A4331`), Mountain Cream (`#FDFBF7`), Terracotta Earth (`#C08457`).
  - Google Fonts (Inter).
- **Core Tabs**:
  1. **Explore**: Hero crossfade carousel, search bar, category filter chips (Lakes, Spiritual, Snow, Adventure, Wildlife), verified destination cards with altitude and budget.
  2. **Rentals & Stays**: Scooters (Activa 6G), Adventure Bikes (Himalayan 450), 4x4 SUVs, and verified Pahadi Homestays with instant booking modal.
  3. **Mountain GIS Map & Radar**: Spatial view of Uttarakhand with Landslide Radar, High Altitude Guard warnings, and live road transit advisories.
  4. **AI Trip Planner**: Interactive budget allocator (Stay 40%, Food 25%, Ride 20%, Buffer 15%) and duration calculator.
  5. **Pahadi Copilot (AI Travel Advisor)**: Hyper-local conversational chat connected to `/api/agent/chat` with offline ground data fallbacks.
