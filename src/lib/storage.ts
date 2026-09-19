"use client";

import {
  Area,
  Branch,
  Collection,
  Customer,
  Expense,
  Loan,
  Product,
  ProductFinanceOrder,
  Route,
  SystemNotification,
  User,
  AgentAttendance,
  PaymentMethod,
  LoanType
} from "@/types";
import {
  initialAreas,
  initialBranches,
  initialCollections,
  initialCustomers,
  initialExpenses,
  initialLoans,
  initialNotifications,
  initialProductFinanceOrders,
  initialProducts,
  initialRoutes,
  initialUsers,
  initialAttendance
} from "./mockData";

export interface FinTrackStore {
  branches: Branch[];
  areas: Area[];
  routes: Route[];
  users: User[];
  customers: Customer[];
  loans: Loan[];
  collections: Collection[];
  products: Product[];
  productFinanceOrders: ProductFinanceOrder[];
  expenses: Expense[];
  notifications: SystemNotification[];
  attendance: AgentAttendance[];
  currentRole: 'ADMIN' | 'AGENT';
  currentAgentId: string;
  selectedBranchId: string;
}

const STORAGE_KEY = "fintrack_platform_data_v1";

export function getStoredData(): FinTrackStore {
  if (typeof window === "undefined") {
    return {
      branches: initialBranches,
      areas: initialAreas,
      routes: initialRoutes,
      users: initialUsers,
      customers: initialCustomers,
      loans: initialLoans,
      collections: initialCollections,
      products: initialProducts,
      productFinanceOrders: initialProductFinanceOrders,
      expenses: initialExpenses,
      notifications: initialNotifications,
      attendance: initialAttendance,
      currentRole: "ADMIN",
      currentAgentId: "USR-02", // Ramesh Varma
      selectedBranchId: "BR-01",
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse storage, using defaults", e);
  }

  const initialStore: FinTrackStore = {
    branches: initialBranches,
    areas: initialAreas,
    routes: initialRoutes,
    users: initialUsers,
    customers: initialCustomers,
    loans: initialLoans,
    collections: initialCollections,
    products: initialProducts,
    productFinanceOrders: initialProductFinanceOrders,
    expenses: initialExpenses,
    notifications: initialNotifications,
    attendance: initialAttendance,
    currentRole: "ADMIN",
    currentAgentId: "USR-02",
    selectedBranchId: "BR-01",
  };

  saveData(initialStore);
  return initialStore;
}

export function saveData(data: FinTrackStore) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save to local storage", e);
    }
  }
}

export function resetToDefaults(): FinTrackStore {
  const defaults: FinTrackStore = {
    branches: initialBranches,
    areas: initialAreas,
    routes: initialRoutes,
    users: initialUsers,
    customers: initialCustomers,
    loans: initialLoans,
    collections: initialCollections,
    products: initialProducts,
    productFinanceOrders: initialProductFinanceOrders,
    expenses: initialExpenses,
    notifications: initialNotifications,
    attendance: initialAttendance,
    currentRole: "ADMIN",
    currentAgentId: "USR-02",
    selectedBranchId: "BR-01",
  };
  saveData(defaults);
  return defaults;
}

// Helpers for calculations
export function calculateLoanDetails(principal: number, interestRate: number, durationUnits: number, loanType: LoanType) {
  const totalInterest = Math.round((principal * interestRate) / 100);
  const totalRepayable = principal + totalInterest;
  const installmentAmount = Math.ceil(totalRepayable / durationUnits);
  return {
    totalInterest,
    totalRepayable,
    installmentAmount,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
