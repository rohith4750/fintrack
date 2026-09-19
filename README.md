# FinTrack — Smart Regional Microfinance & Collection Platform

A comprehensive enterprise finance operating system designed for daily, weekly, and monthly regional micro-lending, loan disbursal, borrower GPS location tracking with Google Maps navigation, thermal receipt printing, and field force management.

---

## 🚀 Key Features

### 🏢 Web Administration Suite (Next.js 14 + Tailwind CSS + Prisma + PostgreSQL)
- **Executive Dashboard**: Real-time KPI cards for Active Capital, Outstanding Balances, Daily/Weekly Target Progress, and Net Risk Exposure.
- **Loan Disbursal Engine**: Flexible interest calculations (Flat/Reducing), tenure scheduling, and automatic borrower balance updates.
- **Customer & KYC Management**: Complete borrower registration, photo/Aadhaar verification, guarantor records, and GPS location tracking.
- **Field Force & Agent Provisioning**: Dedicated agent management with 4-digit PIN credentials, daily collection quotas, cash limits, and route assignments.
- **Beat & Route Operations**: Regional area management, collection beat assignments, and route optimization.
- **Expense & Cash Reconciliation**: Fuel, salary, stationery, and miscellaneous voucher tracking.

### 📱 Field Force Mobile App (React Native Expo + TypeScript)
- **PIN-Based Authentication**: Fast, secure 4-digit PIN login with dynamic database lookup.
- **Borrower GPS & Google Maps Navigation**: One-tap live GPS pinning and turn-by-turn navigation directly to borrowers' shops/residences.
- **Beat Collection Interface**: Collection stops organized by route with real-time payment recording (Cash/UPI).
- **Thermal Receipt Generation**: Instant 58mm/80mm thermal receipt preview and sharing.
- **Full Admin Suite in Mobile**: Create/Edit Customers, Disburse Loans, Manage Agents & PINs, and Add Beat Routes directly from the mobile app.
- **Seamless Offline-First Sync**: Local cache with automatic background queue sync when connection is restored.

---

## 🛠️ Tech Stack

- **Web Frontend & Backend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons
- **Mobile App**: React Native (Expo SDK 52), TypeScript, React Navigation
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Location Services**: Expo Location, Reverse Geocoding, Google Maps Intent Integration

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running on `localhost:5432`
- Expo Go App on Android/iOS (or Android Emulator)

### 2. Database Setup
```bash
# Clone the repository
git clone https://github.com/rohith4750/fintrack.git
cd fintrack

# Install web dependencies
npm install

# Configure environment variables (.env)
DATABASE_URL="postgresql://postgres:password@localhost:5432/DD?schema=public"

# Push Prisma schema to database and generate client
npx prisma db push
npx prisma generate

# (Optional) Seed realistic regional sample data
# Send POST request to http://localhost:3001/api/seed
```

### 3. Run Web Application
```bash
npm run dev -- -p 3001
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### 4. Run Mobile App
```bash
cd mobile
npm install

# If running on a physical Android device connected via USB:
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3001 tcp:3001

# Start Expo development server
npx expo start -c
```
Scan the QR code with **Expo Go** on your device.

---

## 🔐 Default Login Credentials (PIN)

- **Admin Login PIN**: `1002`
- **Agent Login PINs**: `1234` (Ramesh Varma), `7788` (T. Sai Kumar), or any custom agent provisioned in the Admin panel

---

## 📄 License
MIT License. Built for microfinance and field collection operations.
