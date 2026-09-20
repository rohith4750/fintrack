"use client";

import React, { useMemo } from "react";
import {
  Users,
  WalletCards,
  Receipt,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Calendar,
  IndianRupee,
  Layers,
  ChevronRight,
  Plus,
  Smartphone
} from "lucide-react";
import { Area, Collection, Customer, Expense, Loan, ProductFinanceOrder, Route, User } from "@/types";
import { formatINR } from "@/lib/storage";
import {
  AreaChart,
  Area as RechartsArea,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface DashboardOverviewProps {
  customers: Customer[];
  loans: Loan[];
  collections: Collection[];
  areas: Area[];
  routes: Route[];
  users: User[];
  expenses: Expense[];
  productFinanceOrders: ProductFinanceOrder[];
  currentRole?: 'ADMIN' | 'AGENT';
  currentAgent?: User;
  onOpenQuickCollect: (loanId?: string) => void;
  onOpenNewLoan: () => void;
  onOpenNewCustomer: () => void;
  onSelectCustomer: (customerId: string) => void;
  onSelectTab: (tab: any) => void;
  onViewReceipt: (collection: Collection) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  customers,
  loans,
  collections,
  areas,
  routes,
  users,
  expenses,
  productFinanceOrders,
  currentRole = 'ADMIN',
  currentAgent,
  onOpenQuickCollect,
  onOpenNewLoan,
  onOpenNewCustomer,
  onSelectCustomer,
  onSelectTab,
  onViewReceipt,
}) => {
  // Financial KPI computations
  const totalCustomers = customers.length;
  const activeLoans = loans.filter((l) => l.status === "ACTIVE");
  const overdueLoans = loans.filter((l) => l.status === "OVERDUE" || l.status === "DEFAULTED");
  const closedLoans = loans.filter((l) => l.status === "CLOSED");

  const totalOutstanding = activeLoans.reduce((acc, l) => acc + l.outstandingBalance, 0);

  // Today's collections
  const todayStr = "2026-09-20";
  const todayCollections = collections.filter((c) => c.collectionDate === todayStr);
  const todayCollectedAmount = todayCollections.reduce((acc, c) => acc + c.amount, 0);
  const todayTargetAmount = routes.reduce((acc, r) => acc + (r.todayTarget || 0), 0) || (currentAgent?.todayTarget || 50000);
  const todayProgressPercent = Math.min(100, Math.round((todayCollectedAmount / (todayTargetAmount || 1)) * 100));

  // Weekly & Monthly Collections
  const totalWeeklyCollected = collections.reduce((acc, c) => acc + c.amount, 0);

  // Profit calculation (Admin Only)
  const totalInterestEarned = loans.reduce((acc, l) => acc + (l.totalInterestAmount * (l.totalPaidAmount / (l.totalRepayableAmount || 1))), 0);
  const totalProductFinanceProfit = productFinanceOrders.reduce((acc, p) => acc + p.profitMargin, 0);
  const totalExpensesAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netBusinessProfit = Math.round(totalInterestEarned + totalProductFinanceProfit - totalExpensesAmount);

  // Chart data: 7-day collection trend
  const trendData = [
    { day: "14 Sep", collections: currentRole === 'AGENT' ? 6200 : 24500, target: currentRole === 'AGENT' ? 8000 : 28000 },
    { day: "15 Sep", collections: currentRole === 'AGENT' ? 7800 : 31200, target: currentRole === 'AGENT' ? 8000 : 30000 },
    { day: "16 Sep", collections: currentRole === 'AGENT' ? 7400 : 29800, target: currentRole === 'AGENT' ? 8000 : 30000 },
    { day: "17 Sep", collections: currentRole === 'AGENT' ? 9100 : 38400, target: currentRole === 'AGENT' ? 8500 : 32000 },
    { day: "18 Sep", collections: currentRole === 'AGENT' ? 10400 : 42100, target: currentRole === 'AGENT' ? 9000 : 35000 },
    { day: "19 Sep", collections: currentRole === 'AGENT' ? 8900 : 36900, target: currentRole === 'AGENT' ? 9000 : 35000 },
    { day: "20 Sep (Today)", collections: todayCollectedAmount, target: todayTargetAmount },
  ];

  // Route collection performance
  const routePerformanceData = routes.map((r) => ({
    name: r.name.split(" - ")[1] || r.name,
    collected: r.todayCollected,
    target: r.todayTarget,
  }));

  // Loan type breakdown
  const typeCount = useMemo(() => {
    return [
      { name: "Weekly Finance", value: loans.filter((l) => l.loanType === "WEEKLY").length, color: "#1e40af" },
      { name: "Monthly Finance", value: loans.filter((l) => l.loanType === "MONTHLY").length, color: "#06b6d4" },
      { name: "Product Finance", value: loans.filter((l) => l.loanType === "PRODUCT_FINANCE").length, color: "#f59e0b" },
      { name: "Daily Finance", value: loans.filter((l) => l.loanType === "DAILY").length, color: "#10b981" },
    ];
  }, [loans]);

  return (
    <div className="space-y-3 pb-8">
      {/* Top Banner with Quick Actions */}
      <div className="bg-[#0b192c] text-white p-3.5 rounded-[5px] border border-[#193555] shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              {currentRole === 'AGENT' ? 'Field Officer Portal' : 'Coastal Andhra Region Hub'}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] border border-emerald-500/40">
              {currentRole === 'AGENT' ? `Active Beat: ${currentAgent?.name || 'Field Officer'}` : 'Live Field Sync'}
            </span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
            {currentRole === 'AGENT' ? 'My Daily Collection & Beat Operations' : 'Finance Operations & Daily Collection Overview'}
          </h1>
          <p className="text-xs text-slate-300">
            {currentRole === 'AGENT'
              ? 'Real-time recovery tracking across your assigned borrower beats. Collect EMIs, track targets, and monitor outstanding accounts.'
              : 'Real-time ledger tracking across Rajahmundry, Kakinada, Amalapuram & Ramachandrapuram.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentRole === 'AGENT' && (
            <button
              onClick={() => onSelectTab('agent-portal')}
              className="btn-emerald font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Open Field Mode</span>
            </button>
          )}
          <button
            onClick={() => onOpenQuickCollect()}
            className="btn-navy-accent font-semibold flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Fast EMI Collect</span>
          </button>
          {currentRole === 'ADMIN' && (
            <button
              onClick={onOpenNewLoan}
              className="btn-navy-accent flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Disburse Loan</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {/* Today's Collections */}
        <div className="surface-card border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">
              {currentRole === 'AGENT' ? 'My Today Collected' : 'Today Collected'}
            </span>
            <span className="p-1 bg-emerald-50 text-emerald-600 rounded-[5px]">
              <IndianRupee className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-1">
            {formatINR(todayCollectedAmount)}
          </p>
          <div className="mt-1.5">
            <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
              <span>Target: {formatINR(todayTargetAmount)}</span>
              <span className="font-semibold text-emerald-600">{todayProgressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${todayProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="surface-card border-l-4 border-l-[#1e40af]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">
              {currentRole === 'AGENT' ? 'My Active Balance' : 'Outstanding Balance'}
            </span>
            <span className="p-1 bg-blue-50 text-[#1e40af] rounded-[5px]">
              <WalletCards className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-1">
            {formatINR(totalOutstanding)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Across <span className="font-semibold text-slate-700">{activeLoans.length}</span> active borrowers
          </p>
        </div>

        {/* Total Borrowers & Status */}
        <div className="surface-card border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">
              {currentRole === 'AGENT' ? 'My Customers' : 'Total Customers'}
            </span>
            <span className="p-1 bg-indigo-50 text-indigo-600 rounded-[5px]">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-1">{totalCustomers}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-semibold">{activeLoans.length} Active</span>
            <span>•</span>
            <span className="text-slate-500">{closedLoans.length} Closed</span>
          </div>
        </div>

        {/* Overdue / High Risk */}
        <div className="surface-card border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">
              {currentRole === 'AGENT' ? 'My Overdue' : 'Overdue Amount'}
            </span>
            <span className="p-1 bg-rose-50 text-rose-600 rounded-[5px]">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-base font-bold text-rose-600 mt-1">
            {formatINR(overdueLoans.reduce((acc, l) => acc + l.outstandingBalance, 0))}
          </p>
          <p className="text-[10px] text-rose-600 font-semibold mt-1">
            {overdueLoans.length} Loans Require Recovery
          </p>
        </div>

        {/* Net Business Profit (Admin Only) OR Daily Cash Limit (Agent) */}
        {currentRole === 'ADMIN' ? (
          <div className="surface-card border-l-4 border-l-teal-500">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Net Profit (P&L)</span>
              <span className="p-1 bg-teal-50 text-teal-600 rounded-[5px]">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-base font-bold text-teal-700 mt-1">
              {formatINR(netBusinessProfit)}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              After ₹{formatINR(totalExpensesAmount)} operational expenses
            </p>
          </div>
        ) : (
          <div className="surface-card border-l-4 border-l-teal-500">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Cash-in-Hand Limit</span>
              <span className="p-1 bg-teal-50 text-teal-600 rounded-[5px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-base font-bold text-teal-700 mt-1">
              {formatINR(todayCollectedAmount)}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Max Limit: {formatINR(currentAgent?.permissions?.maxDailyCashLimit || 75000)}
            </p>
          </div>
        )}

        {/* Field Recovery Efficiency */}
        <div className="surface-card border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Recovery Rate</span>
            <span className="p-1 bg-amber-50 text-amber-600 rounded-[5px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-1">
            {currentRole === 'AGENT' ? `${currentAgent?.recoveryEfficiency || 94.2}%` : '94.2%'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {currentRole === 'AGENT' ? 'Your beat efficiency score' : '4 Field Agents active on routes'}
          </p>
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* Collection Trends Chart */}
        <div className="lg:col-span-2 surface-card">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-slate-800">Collection Velocity vs Target (7 Days)</h2>
              <p className="text-[10px] text-slate-500">Daily actual cash & UPI collections vs daily scheduled route targets</p>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[#1e40af]" />
                <span className="text-slate-600 font-medium">Collected</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-slate-300" />
                <span className="text-slate-600 font-medium">Target</span>
              </div>
            </div>
          </div>
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), "Amount"]}
                  contentStyle={{ backgroundColor: "#0b192c", borderRadius: 5, border: "none", color: "#fff", fontSize: 11 }}
                  itemStyle={{ color: "#93c5fd" }}
                />
                <RechartsArea type="monotone" dataKey="collections" stroke="#1e40af" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                <RechartsArea type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Finance Type Breakdown */}
        <div className="surface-card flex flex-col">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-800">Portfolio by Finance Type</h2>
            <p className="text-[10px] text-slate-500">Distribution of active financing products</p>
          </div>
          <div className="h-44 mt-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeCount}
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {typeCount.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b192c", borderRadius: 5, border: "none", color: "#fff", fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-auto pt-2 border-t border-slate-100 text-[11px]">
            {typeCount.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: t.color }} />
                <span className="text-slate-600 truncate">{t.name}:</span>
                <span className="font-bold text-slate-800 ml-auto">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Route Performance Bar Chart & Live Collection Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* Route Level Bar Chart */}
        <div className="lg:col-span-1 surface-card">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-slate-800">Route-Wise Today Collections</h2>
              <p className="text-[10px] text-slate-500">Actual vs Target by Route</p>
            </div>
            <button
              onClick={() => onSelectTab('routes')}
              className="text-[10px] text-[#1e40af] hover:underline font-semibold"
            >
              View All
            </button>
          </div>
          <div className="h-60 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routePerformanceData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={(v) => `₹${v/1000}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#334155" }} width={80} />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), "Amount"]}
                  contentStyle={{ backgroundColor: "#0b192c", borderRadius: 5, border: "none", color: "#fff", fontSize: 11 }}
                />
                <Bar dataKey="collected" fill="#1e40af" radius={[0, 4, 4, 0]} name="Collected" />
                <Bar dataKey="target" fill="#cbd5e1" radius={[0, 4, 4, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Live Collections Feed */}
        <div className="lg:col-span-2 surface-card flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-slate-800">Recent Collections & Thermal Receipts</h2>
              <p className="text-[10px] text-slate-500">Live transaction stream with instant printable vouchers</p>
            </div>
            <button
              onClick={() => onSelectTab('collections')}
              className="text-[10px] text-[#1e40af] hover:underline font-semibold"
            >
              Full Ledger ({collections.length})
            </button>
          </div>

          <div className="overflow-x-auto mt-2 flex-1">
            <table className="dense-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Customer</th>
                  <th>Route / Agent</th>
                  <th>Mode</th>
                  <th>Amount</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {collections.slice(0, 5).map((col) => (
                  <tr key={col.id} className="hover:bg-blue-50/40">
                    <td className="font-mono font-medium text-[#1e40af]">
                      {col.receiptNumber}
                    </td>
                    <td>
                      <p className="font-semibold text-slate-900 leading-tight">{col.customerName}</p>
                      <p className="text-[10px] text-slate-500">{col.customerCode}</p>
                    </td>
                    <td>
                      <p className="text-[11px] text-slate-700 font-medium truncate max-w-[140px]">{col.routeName.split(" - ")[0]}</p>
                      <p className="text-[10px] text-slate-500">{col.agentName}</p>
                    </td>
                    <td>
                      <span className={`inline-block px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold ${
                        col.paymentMethod === 'UPI'
                          ? 'bg-purple-100 text-purple-700'
                          : col.paymentMethod === 'CASH'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {col.paymentMethod}
                      </span>
                    </td>
                    <td className="font-bold text-slate-900">
                      {formatINR(col.amount)}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => onViewReceipt(col)}
                        className="btn-outline-navy text-[10px] py-0.5 px-2"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Critical Overdue & Recovery Watchlist */}
      <div className="surface-card">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <div>
              <h2 className="text-xs font-bold text-slate-800">Critical Overdue & High-Risk Watchlist</h2>
              <p className="text-[10px] text-slate-500">Accounts with overdue installments prioritized for field agent recovery</p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('loans')}
            className="text-[10px] text-rose-600 hover:underline font-semibold"
          >
            Manage Loans
          </button>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="dense-table">
            <thead>
              <tr>
                <th>Loan No</th>
                <th>Customer & Contact</th>
                <th>Area / Route</th>
                <th>Type</th>
                <th>EMI Amount</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {overdueLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-slate-400">
                    No overdue accounts currently flagged.
                  </td>
                </tr>
              ) : (
                overdueLoans.map((ln) => (
                  <tr key={ln.id} className="bg-red-50/30">
                    <td className="font-mono font-semibold text-slate-800">
                      {ln.loanNumber}
                    </td>
                    <td>
                      <p className="font-bold text-slate-900">{ln.customerName}</p>
                      <p className="text-[10px] text-slate-600">{ln.customerPhone}</p>
                    </td>
                    <td>
                      <p className="text-[11px] font-medium">{ln.areaName}</p>
                      <p className="text-[10px] text-slate-500">{ln.routeName.split(" - ")[0]}</p>
                    </td>
                    <td>
                      <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-[5px]">
                        {ln.loanType}
                      </span>
                    </td>
                    <td className="font-semibold text-slate-800">
                      {formatINR(ln.installmentAmount)}
                    </td>
                    <td className="font-bold text-rose-600">
                      {formatINR(ln.outstandingBalance)}
                    </td>
                    <td>
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-[5px] border border-rose-300">
                        {ln.status}
                      </span>
                    </td>
                    <td className="text-right space-x-1">
                      <button
                        onClick={() => onOpenQuickCollect(ln.id)}
                        className="btn-emerald text-[10px] py-0.5 px-2"
                      >
                        Collect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
