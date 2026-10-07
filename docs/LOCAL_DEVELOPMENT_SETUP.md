# Local Development Setup & Multi-Developer Guide

This document explains how to set up, configure, and synchronize the **Discovery Uttarakhand** project locally across multiple development machines.

---

## 1. Quick Start

### 1.1 Clone the Repository
```bash
git clone https://github.com/Discovery-Uttarakhand-Team/Discovery-Uttarakhand.git
cd Discovery-Uttarakhand
```

### 1.2 Install Dependencies
Install dependencies for both the backend and frontend:

```bash
# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd Frontend
npm install
cd ..
```

---

## 2. Environment Configuration

### 2.1 Backend Environment
Copy the example configuration file:
```bash
# On Linux/macOS
cp backend/.env.example backend/.env

# On Windows (cmd)
copy backend\.env.example backend\.env

# On Windows (PowerShell)
Copy-Item backend/.env.example backend/.env
```

Open `backend/.env` and configure your local credentials:
- `MONGODB_URI`: Your MongoDB Atlas URI or local MongoDB (`mongodb://localhost:27017/discovery_uttarakhand`)
- `JWT_SECRET`: Random 32+ character string
- `JWT_REFRESH_SECRET`: Random 32+ character string
- `FRONTEND_URL`: `http://localhost:5173`

### 2.2 Frontend Environment
```bash
# On Windows
copy Frontend\.env.example Frontend\.env

# On Linux/macOS
cp Frontend/.env.example Frontend/.env
```
Ensure `VITE_API_BASE_URL` points to `http://localhost:5000/api`.

---

## 3. Email (Nodemailer) & Google App Password Setup

The application uses Nodemailer with SMTP to send real 6-digit OTP verification codes for account signup, login verification, and password resets.

> **CRITICAL SECURITY LAW:**  
> Never use your standard Google account login password. Gmail SMTP strictly requires a **16-character Google App Password**.

### Step 1: Enable Google 2-Step Verification
1. Open your [Google Account Security Settings](https://myaccount.google.com/security).
2. Under "How you sign in to Google", ensure **2-Step Verification** is turned **ON**.

### Step 2: Generate a 16-Character App Password
1. Navigate to [Google App Passwords](https://myaccount.google.com/apppasswords).
2. Enter an app name (e.g., `Discovery Uttarakhand Dev`).
3. Click **Create**.
4. Google will display a 16-character code (e.g., `abcd efgh ijkl mnop`).

### Step 3: Configure `backend/.env`
Paste the credentials into `backend/.env` without spaces:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM="Discovery Uttarakhand <noreply@discoveryuttarakhand.com>"
```

*(Note: The system also supports `EMAIL_USER` and `EMAIL_PASS` as drop-in aliases).*

### Step 4: Verify SMTP Connectivity
Run the built-in diagnostic test to confirm your connection:
```bash
node backend/scripts/verify_smtp.js
```
To also dispatch a self-test email to your configured address:
```bash
node backend/scripts/verify_smtp.js --send
```

Expected output:
```text
SMTP TEST: SUCCESS
Server is ready to accept and dispatch emails.
```

---

## 4. Running the Application Locally

### Start Backend
In a terminal:
```bash
cd backend
npm run dev
```
The server will start at `http://localhost:5000`. You will see an immediate startup diagnostic log:
`[EmailService] ✅ SMTP verified successfully (Gmail SMTP) — Ready to dispatch emails.`

### Start Frontend
In a second terminal:
```bash
cd Frontend
npm run dev
```
The client will start at `http://localhost:5173`.

---

## 5. Running with Docker (Alternative)

If developing using Docker:

```bash
docker compose up --build
```

The `docker-compose.yml` file is configured with:
- Automatic environment injection from `backend/.env`
- Port forwarding: `5000:5000` (Backend API) and `80:80` (Frontend client)
- Direct outbound networking to `smtp.gmail.com:465`

---

## 6. Multi-Developer Git Workflow

To collaborate smoothly across multiple machines:

```text
                    GitHub
                      |
          +-----------+-----------+
          |                       |
     Developer A             Developer B
          |                       |
       local .env              local .env
          |                       |
       same code               same code
```

### Golden Rules:
1. **Never commit `.env`**: Secrets remain strictly local to each machine.
2. **Pull latest changes before starting work**:
   ```bash
   git fetch origin
   git pull --rebase origin <branch>
   ```
3. **Before pushing**:
   ```bash
   git status
   git diff
   git add <modified-files>
   git commit -m "feat/fix: descriptive message"
   git push origin <branch>
   ```
4. **Keep `.env.example` updated**: If you introduce a new environment variable, add it to `.env.example` with a placeholder description.
