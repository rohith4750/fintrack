# 📱 FinTrack Field Officer Mobile App (React Native & Expo)

**FinTrack Mobile** is a production-grade, offline-first mobile application designed specifically for microfinance field officers, recovery agents, and regional finance executives.

---

## 🌟 Key Features

1. **🔐 Agent Authentication & PIN Pad**:
   - 4-digit PIN authentication with role-based data isolation.
   - Field Officer personal profile & daily target overview.

2. **📊 Field Officer Operations Dashboard**:
   - **Personal KPIs**: Today's Collection vs Daily Target (`₹18.5k / ₹30k`), Recovery Efficiency (`94.2%`), Overdue Account Watchlist.
   - **Cash-in-Hand vs Safety Limit**: Live tracker against maximum daily vault limit (`₹75,000`).
   - **100% P&L Hidden**: Agent view contains strictly operational metrics with zero company profit/loss disclosure.

3. **🗺️ Beat & Route Collection**:
   - Stop-by-stop borrower collection order.
   - Route selector (`Main Road Beat`, `Danavaipeta Beat`, etc.).
   - Live filters: *All Stops*, *Pending Due*, *Paid Today*, *Overdue*.
   - Direct 1-tap phone dialer & GPS address navigation.

4. **⚡ Advance & Multi-Week Collection Engine**:
   - 1-tap Advance Multiplier: **1 Wk**, **2 Wks**, **3 Wks**, **4 Wks**.
   - Live schedule preview of future due dates being cleared in advance (`★ ADVANCE`).
   - Payment Methods: Physical Cash and UPI (with UTR reference).

5. **🖨️ Bluetooth Thermal Receipt Printer (ESC/POS 58mm / 80mm)**:
   - Instant receipt generation on mobile thermal printers via ESC/POS protocol.
   - 1-click **WhatsApp Receipt sharing** directly to borrower's phone number.
   - Digital voucher with remaining balance and weeks completed counter (`2 / 60 Wks Paid`).

6. **📖 60-Week Loan Ledger & Customer Profile**:
   - Full repayment schedule timeline with Scheduled Due Date vs Paid On date.
   - Aadhaar, PAN, and Guarantor KYC details.

7. **💼 End-of-Day Cash Handover & Attendance**:
   - Physical cash currency denomination counter (₹2000, ₹500, ₹200, ₹100, ₹50, ₹20, ₹10, Coins) with live auto-sum and shortage calculation.
   - Digital handover sign-off voucher.
   - Daily GPS punch-in with vehicle starting/ending odometer (KM) readings.

8. **📡 Offline-First Sync Queue**:
   - Collections recorded in zero-connectivity areas are queued in local SQLite / AsyncStorage.
   - Automatically synchronizes when network connectivity returns.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- Expo Go mobile app (installed on Android or iOS device from Play Store / App Store)

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Backend API URL
Open `mobile/src/services/api.ts` or configure it inside the Mobile Login screen:
```ts
export const DEFAULT_API_BASE_URL = 'http://<YOUR_LOCAL_IP>:3001/api';
```
*(Replace `<YOUR_LOCAL_IP>` with your computer's local Wi-Fi IP address, e.g. `192.168.1.100`)*

### 3. Launch Development Server
```bash
npx expo start
```
Scan the QR code with your phone camera (iOS) or the **Expo Go** app (Android) to open the app on your mobile device.

---

## 📁 Architecture & Directory Structure

```
mobile/
├── App.tsx                     # Root App entry with Context Providers
├── app.json                    # Expo configuration & app permissions
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
└── src/
    ├── types/index.ts          # Strongly typed models (Loan, Customer, Route, Collection)
    ├── theme/
    │   ├── colors.ts           # Deep Navy & Emerald theme tokens
    │   └── typography.ts       # Type scale & text styles
    ├── services/
    │   ├── api.ts              # End-to-end REST API client & offline cache
    │   └── printerService.ts   # ESC/POS Bluetooth Thermal printer formatting
    ├── context/
    │   ├── AuthContext.tsx     # Agent Authentication state & session
    │   └── OfflineContext.tsx  # Offline sync queue manager
    ├── components/
    │   ├── HeaderBar.tsx       # Custom header with online/offline pill
    │   ├── KpiCard.tsx         # Metric KPI cards with progress bars
    │   ├── BorrowerStopCard.tsx# Route stop card with 1-click actions
    │   ├── AdvanceSelector.tsx # Multi-week advance installment picker
    │   ├── DenominationTable.tsx # Currency counter (2000 to 10)
    │   └── ThermalReceiptPreview.tsx # 58mm paper receipt layout
    ├── screens/
    │   ├── Auth/LoginScreen.tsx
    │   ├── Dashboard/AgentDashboardScreen.tsx
    │   ├── Collection/BeatCollectionScreen.tsx
    │   ├── Collection/CollectPaymentScreen.tsx
    │   ├── Collection/ReceiptViewScreen.tsx
    │   ├── Customers/CustomerDetailScreen.tsx
    │   ├── Attendance/AttendanceScreen.tsx
    │   └── Handover/CashHandoverScreen.tsx
    └── navigation/
        └── AppNavigator.tsx    # Bottom Tabs + Stack Navigation
```

---

## 🖨️ Bluetooth Thermal Printer Integration

The mobile app formats raw ESC/POS commands compatible with standard 58mm and 80mm Bluetooth mini-printers (e.g. Everycom, BluPrint, Epson, Zebra, RP58).
- Connect via phone's Bluetooth settings (PIN: `0000` or `1234`).
- Tapping **"Print Thermal Slip"** sends the ESC/POS buffer with business header, voucher number, weeks paid, advance tag, and barcode.
