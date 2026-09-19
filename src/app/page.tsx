"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  AgentAttendance
} from "@/types";
import { getStoredData, saveData, resetToDefaults, FinTrackStore } from "@/lib/storage";
import { Sidebar, NavTab } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { AreaRouteManagement } from "@/components/areas/AreaRouteManagement";
import { CustomerManagement } from "@/components/customers/CustomerManagement";
import { LoanManagement } from "@/components/loans/LoanManagement";
import { CollectionManagement } from "@/components/collections/CollectionManagement";
import { ProductFinanceManagement } from "@/components/products/ProductFinanceManagement";
import { AgentManagement } from "@/components/agents/AgentManagement";
import { AgentFieldPortal } from "@/components/agent-mode/AgentFieldPortal";
import { ExpenseManagement } from "@/components/expenses/ExpenseManagement";
import { ReportsCenter } from "@/components/reports/ReportsCenter";
import { ReceiptModal } from "@/components/modals/ReceiptModal";
import { NewLoanModal } from "@/components/modals/NewLoanModal";
import { QuickCollectModal } from "@/components/modals/QuickCollectModal";
import { RotateCcw, ShieldCheck, Smartphone, CheckCircle, Database } from "lucide-react";

export default function Home() {
  const [store, setStore] = useState<FinTrackStore | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  // Modals state
  const [showQuickCollect, setShowQuickCollect] = useState(false);
  const [quickCollectLoanId, setQuickCollectLoanId] = useState<string | undefined>(undefined);
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [newLoanCustomerId, setNewLoanCustomerId] = useState<string | undefined>(undefined);
  const [activeReceipt, setActiveReceipt] = useState<Collection | null>(null);

  // Load from local storage once on mount
  useEffect(() => {
    const data = getStoredData();
    setStore(data);
  }, []);

  // Safe unified updater without recursive loop
  const updateStore = useCallback((updater: (prev: FinTrackStore) => FinTrackStore) => {
    setStore((prev) => {
      if (!prev) return prev;
      const updated = updater(prev);
      saveData(updated);
      return updated;
    });
  }, []);

  if (!store) {
    return (
      <div className="min-h-screen bg-[#0b192c] flex items-center justify-center text-white font-sans text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading FinTrack Platform...</span>
        </div>
      </div>
    );
  }

  // Switch Role (Admin / Agent)
  const handleToggleRole = () => {
    updateStore((prev) => ({
      ...prev,
      currentRole: prev.currentRole === "ADMIN" ? "AGENT" : "ADMIN",
    }));
  };

  // Branch change
  const handleSelectBranch = (branchId: string) => {
    updateStore((prev) => ({
      ...prev,
      selectedBranchId: branchId,
    }));
  };

  // Mark notification read
  const handleMarkNotificationRead = (notifId: string) => {
    updateStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n)),
    }));
  };

  // Add Customer (with anti-duplicate check)
  const handleAddCustomer = (customerData: Omit<Customer, "id" | "customerCode" | "totalLoans" | "activeLoanAmount" | "totalOutstanding" | "joinDate">) => {
    updateStore((prev) => {
      // Check if already exists to prevent duplicate insertion
      const exists = prev.customers.some((c) => c.mobileNumber === customerData.mobileNumber && c.name === customerData.name);
      if (exists) return prev;

      const newCode = `CUST-${customerData.areaName.slice(0, 3).toUpperCase()}-${String(prev.customers.length + 1).padStart(3, "0")}`;
      const newCust: Customer = {
        ...customerData,
        id: `CUST-${Date.now().toString().slice(-4)}`,
        customerCode: newCode,
        joinDate: "2026-09-20",
        totalLoans: 0,
        activeLoanAmount: 0,
        totalOutstanding: 0,
      };

      return {
        ...prev,
        customers: [newCust, ...prev.customers],
      };
    });
  };

  // Reassign Customer's Field Agent
  const handleReassignCustomerAgent = (customerId: string, agentId: string, agentName: string) => {
    updateStore((prev) => ({
      ...prev,
      customers: prev.customers.map((c) =>
        c.id === customerId ? { ...c, assignedAgentId: agentId, assignedAgentName: agentName } : c
      ),
    }));
  };

  // Add Agent (Admin Provisioning)
  const handleAddAgent = (agentData: Omit<User, "id" | "recoveryEfficiency" | "todayCollected">) => {
    updateStore((prev) => {
      const exists = prev.users.some((u) => u.phone === agentData.phone || u.email === agentData.email);
      if (exists) return prev;

      const newAgent: User = {
        ...agentData,
        id: agentData.userId || `USR-${String(prev.users.length + 1).padStart(2, "0")}`,
        recoveryEfficiency: 90.0,
        todayCollected: 0,
      };

      return {
        ...prev,
        users: [...prev.users, newAgent],
      };
    });
  };

  // Update Agent Credentials / Security / Status
  const handleUpdateAgentCredentials = (agentId: string, updates: Partial<User>) => {
    updateStore((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === agentId ? { ...u, ...updates } : u)),
    }));
  };

  // Add Loan (with anti-duplicate check)
  const handleCreateLoan = (loanData: Omit<Loan, "id" | "loanNumber" | "totalPaidAmount" | "status" | "installments">) => {
    updateStore((prev) => {
      const newLoanNumber = `LN-2026-${String(prev.loans.length + 101).padStart(4, "0")}`;
      const startDateObj = new Date(loanData.startDate || loanData.disbursementDate || "2026-09-20");
      const installments = Array.from({ length: loanData.durationUnits }, (_, i) => {
        const d = new Date(startDateObj);
        if (loanData.loanType === "WEEKLY") {
          d.setDate(d.getDate() + (i * 7));
        } else if (loanData.loanType === "MONTHLY") {
          d.setMonth(d.getMonth() + i);
        } else if (loanData.loanType === "DAILY") {
          d.setDate(d.getDate() + i);
        } else {
          d.setDate(d.getDate() + (i * 7));
        }
        return {
          installmentNumber: i + 1,
          dueDate: d.toISOString().split("T")[0],
          amount: loanData.installmentAmount,
          paidAmount: 0,
          status: (i === 0 ? "DUE" : "DUE") as any,
        };
      });

      const newLoan: Loan = {
        ...loanData,
        id: `LN-${Date.now().toString().slice(-4)}`,
        loanNumber: newLoanNumber,
        totalPaidAmount: 0,
        status: "ACTIVE",
        installments,
      };

      const updatedCustomers = prev.customers.map((c) =>
        c.id === loanData.customerId || c.customerCode === loanData.customerCode
          ? {
              ...c,
              totalLoans: c.totalLoans + 1,
              activeLoanAmount: c.activeLoanAmount + loanData.principalAmount,
              totalOutstanding: c.totalOutstanding + loanData.totalRepayableAmount,
            }
          : c
      );

      return {
        ...prev,
        loans: [newLoan, ...prev.loans],
        customers: updatedCustomers,
      };
    });
  };

  // Record Collection & issue receipt (atomic and single-trigger)
  const handleRecordCollection = (colData: Omit<Collection, "id" | "receiptNumber" | "time">) => {
    const receiptNo = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCollection: Collection = {
      ...colData,
      id: `COL-${Date.now().toString().slice(-4)}`,
      receiptNumber: receiptNo,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    updateStore((prev) => {
      // Update Loan
      const updatedLoans = prev.loans.map((l) => {
        if (l.id === colData.loanId || l.loanNumber === colData.loanNumber) {
          const newPaid = l.totalPaidAmount + colData.amount;
          const newBal = Math.max(0, l.outstandingBalance - colData.amount);
          const totalPaidInstallments = Math.min(
            l.durationUnits,
            Math.round(newPaid / (l.installmentAmount || 1))
          );

          // Update installment items status
          const updatedInstallments = (l.installments || []).map((inst, idx) => {
            if (idx < totalPaidInstallments) {
              return {
                ...inst,
                status: "PAID" as const,
                paidAmount: inst.amount,
                paidDate: inst.paidDate || colData.collectionDate || "2026-09-20",
                collectedByAgentId: inst.collectedByAgentId || colData.agentId,
                receiptNumber: inst.receiptNumber || receiptNo,
              };
            }
            return inst;
          });

          return {
            ...l,
            totalPaidAmount: newPaid,
            outstandingBalance: newBal,
            status: (newBal === 0 ? "CLOSED" : "ACTIVE") as any,
            installments: updatedInstallments,
          };
        }
        return l;
      });

      // Update Customer
      const updatedCustomers = prev.customers.map((c) => {
        if (c.id === colData.customerId || c.customerCode === colData.customerCode) {
          return {
            ...c,
            totalOutstanding: Math.max(0, c.totalOutstanding - colData.amount),
          };
        }
        return c;
      });

      // Update Route Collected Amount
      const updatedRoutes = prev.routes.map((r) => {
        if (r.name === colData.routeName) {
          return {
            ...r,
            todayCollected: r.todayCollected + colData.amount,
          };
        }
        return r;
      });

      // Update Agent Collected Amount
      const updatedUsers = prev.users.map((u) => {
        if (u.id === colData.agentId || u.userId === colData.agentId) {
          return {
            ...u,
            todayCollected: (u.todayCollected || 0) + colData.amount,
          };
        }
        return u;
      });

      return {
        ...prev,
        collections: [newCollection, ...prev.collections],
        loans: updatedLoans,
        customers: updatedCustomers,
        routes: updatedRoutes,
        users: updatedUsers,
      };
    });

    // Automatically open receipt modal
    setActiveReceipt(newCollection);
  };

  // Add Expense
  const handleAddExpense = (expenseData: Omit<Expense, "id" | "voucherNumber">) => {
    updateStore((prev) => {
      const newVoucher = `VCH-2026-${String(prev.expenses.length + 50).padStart(3, "0")}`;
      const newExp: Expense = {
        ...expenseData,
        id: `EXP-${Date.now().toString().slice(-4)}`,
        voucherNumber: newVoucher,
      };

      return {
        ...prev,
        expenses: [newExp, ...prev.expenses],
      };
    });
  };

  // Add Product Finance Order
  const handleAddProductOrder = (orderData: Omit<ProductFinanceOrder, "id" | "orderNumber" | "orderDate" | "status">) => {
    updateStore((prev) => {
      const newOrderNo = `PFO-2026-${String(prev.productFinanceOrders.length + 85).padStart(3, "0")}`;
      const newOrder: ProductFinanceOrder = {
        ...orderData,
        id: `PFO-${Date.now().toString().slice(-4)}`,
        orderNumber: newOrderNo,
        orderDate: "2026-09-20",
        status: "ACTIVE",
      };

      return {
        ...prev,
        productFinanceOrders: [newOrder, ...prev.productFinanceOrders],
      };
    });
  };

  // Add Product to Catalog
  const handleAddProduct = (prodData: Omit<Product, "id">) => {
    updateStore((prev) => {
      const newProduct: Product = {
        ...prodData,
        id: `PROD-${Date.now().toString().slice(-4)}`,
      };

      return {
        ...prev,
        products: [newProduct, ...prev.products],
      };
    });
  };

  // Add Area
  const handleAddArea = (areaData: Omit<Area, "id" | "totalCustomers" | "activeLoansCount" | "totalOutstanding">) => {
    updateStore((prev) => {
      const newArea: Area = {
        ...areaData,
        id: `AREA-${Date.now().toString().slice(-4)}`,
        totalCustomers: 0,
        activeLoansCount: 0,
        totalOutstanding: 0,
      };

      return {
        ...prev,
        areas: [...prev.areas, newArea],
      };
    });
  };

  // Add Route
  const handleAddRoute = (routeData: Omit<Route, "id" | "totalCustomers" | "todayTarget" | "todayCollected">) => {
    updateStore((prev) => {
      const newRoute: Route = {
        ...routeData,
        id: `RT-${Date.now().toString().slice(-4)}`,
        totalCustomers: 0,
        todayTarget: 25000,
        todayCollected: 0,
      };

      return {
        ...prev,
        routes: [...prev.routes, newRoute],
      };
    });
  };

  // Update Route Agent
  const handleUpdateRouteAgent = (routeId: string, agentId: string, agentName: string) => {
    updateStore((prev) => ({
      ...prev,
      routes: prev.routes.map((r) => (r.id === routeId ? { ...r, assignedAgentId: agentId, assignedAgentName: agentName } : r)),
    }));
  };

  // Update Agent Attendance
  const handleUpdateAgentAttendance = (agentId: string, status: AgentAttendance["status"]) => {
    updateStore((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === agentId ? { ...u, attendanceStatus: status } : u)),
      attendance: prev.attendance.map((att) => (att.agentId === agentId ? { ...att, status } : att)),
    }));
  };

  // Reset demo dataset
  const handleResetData = () => {
    if (confirm("Reset FinTrack platform with pre-loaded demo regional finance dataset?")) {
      const reset = resetToDefaults();
      setStore(reset);
    }
  };

  // CSV Export
  const handleExportCSV = (reportName: string = "Collections") => {
    const headers = "ReceiptNo,CustomerName,CustomerCode,LoanNo,Amount,PaymentMethod,Date,Agent,Route\n";
    const rows = store.collections
      .map(
        (c) =>
          `"${c.receiptNumber}","${c.customerName}","${c.customerCode}","${c.loanNumber}",${c.amount},"${c.paymentMethod}","${c.collectionDate}","${c.agentName}","${c.routeName}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `FinTrack_${reportName}_Report_${Date.now()}.csv`);
    a.click();
  };

  const currentAgent = store.users.find((u) => u.id === store.currentAgentId || u.userId === store.currentAgentId) || store.users[1];
  const overdueCount = store.loans.filter((l) => l.status === "OVERDUE" || l.status === "DEFAULTED").length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans">
      {/* Sidebar with nested submenus and navy aesthetic */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentRole={store.currentRole}
        onToggleRole={handleToggleRole}
        onResetData={handleResetData}
        totalOverdueCount={overdueCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          branches={store.branches}
          selectedBranchId={store.selectedBranchId}
          onSelectBranch={handleSelectBranch}
          currentRole={store.currentRole}
          onToggleRole={handleToggleRole}
          notifications={store.notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onOpenQuickCollect={() => {
            setQuickCollectLoanId(undefined);
            setShowQuickCollect(true);
          }}
          onOpenNewLoan={() => {
            setNewLoanCustomerId(undefined);
            setShowNewLoanModal(true);
          }}
          onOpenNewCustomer={() => setCurrentTab("customers")}
          searchTerm={globalSearchTerm}
          onSearchChange={setGlobalSearchTerm}
        />

        {/* Dynamic Workspace Container with compact padding */}
        <main className="flex-1 overflow-y-auto p-3 bg-slate-100">
          {currentTab === "dashboard" && (
            <DashboardOverview
              customers={
                store.currentRole === "AGENT"
                  ? store.customers.filter((c) => c.assignedAgentId === currentAgent.id || c.assignedAgentId === currentAgent.userId)
                  : store.customers
              }
              loans={
                store.currentRole === "AGENT"
                  ? store.loans.filter((l) => l.agentId === currentAgent.id || l.agentId === currentAgent.userId)
                  : store.loans
              }
              collections={
                store.currentRole === "AGENT"
                  ? store.collections.filter((c) => c.agentId === currentAgent.id || c.agentId === currentAgent.userId)
                  : store.collections
              }
              areas={store.areas}
              routes={
                store.currentRole === "AGENT"
                  ? store.routes.filter((r) => r.assignedAgentId === currentAgent.id || r.assignedAgentId === currentAgent.userId)
                  : store.routes
              }
              users={store.users}
              expenses={store.currentRole === "AGENT" ? [] : store.expenses}
              productFinanceOrders={store.currentRole === "AGENT" ? [] : store.productFinanceOrders}
              currentRole={store.currentRole}
              currentAgent={currentAgent}
              onOpenQuickCollect={(loanId) => {
                setQuickCollectLoanId(loanId);
                setShowQuickCollect(true);
              }}
              onOpenNewLoan={() => setShowNewLoanModal(true)}
              onOpenNewCustomer={() => setCurrentTab("customers")}
              onSelectCustomer={(cId) => setCurrentTab("customers")}
              onSelectTab={setCurrentTab}
              onViewReceipt={(col) => setActiveReceipt(col)}
            />
          )}

          {(currentTab === "areas" || currentTab === "routes") && (
            <AreaRouteManagement
              areas={store.areas}
              routes={store.routes}
              users={store.users}
              onAddArea={handleAddArea}
              onAddRoute={handleAddRoute}
              onUpdateRouteAgent={handleUpdateRouteAgent}
            />
          )}

          {currentTab === "customers" && (
            <CustomerManagement
              customers={
                store.currentRole === "AGENT"
                  ? store.customers.filter((c) => c.assignedAgentId === currentAgent.id || c.assignedAgentId === currentAgent.userId)
                  : store.customers
              }
              loans={
                store.currentRole === "AGENT"
                  ? store.loans.filter((l) => l.agentId === currentAgent.id || l.agentId === currentAgent.userId)
                  : store.loans
              }
              areas={store.areas}
              routes={
                store.currentRole === "AGENT"
                  ? store.routes.filter((r) => r.assignedAgentId === currentAgent.id || r.assignedAgentId === currentAgent.userId)
                  : store.routes
              }
              users={store.users}
              onAddCustomer={handleAddCustomer}
              onSelectCustomer={(cId) => {}}
              onOpenNewLoanForCustomer={(cust) => {
                setNewLoanCustomerId(cust.id);
                setShowNewLoanModal(true);
              }}
              onOpenQuickCollectForCustomer={(cust) => {
                const customerLoan = store.loans.find((l) => l.customerId === cust.id || l.customerCode === cust.customerCode && l.status !== "CLOSED");
                setQuickCollectLoanId(customerLoan?.id);
                setShowQuickCollect(true);
              }}
              onReassignCustomerAgent={handleReassignCustomerAgent}
            />
          )}

          {currentTab === "loans" && (
            <LoanManagement
              loans={
                store.currentRole === "AGENT"
                  ? store.loans.filter((l) => l.agentId === currentAgent.id || l.agentId === currentAgent.userId)
                  : store.loans
              }
              customers={
                store.currentRole === "AGENT"
                  ? store.customers.filter((c) => c.assignedAgentId === currentAgent.id || c.assignedAgentId === currentAgent.userId)
                  : store.customers
              }
              areas={store.areas}
              routes={
                store.currentRole === "AGENT"
                  ? store.routes.filter((r) => r.assignedAgentId === currentAgent.id || r.assignedAgentId === currentAgent.userId)
                  : store.routes
              }
              users={store.users}
              currentRole={store.currentRole}
              onOpenNewLoan={() => setShowNewLoanModal(true)}
              onOpenQuickCollect={(loanId) => {
                setQuickCollectLoanId(loanId);
                setShowQuickCollect(true);
              }}
              onViewSchedule={() => {}}
            />
          )}

          {currentTab === "collections" && (
            <CollectionManagement
              collections={
                store.currentRole === "AGENT"
                  ? store.collections.filter((c) => c.agentId === currentAgent.id || c.agentId === currentAgent.userId)
                  : store.collections
              }
              loans={
                store.currentRole === "AGENT"
                  ? store.loans.filter((l) => l.agentId === currentAgent.id || l.agentId === currentAgent.userId)
                  : store.loans
              }
              customers={
                store.currentRole === "AGENT"
                  ? store.customers.filter((c) => c.assignedAgentId === currentAgent.id || c.assignedAgentId === currentAgent.userId)
                  : store.customers
              }
              routes={
                store.currentRole === "AGENT"
                  ? store.routes.filter((r) => r.assignedAgentId === currentAgent.id || r.assignedAgentId === currentAgent.userId)
                  : store.routes
              }
              users={store.users}
              onOpenQuickCollect={() => {
                setQuickCollectLoanId(undefined);
                setShowQuickCollect(true);
              }}
              onViewReceipt={(col) => setActiveReceipt(col)}
              onExportCSV={() => handleExportCSV("Collections")}
            />
          )}

          {currentTab === "products" && (
            <ProductFinanceManagement
              products={store.products}
              productFinanceOrders={store.productFinanceOrders}
              customers={store.customers}
              users={store.users}
              onAddProductOrder={handleAddProductOrder}
              onAddProduct={handleAddProduct}
            />
          )}

          {currentTab === "agents" && (
            <AgentManagement
              users={store.users}
              routes={store.routes}
              areas={store.areas}
              attendance={store.attendance}
              onUpdateAgentAttendance={handleUpdateAgentAttendance}
              onSelectAgentForFieldMode={(agentId) => {
                updateStore((prev) => ({ ...prev, currentAgentId: agentId, currentRole: "AGENT" }));
                setCurrentTab("agent-portal");
              }}
              onAddAgent={handleAddAgent}
              onUpdateAgentCredentials={handleUpdateAgentCredentials}
            />
          )}

          {currentTab === "agent-portal" && (
            <AgentFieldPortal
              currentAgent={currentAgent}
              allAgents={store.users.filter((u) => u.role === "AGENT")}
              onSelectAgent={(agentId) => {
                updateStore((prev) => ({ ...prev, currentAgentId: agentId }));
              }}
              routes={store.routes}
              loans={store.loans}
              customers={store.customers}
              collections={store.collections}
              onOpenQuickCollect={(loanId) => {
                setQuickCollectLoanId(loanId);
                setShowQuickCollect(true);
              }}
              onViewReceipt={(col) => setActiveReceipt(col)}
              onSwitchToAdmin={() => {
                updateStore((prev) => ({ ...prev, currentRole: "ADMIN" }));
                setCurrentTab("dashboard");
              }}
            />
          )}

          {currentTab === "expenses" && (
            <ExpenseManagement
              expenses={store.expenses}
              loans={store.loans}
              productFinanceOrders={store.productFinanceOrders}
              users={store.users}
              onAddExpense={handleAddExpense}
            />
          )}

          {currentTab === "reports" && (
            <ReportsCenter
              collections={store.collections}
              loans={store.loans}
              customers={store.customers}
              expenses={store.expenses}
              productFinanceOrders={store.productFinanceOrders}
              routes={store.routes}
              users={store.users}
              areas={store.areas}
              onExportCSV={handleExportCSV}
            />
          )}
        </main>
      </div>

      {/* Universal Modals */}
      {showQuickCollect && (
        <QuickCollectModal
          loans={store.loans}
          customers={store.customers}
          users={store.users}
          routes={store.routes}
          initialLoanId={quickCollectLoanId}
          onClose={() => setShowQuickCollect(false)}
          onRecordCollection={handleRecordCollection}
        />
      )}

      {showNewLoanModal && (
        <NewLoanModal
          customers={store.customers}
          areas={store.areas}
          routes={store.routes}
          users={store.users}
          initialCustomerId={newLoanCustomerId}
          onClose={() => setShowNewLoanModal(false)}
          onCreateLoan={handleCreateLoan}
        />
      )}

      {activeReceipt && (
        <ReceiptModal
          collection={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
}
