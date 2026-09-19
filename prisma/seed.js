const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const initialBranches = [
  { branchId: "BR-01", code: "BR-RJY", name: "FinTrack Regional HQ - Rajahmundry", city: "Rajahmundry", state: "Andhra Pradesh", phone: "+91 883 2459800" },
  { branchId: "BR-02", code: "BR-KKD", name: "FinTrack Branch - Kakinada", city: "Kakinada", state: "Andhra Pradesh", phone: "+91 884 2374100" }
];

const initialAreas = [
  { areaId: "AREA-01", name: "Rajahmundry", code: "RJY", branchId: "BR-01", description: "Main city & Godavari riverbank commercial corridors", totalCustomers: 184, activeLoansCount: 142, totalOutstanding: 1485000 },
  { areaId: "AREA-02", name: "Kakinada", code: "KKD", branchId: "BR-02", description: "Port city commercial & residential clusters", totalCustomers: 142, activeLoansCount: 98, totalOutstanding: 1120000 },
  { areaId: "AREA-03", name: "Amalapuram", code: "AMP", branchId: "BR-01", description: "Konaseema agrarian & retail business hub", totalCustomers: 96, activeLoansCount: 64, totalOutstanding: 780000 },
  { areaId: "AREA-04", name: "Ramachandrapuram", code: "RCP", branchId: "BR-01", description: "Town market center & weekly bazaar belt", totalCustomers: 78, activeLoansCount: 52, totalOutstanding: 590000 }
];

const initialUsers = [
  { userId: "USR-01", name: "Rajesh Kumar (Admin)", email: "admin@fintrack.in", phone: "+91 98480 12345", role: "ADMIN", status: "ACTIVE", pin: "9999", loginId: "ADMIN-01", recoveryEfficiency: 98.0, todayTarget: 150000, todayCollected: 94500, attendanceStatus: "PRESENT", maxDailyCashLimit: 500000, canCollectCash: true, canCollectUPI: true, canEditCustomer: true, canDisburseLoan: true },
  { userId: "USR-02", name: "Ramesh Varma", email: "ramesh.varma@fintrack.in", phone: "+91 99590 88712", role: "AGENT", status: "ACTIVE", pin: "1234", loginId: "AGT-RJY-02", recoveryEfficiency: 94.2, todayTarget: 51600, todayCollected: 40200, attendanceStatus: "ON_FIELD", maxDailyCashLimit: 75000, canCollectCash: true, canCollectUPI: true, canEditCustomer: true, canDisburseLoan: false },
  { userId: "USR-03", name: "Suresh Babu", email: "suresh.babu@fintrack.in", phone: "+91 97033 45210", role: "AGENT", status: "ACTIVE", pin: "2389", loginId: "AGT-RJY-03", recoveryEfficiency: 91.8, todayTarget: 18500, todayCollected: 16200, attendanceStatus: "ON_FIELD", maxDailyCashLimit: 50000, canCollectCash: true, canCollectUPI: true, canEditCustomer: false, canDisburseLoan: false },
  { userId: "USR-04", name: "Venkat Rao", email: "venkat.rao@fintrack.in", phone: "+91 94401 67890", role: "AGENT", status: "ACTIVE", pin: "8821", loginId: "AGT-KKD-04", recoveryEfficiency: 88.5, todayTarget: 38400, todayCollected: 31200, attendanceStatus: "ON_FIELD", maxDailyCashLimit: 60000, canCollectCash: true, canCollectUPI: true, canEditCustomer: true, canDisburseLoan: false },
  { userId: "USR-05", name: "Prasad Raju", email: "prasad.raju@fintrack.in", phone: "+91 98492 33451", role: "AGENT", status: "ACTIVE", pin: "5512", loginId: "AGT-AMP-05", recoveryEfficiency: 95.0, todayTarget: 42000, todayCollected: 33500, attendanceStatus: "PRESENT", maxDailyCashLimit: 80000, canCollectCash: true, canCollectUPI: true, canEditCustomer: false, canDisburseLoan: false }
];

const initialRoutes = [
  { routeId: "RT-01", name: "Route A - Danavaipeta & Kotagummam", code: "RJY-R-A", areaId: "AREA-01", assignedAgentId: "USR-02", collectionFrequency: "WEEKLY", totalCustomers: 48, todayTarget: 28800, todayCollected: 21600, status: "ACTIVE" },
  { routeId: "RT-02", name: "Route B - Main Bazaar & Syamala Theatre Road", code: "RJY-R-B", areaId: "AREA-01", assignedAgentId: "USR-03", collectionFrequency: "DAILY", totalCustomers: 52, todayTarget: 18500, todayCollected: 16200, status: "ACTIVE" },
  { routeId: "RT-03", name: "Route C - Bhanugudi & Cinema Road", code: "KKD-R-A", areaId: "AREA-02", assignedAgentId: "USR-04", collectionFrequency: "WEEKLY", totalCustomers: 64, todayTarget: 38400, todayCollected: 31200, status: "ACTIVE" },
  { routeId: "RT-04", name: "Route D - Clock Tower & Peruru Road", code: "AMP-R-A", areaId: "AREA-03", assignedAgentId: "USR-05", collectionFrequency: "MONTHLY", totalCustomers: 45, todayTarget: 42000, todayCollected: 33500, status: "ACTIVE" },
  { routeId: "RT-05", name: "Route E - Market Line & RTC Complex", code: "RCP-R-A", areaId: "AREA-04", assignedAgentId: "USR-02", collectionFrequency: "WEEKLY", totalCustomers: 38, todayTarget: 22800, todayCollected: 18600, status: "ACTIVE" }
];

const initialCustomers = [
  { customerCode: "CUST-RJY-001", name: "B. Satyanarayana Murthy", mobileNumber: "+91 98481 22334", aadhaarNumber: "7849 2231 9980", address: "D.No 12-4-8, Danavaipeta, Rajahmundry", areaId: "AREA-01", routeId: "RT-01", occupation: "Wholesale Kirana Store Owner", monthlyIncome: 45000, referenceName: "M. Subba Rao", referenceContact: "+91 94405 11223", status: "ACTIVE", creditScore: 780, joinDate: "2025-04-10", totalLoans: 3, activeLoanAmount: 20000, totalOutstanding: 7200 },
  { customerCode: "CUST-RJY-002", name: "P. Lakshmi Durga", mobileNumber: "+91 99490 88219", aadhaarNumber: "6541 3320 8891", address: "Shop #14, Main Bazaar, Rajahmundry", areaId: "AREA-01", routeId: "RT-02", occupation: "Saree & Textile Merchant", monthlyIncome: 38000, referenceName: "V. Srinivas", referenceContact: "+91 98661 44556", status: "ACTIVE", creditScore: 740, joinDate: "2025-06-15", totalLoans: 2, activeLoanAmount: 50000, totalOutstanding: 23960 },
  { customerCode: "CUST-KKD-003", name: "K. Appa Rao", mobileNumber: "+91 94901 77654", aadhaarNumber: "8890 1245 6712", address: "Plot 42, Bhanugudi Junction, Kakinada", areaId: "AREA-02", routeId: "RT-03", occupation: "Automobile Garage Owner", monthlyIncome: 55000, referenceName: "K. Rambabu", referenceContact: "+91 97000 88990", status: "ACTIVE", creditScore: 810, joinDate: "2025-02-20", totalLoans: 4, activeLoanAmount: 80000, totalOutstanding: 35000 },
  { customerCode: "CUST-AMP-004", name: "G. Venkateswara Rao", mobileNumber: "+91 98495 66781", aadhaarNumber: "4521 9980 3341", address: "Near Clock Tower, Amalapuram", areaId: "AREA-03", routeId: "RT-04", occupation: "Coconut & Paddy Trader", monthlyIncome: 60000, referenceName: "N. Suryanarayana", referenceContact: "+91 98488 99112", status: "ACTIVE", creditScore: 765, joinDate: "2025-05-12", totalLoans: 2, activeLoanAmount: 50000, totalOutstanding: 19168 },
  { customerCode: "CUST-RCP-005", name: "T. Krishna Chaitanya", mobileNumber: "+91 97011 22345", aadhaarNumber: "3321 8890 4452", address: "Market Line, Near RTC Complex, Ramachandrapuram", areaId: "AREA-04", routeId: "RT-05", occupation: "Electronic Repairs & Accessories", monthlyIncome: 32000, referenceName: "T. Venkanna", referenceContact: "+91 99512 33445", status: "ACTIVE", creditScore: 710, joinDate: "2025-08-01", totalLoans: 1, activeLoanAmount: 10000, totalOutstanding: 4200 },
  { customerCode: "CUST-RJY-006", name: "M. Anitha Kumari", mobileNumber: "+91 99890 12344", aadhaarNumber: "5567 1234 9876", address: "Kotagummam, Rajahmundry", areaId: "AREA-01", routeId: "RT-01", occupation: "Tailoring & Boutique", monthlyIncome: 25000, referenceName: "M. Prasad", referenceContact: "+91 98480 55443", status: "ACTIVE", creditScore: 690, joinDate: "2025-09-01", totalLoans: 1, activeLoanAmount: 15000, totalOutstanding: 7800 },
  { customerCode: "CUST-KKD-007", name: "V. Chinna Reddemma", mobileNumber: "+91 94411 99887", aadhaarNumber: "9012 3456 7890", address: "Jagannaickpur, Kakinada", areaId: "AREA-02", routeId: "RT-03", occupation: "Fish & Sea Food Exporter", monthlyIncome: 70000, referenceName: "V. Govind Rao", referenceContact: "+91 98482 11009", status: "BLOCKED", creditScore: 520, joinDate: "2025-01-10", totalLoans: 2, activeLoanAmount: 30000, totalOutstanding: 28000 }
];

const initialProducts = [
  { sku: "PROD-IPHONE15", name: "Apple iPhone 15 (128GB Black)", category: "MOBILE", brand: "Apple", productCost: 59000, sellingPrice: 69900, stockQuantity: 12, standardDownPayment: 15000, standardTenureMonths: 12, status: "IN_STOCK" },
  { sku: "PROD-LG-55TV", name: "LG 55-inch 4K UHD Smart OLED TV", category: "TV", brand: "LG Electronics", productCost: 42000, sellingPrice: 52500, stockQuantity: 8, standardDownPayment: 10000, standardTenureMonths: 10, status: "IN_STOCK" },
  { sku: "PROD-WHIRL-REF", name: "Whirlpool 260L Frost-Free Double Door Refrigerator", category: "REFRIGERATOR", brand: "Whirlpool", productCost: 23500, sellingPrice: 29900, stockQuantity: 4, standardDownPayment: 6000, standardTenureMonths: 8, status: "LOW_STOCK" },
  { sku: "PROD-IFB-WM", name: "IFB 7kg 5-Star Front Load Washing Machine", category: "WASHING_MACHINE", brand: "IFB", productCost: 28000, sellingPrice: 34990, stockQuantity: 6, standardDownPayment: 7000, standardTenureMonths: 9, status: "IN_STOCK" },
  { sku: "PROD-HERO-SPL", name: "Hero Splendor Plus XTEC 100cc Motorcycle", category: "MOTORCYCLE", brand: "Hero MotoCorp", productCost: 68000, sellingPrice: 84000, stockQuantity: 3, standardDownPayment: 14000, standardTenureMonths: 18, status: "LOW_STOCK" }
];

const initialLoans = [
  { loanNumber: "LN-2026-0101", customerId: "CUST-RJY-001", routeId: "RT-01", agentId: "USR-02", loanType: "WEEKLY", principalAmount: 20000, interestRatePercentage: 20, totalInterestAmount: 4000, totalRepayableAmount: 24000, installmentAmount: 1200, durationUnits: 20, disbursementDate: "2026-06-01", startDate: "2026-06-08", endDate: "2026-10-26", totalPaidAmount: 16800, outstandingBalance: 7200, nextDueDate: "2026-09-21", status: "ACTIVE", remarks: "Weekly loan at store counter" },
  { loanNumber: "LN-2026-0102", customerId: "CUST-RJY-002", routeId: "RT-02", agentId: "USR-03", loanType: "MONTHLY", principalAmount: 50000, interestRatePercentage: 15, totalInterestAmount: 7500, totalRepayableAmount: 57500, installmentAmount: 4792, durationUnits: 12, disbursementDate: "2026-02-15", startDate: "2026-03-15", endDate: "2027-02-15", totalPaidAmount: 33540, outstandingBalance: 23960, nextDueDate: "2026-10-15", status: "ACTIVE", remarks: "Textile festive inventory stock expansion" },
  { loanNumber: "LN-2026-0103", customerId: "CUST-KKD-003", routeId: "RT-03", agentId: "USR-04", loanType: "PRODUCT_FINANCE", productName: "Hero Splendor Plus XTEC Motorcycle", productId: "PROD-HERO-SPL", principalAmount: 70000, interestRatePercentage: 18, totalInterestAmount: 12600, totalRepayableAmount: 82600, installmentAmount: 4588, durationUnits: 18, disbursementDate: "2026-01-10", startDate: "2026-02-10", endDate: "2027-07-10", totalPaidAmount: 47600, outstandingBalance: 35000, nextDueDate: "2026-09-20", status: "ACTIVE", remarks: "Two-wheeler commercial delivery vehicle finance" },
  { loanNumber: "LN-2026-0104", customerId: "CUST-AMP-004", routeId: "RT-04", agentId: "USR-05", loanType: "MONTHLY", principalAmount: 50000, interestRatePercentage: 15, totalInterestAmount: 7500, totalRepayableAmount: 57500, installmentAmount: 4792, durationUnits: 12, disbursementDate: "2026-01-20", startDate: "2026-02-20", endDate: "2027-01-20", totalPaidAmount: 38332, outstandingBalance: 19168, nextDueDate: "2026-09-20", status: "ACTIVE", remarks: "Coconut trade working capital" },
  { loanNumber: "LN-2026-0105", customerId: "CUST-RCP-005", routeId: "RT-05", agentId: "USR-02", loanType: "WEEKLY", principalAmount: 10000, interestRatePercentage: 20, totalInterestAmount: 2000, totalRepayableAmount: 12000, installmentAmount: 600, durationUnits: 20, disbursementDate: "2026-06-15", startDate: "2026-06-22", endDate: "2026-11-09", totalPaidAmount: 7800, outstandingBalance: 4200, nextDueDate: "2026-09-22", status: "ACTIVE", remarks: "Weekly mini business loan" },
  { loanNumber: "LN-2026-0106", customerId: "CUST-KKD-007", routeId: "RT-03", agentId: "USR-04", loanType: "WEEKLY", principalAmount: 30000, interestRatePercentage: 20, totalInterestAmount: 6000, totalRepayableAmount: 36000, installmentAmount: 1800, durationUnits: 20, disbursementDate: "2026-03-01", startDate: "2026-03-08", endDate: "2026-07-26", totalPaidAmount: 8000, outstandingBalance: 28000, nextDueDate: "2026-04-12", status: "OVERDUE", remarks: "Defaulted on 6 consecutive installments." }
];

const initialCollections = [
  { receiptNumber: "RCP-2026-8891", customerId: "CUST-RJY-001", loanId: "LN-2026-0101", agentId: "USR-02", amount: 1200, paymentMethod: "CASH", collectionDate: "2026-09-20", time: "09:15 AM", areaName: "Rajahmundry", routeName: "Route A - Danavaipeta & Kotagummam", installmentNumber: 15, balanceAfterPayment: 6000, remarks: "Received weekly installment #15" },
  { receiptNumber: "RCP-2026-8892", customerId: "CUST-KKD-003", loanId: "LN-2026-0103", agentId: "USR-04", amount: 4588, paymentMethod: "UPI", upiTransactionId: "UPI/3902198402/SBI", collectionDate: "2026-09-20", time: "10:30 AM", areaName: "Kakinada", routeName: "Route C - Bhanugudi & Cinema Road", installmentNumber: 11, balanceAfterPayment: 30412, remarks: "Monthly EMI paid via PhonePe QR" },
  { receiptNumber: "RCP-2026-8893", customerId: "CUST-AMP-004", loanId: "LN-2026-0104", agentId: "USR-05", amount: 4792, paymentMethod: "CASH", collectionDate: "2026-09-20", time: "11:10 AM", areaName: "Amalapuram", routeName: "Route D - Clock Tower & Peruru Road", installmentNumber: 9, balanceAfterPayment: 14376, remarks: "Collected at coconut mandi" },
  { receiptNumber: "RCP-2026-8894", customerId: "CUST-RCP-005", loanId: "LN-2026-0105", agentId: "USR-02", amount: 600, paymentMethod: "UPI", upiTransactionId: "UPI/9982348001/HDFC", collectionDate: "2026-09-20", time: "11:45 AM", areaName: "Ramachandrapuram", routeName: "Route E - Market Line & RTC Complex", installmentNumber: 14, balanceAfterPayment: 3600, remarks: "Weekly EMI paid via GPay" }
];

const initialExpenses = [
  { voucherNumber: "VCH-2026-041", category: "FUEL", title: "Field Agent Petrol Allowance - Route A & E", amount: 1800, date: "2026-09-20", paidTo: "Ramesh Varma", paymentMethod: "UPI", approvedBy: "K. Srikanth Naidu", notes: "Weekly field travel reimbursement" },
  { voucherNumber: "VCH-2026-042", category: "OFFICE_RENT", title: "Rajahmundry Branch Main Office Rent (Sep 2026)", amount: 22000, date: "2026-09-05", paidTo: "B. Ram Mohan (Landlord)", paymentMethod: "BANK_TRANSFER", approvedBy: "K. Srikanth Naidu", notes: "Main commercial branch rent" },
  { voucherNumber: "VCH-2026-043", category: "SALARIES", title: "Field Agents & Staff Monthly Incentives", amount: 35000, date: "2026-09-10", paidTo: "Staff Payroll Account", paymentMethod: "BANK_TRANSFER", approvedBy: "K. Srikanth Naidu", notes: "August recovery performance bonuses" },
  { voucherNumber: "VCH-2026-044", category: "MARKETING", title: "Diwali Loan Scheme Pamphlets & Auto Rickshaw Promo", amount: 4500, date: "2026-09-15", paidTo: "Sri Sai Graphics & Audio Ads", paymentMethod: "CASH", approvedBy: "K. Srikanth Naidu", notes: "Festive finance scheme outreach" },
  { voucherNumber: "VCH-2026-045", category: "VEHICLE_MAINTENANCE", title: "Field Bike Servicing & Oil Change", amount: 1450, date: "2026-09-18", paidTo: "Venkateswara Motors", paymentMethod: "CASH", approvedBy: "K. Srikanth Naidu", notes: "Agent field vehicle servicing" }
];

async function seed() {
  console.log("Connecting to PostgreSQL database DD...");

  // 1. Branches
  for (const b of initialBranches) {
    await prisma.branch.upsert({
      where: { branchId: b.branchId },
      update: {},
      create: b,
    });
  }
  console.log("✓ Branches seeded");

  // 2. Users
  for (const u of initialUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
  }
  console.log("✓ Users seeded");

  // 3. Areas
  for (const a of initialAreas) {
    await prisma.area.upsert({
      where: { code: a.code },
      update: {},
      create: a,
    });
  }
  console.log("✓ Areas seeded");

  // 4. Routes
  for (const r of initialRoutes) {
    await prisma.route.upsert({
      where: { code: r.code },
      update: {},
      create: r,
    });
  }
  console.log("✓ Routes seeded");

  // 5. Customers
  for (const c of initialCustomers) {
    await prisma.customer.upsert({
      where: { customerCode: c.customerCode },
      update: {},
      create: c,
    });
  }
  console.log("✓ Customers seeded");

  // 6. Products
  for (const p of initialProducts) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }
  console.log("✓ Products seeded");

  // 7. Loans
  for (const l of initialLoans) {
    await prisma.loan.upsert({
      where: { loanNumber: l.loanNumber },
      update: {},
      create: l,
    });
  }
  console.log("✓ Loans seeded");

  // 8. Collections
  for (const col of initialCollections) {
    await prisma.collection.upsert({
      where: { receiptNumber: col.receiptNumber },
      update: {},
      create: col,
    });
  }
  console.log("✓ Collections seeded");

  // 9. Expenses
  for (const exp of initialExpenses) {
    await prisma.expense.upsert({
      where: { voucherNumber: exp.voucherNumber },
      update: {},
      create: exp,
    });
  }
  console.log("✓ Expenses seeded");

  console.log("==================================================");
  console.log("🎉 ALL TABLES IN DATABASE 'DD' ARE FULLY POPULATED!");
  console.log("==================================================");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
