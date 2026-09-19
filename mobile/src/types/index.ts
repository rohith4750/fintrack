export type UserRole = 'ADMIN' | 'AGENT';
export type LoanType = 'WEEKLY' | 'MONTHLY' | 'DAILY' | 'PRODUCT_FINANCE';
export type LoanStatus = 'ACTIVE' | 'CLOSED' | 'OVERDUE' | 'DEFAULTED';
export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER';
export type InstallmentStatus = 'PAID' | 'DUE' | 'OVERDUE' | 'PARTIAL';
export type AttendanceStatus = 'PRESENT' | 'ON_FIELD' | 'ABSENT' | 'HALF_DAY';

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
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  avatar?: string;
  loginId?: string;
  pin?: string;
  password?: string;
  recoveryEfficiency?: number;
  todayTarget?: number;
  todayCollected?: number;
  attendanceStatus?: AttendanceStatus;
  maxDailyCashLimit?: number;
  assignedAreaIds?: string[];
  assignedRouteIds?: string[];
  permissions?: AgentPermissions;
}

export interface Customer {
  id: string;
  customerCode: string;
  fullName: string;
  phone: string;
  aadhaarNumber?: string;
  address: string;
  city: string;
  areaId: string;
  areaName: string;
  routeId: string;
  routeName: string;
  assignedAgentId: string;
  totalLoans: number;
  activeLoanAmount: number;
  totalOutstanding: number;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  photoUrl?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  locationAddress?: string;
}

export interface Installment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: InstallmentStatus;
  paidDate?: string;
  collectedByAgentId?: string;
  receiptNumber?: string;
}

export interface Loan {
  id: string;
  loanNumber: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  phone: string;
  principalAmount: number;
  interestRate: number;
  interestAmount: number;
  processingFee: number;
  totalRepayableAmount: number;
  installmentAmount: number;
  totalPaidAmount: number;
  outstandingBalance: number;
  loanType: LoanType;
  durationUnits: number;
  startDate: string;
  disbursementDate: string;
  endDate: string;
  status: LoanStatus;
  areaId: string;
  areaName: string;
  routeId: string;
  routeName: string;
  agentId: string;
  agentName: string;
  installments?: Installment[];
}

export interface Collection {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  loanId: string;
  loanNumber: string;
  agentId: string;
  agentName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  upiTransactionId?: string;
  collectionDate: string;
  time: string;
  areaName: string;
  routeName: string;
  installmentNumber?: number;
  balanceAfterPayment: number;
  weeksCleared?: number;
  remarks?: string;
  isSynced?: boolean;
}

export interface Area {
  id: string;
  areaId?: string;
  name: string;
  code: string;
  description?: string;
  totalCustomers: number;
  activeLoansCount: number;
  totalOutstanding: number;
}

export interface Route {
  id: string;
  routeId?: string;
  name: string;
  code: string;
  areaId: string;
  areaName: string;
  assignedAgentId: string;
  assignedAgentName: string;
  collectionDay: string;
  totalCustomers: number;
  todayTarget: number;
  todayCollected: number;
}

export interface Expense {
  id: string;
  voucherNumber: string;
  category: 'OFFICE_RENT' | 'STAFF_SALARY' | 'FUEL_CONVEYANCE' | 'PRINTING_STATIONERY' | 'TEA_REFRESHMENT' | 'MISCELLANEOUS';
  title: string;
  amount: number;
  expenseDate: string;
  paidTo: string;
  paymentMode: 'CASH' | 'UPI' | 'BANK_TRANSFER';
  recordedBy: string;
  remarks?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  brand: string;
  model: string;
  cashPrice: number;
  schemePrice: number;
  advanceDeposit: number;
  weeklyEmi: number;
  tenureWeeks: number;
  stockCount: number;
}

export interface AgentAttendanceRecord {
  id: string;
  agentId: string;
  agentName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  startKilometers: number;
  endKilometers?: number;
  selfieUrl?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  remarks?: string;
}

export interface CashDenomination {
  notes2000: number;
  notes500: number;
  notes200: number;
  notes100: number;
  notes50: number;
  notes20: number;
  notes10: number;
  coins: number;
}

export interface CashHandoverRecord {
  id: string;
  agentId: string;
  agentName: string;
  date: string;
  time: string;
  totalCollections: number;
  totalCashAmount: number;
  totalUpiAmount: number;
  denominations: CashDenomination;
  handedOverTo: string;
  status: 'SUBMITTED' | 'VERIFIED' | 'RECONCILED';
  managerRemarks?: string;
}
