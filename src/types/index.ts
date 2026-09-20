export type UserRole = 'ADMIN' | 'AGENT';

export interface AgentPermissions {
  canCollectCash: boolean;
  canCollectUPI: boolean;
  canEditCustomer: boolean;
  canDisburseLoan: boolean;
  maxDailyCashLimit: number;
}

export interface User {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  loginId?: string; // e.g. "AGT-RJY-02"
  pin?: string; // 4-digit quick mobile/web collection PIN
  password?: string;
  assignedAreaIds?: string[];
  assignedRouteIds?: string[];
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  recoveryEfficiency?: number;
  todayTarget?: number;
  todayCollected?: number;
  attendanceStatus?: 'PRESENT' | 'ON_FIELD' | 'ABSENT' | 'HALF_DAY';
  permissions?: AgentPermissions;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  phone: string;
}

export interface Area {
  id: string;
  name: string;
  code: string;
  branchId: string;
  description?: string;
  totalCustomers: number;
  activeLoansCount: number;
  totalOutstanding: number;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  areaId: string;
  areaName: string;
  assignedAgentId: string;
  assignedAgentName: string;
  collectionFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  totalCustomers: number;
  todayTarget?: number;
  todayCollected: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Customer {
  id: string;
  customerCode: string; // e.g. "CUST-RJY-101"
  name: string;
  mobileNumber: string;
  aadhaarNumber: string;
  address: string;
  areaId: string;
  areaName: string;
  routeId: string;
  routeName: string;
  assignedAgentId: string;
  assignedAgentName: string;
  assignedAgentPhone?: string;
  occupation: string;
  monthlyIncome: number;
  referenceName: string;
  referenceContact: string;
  status: 'ACTIVE' | 'CLOSED' | 'BLOCKED';
  creditScore: number; // 300 - 900
  joinDate: string;
  totalLoans: number;
  activeLoanAmount: number;
  totalOutstanding: number;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  locationAddress?: string;
}

export type LoanType = 'WEEKLY' | 'MONTHLY' | 'DAILY' | 'PRODUCT_FINANCE';

export interface Installment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  paidDate?: string;
  status: 'PAID' | 'PARTIALLY_PAID' | 'DUE' | 'OVERDUE';
  receiptNumber?: string;
  collectedByAgentId?: string;
}

export interface Loan {
  id: string;
  loanNumber: string; // e.g. "LN-2026-0891"
  customerId: string;
  customerName: string;
  customerCode: string;
  customerPhone: string;
  areaId: string;
  areaName: string;
  routeId: string;
  routeName: string;
  loanType: LoanType;
  principalAmount: number;
  interestRatePercentage: number; // e.g. 20%
  totalInterestAmount: number; // e.g. 2000
  totalRepayableAmount: number; // 12000
  installmentAmount: number; // e.g. 600
  durationUnits: number; // e.g. 20 weeks / 12 months / 100 days
  disbursementDate: string;
  startDate: string;
  endDate: string;
  totalPaidAmount: number;
  outstandingBalance: number;
  nextDueDate: string;
  status: 'ACTIVE' | 'CLOSED' | 'OVERDUE' | 'DEFAULTED';
  productId?: string;
  productName?: string;
  installments: Installment[];
  agentId: string;
  agentName: string;
  remarks?: string;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER';

export interface Collection {
  id: string;
  receiptNumber: string; // e.g. "RCP-2026-4421"
  customerId: string;
  customerName: string;
  customerCode: string;
  loanId: string;
  loanNumber: string;
  agentId: string;
  agentName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  upiTransactionId?: string;
  collectionDate: string; // ISO date or "2026-09-20"
  time: string; // "10:30 AM"
  areaName: string;
  routeName: string;
  installmentNumber?: number;
  balanceAfterPayment: number;
  remarks: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'MOBILE' | 'TV' | 'REFRIGERATOR' | 'WASHING_MACHINE' | 'MOTORCYCLE' | 'OTHER';
  brand: string;
  productCost: number;
  sellingPrice: number;
  stockQuantity: number;
  standardDownPayment: number;
  standardTenureMonths: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface ProductFinanceOrder {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  category: string;
  customerId: string;
  customerName: string;
  customerCode: string;
  customerPhone: string;
  loanId: string;
  productCost: number;
  sellingPrice: number;
  downPayment: number;
  financedAmount: number;
  profitMargin: number; // sellingPrice - productCost + interest
  tenureMonths: number;
  monthlyEmi: number;
  orderDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  serialNumber?: string;
}

export interface Expense {
  id: string;
  voucherNumber: string;
  category: 'FUEL' | 'SALARIES' | 'OFFICE_RENT' | 'MARKETING' | 'VEHICLE_MAINTENANCE' | 'MISCELLANEOUS';
  title: string;
  amount: number;
  date: string;
  paidTo: string;
  paymentMethod: PaymentMethod;
  approvedBy: string;
  notes?: string;
}

export interface AgentAttendance {
  id: string;
  agentId: string;
  agentName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'ON_FIELD' | 'ABSENT' | 'HALF_DAY';
  startKilometers?: number;
  endKilometers?: number;
  remarks?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'DUE_TODAY' | 'OVERDUE' | 'LOW_STOCK' | 'ATTENDANCE' | 'COLLECTION_TARGET' | 'INFO';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}
