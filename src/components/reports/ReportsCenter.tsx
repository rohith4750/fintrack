"use client";

import React, { useState } from "react";
import { Area, Collection, Customer, Expense, Loan, ProductFinanceOrder, Route, User } from "@/types";
import { formatINR } from "@/lib/storage";
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  FileSpreadsheet,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle,
  ReceiptIndianRupee
} from "lucide-react";

interface ReportsCenterProps {
  collections: Collection[];
  loans: Loan[];
  customers: Customer[];
  expenses: Expense[];
  productFinanceOrders: ProductFinanceOrder[];
  routes: Route[];
  users: User[];
  areas: Area[];
  onExportCSV: (reportType: string) => void;
}

export const ReportsCenter: React.FC<ReportsCenterProps> = ({
  collections,
  loans,
  customers,
  expenses,
  productFinanceOrders,
  routes,
  users,
  areas,
  onExportCSV,
}) => {
  const [reportTab, setReportTab] = useState<"COLLECTIONS" | "DEFAULTERS" | "PL" | "AGENTS">("COLLECTIONS");

  // Calculations for P&L
  const totalInterestIncome = loans.reduce((acc, l) => acc + (l.totalInterestAmount * (l.totalPaidAmount / (l.totalRepayableAmount || 1))), 0);
  const totalProductProfits = productFinanceOrders.reduce((acc, p) => acc + p.profitMargin, 0);
  const totalGrossRevenue = totalInterestIncome + totalProductProfits;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = Math.round(totalGrossRevenue - totalExpenses);

  // Defaulters
  const overdueLoans = loans.filter((l) => l.status === "OVERDUE" || l.status === "DEFAULTED");

  return (
    <div className="space-y-3 pb-8">
      {/* Banner */}
      <div className="surface-card bg-gradient-to-r from-[#0b192c] to-[#0f2744] text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Business Intelligence</span>
            <span className="bg-blue-900/80 text-blue-200 text-[10px] px-1.5 py-0.5 rounded-[5px] border border-blue-700">
              Audited Ledger Reports
            </span>
          </div>
          <h1 className="text-base font-bold text-white mt-0.5">
            Financial Statements, Defaulters & Audit Reports
          </h1>
          <p className="text-xs text-slate-300">
            Generate printable route reports, analyze recovery efficiency, track defaulters, and export accounting ledgers.
          </p>
        </div>

        <button
          onClick={() => onExportCSV(reportTab)}
          className="btn-emerald flex items-center gap-1.5 font-bold"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export {reportTab} CSV</span>
        </button>
      </div>

      {/* Report Tabs */}
      <div className="surface-card p-2 flex flex-wrap items-center gap-1.5 bg-slate-100">
        <button
          onClick={() => setReportTab("COLLECTIONS")}
          className={`px-3 py-1 text-xs font-semibold rounded-[5px] transition-colors ${
            reportTab === "COLLECTIONS"
              ? "bg-[#0b192c] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white"
          }`}
        >
          Route Collection Report
        </button>
        <button
          onClick={() => setReportTab("DEFAULTERS")}
          className={`px-3 py-1 text-xs font-semibold rounded-[5px] transition-colors ${
            reportTab === "DEFAULTERS"
              ? "bg-[#0b192c] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white"
          }`}
        >
          Overdue & Defaulters ({overdueLoans.length})
        </button>
        <button
          onClick={() => setReportTab("PL")}
          className={`px-3 py-1 text-xs font-semibold rounded-[5px] transition-colors ${
            reportTab === "PL"
              ? "bg-[#0b192c] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white"
          }`}
        >
          Profit & Loss Statement
        </button>
        <button
          onClick={() => setReportTab("AGENTS")}
          className={`px-3 py-1 text-xs font-semibold rounded-[5px] transition-colors ${
            reportTab === "AGENTS"
              ? "bg-[#0b192c] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white"
          }`}
        >
          Agent Performance Matrix
        </button>
      </div>

      {/* Tab 1: ROUTE COLLECTIONS */}
      {reportTab === "COLLECTIONS" && (
        <div className="surface-card space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-800">Daily Route Collection Performance Summary</h2>
            <span className="text-[10px] text-slate-500 font-mono">Date: 2026-09-20</span>
          </div>

          <table className="dense-table">
            <thead>
              <tr>
                <th>Route Code & Name</th>
                <th>Area</th>
                <th>Assigned Agent</th>
                <th>Frequency</th>
                <th>Target Amount</th>
                <th>Collected Amount</th>
                <th>Deficit</th>
                <th className="text-right">Recovery Rate</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                const deficit = Math.max(0, r.todayTarget - r.todayCollected);
                const rate = Math.min(100, Math.round((r.todayCollected / (r.todayTarget || 1)) * 100));
                return (
                  <tr key={r.id}>
                    <td className="font-bold text-slate-900">{r.name}</td>
                    <td>{r.areaName}</td>
                    <td className="font-semibold text-slate-800">{r.assignedAgentName}</td>
                    <td><span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-[5px] font-bold">{r.collectionFrequency}</span></td>
                    <td className="font-medium text-slate-700">{formatINR(r.todayTarget)}</td>
                    <td className="font-bold text-emerald-700">{formatINR(r.todayCollected)}</td>
                    <td className="font-medium text-rose-600">{formatINR(deficit)}</td>
                    <td className="text-right font-bold text-[#1e40af]">{rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: DEFAULTERS */}
      {reportTab === "DEFAULTERS" && (
        <div className="surface-card space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h2 className="text-xs font-bold text-slate-800">Overdue Defaulters & High-Risk Recovery Ledger</h2>
            </div>
            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded-[5px]">
              Priority Notice List
            </span>
          </div>

          <table className="dense-table">
            <thead>
              <tr>
                <th>Loan No</th>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>Area / Route</th>
                <th>Disbursed Principal</th>
                <th>Total Overdue</th>
                <th>Status</th>
                <th>Remarks / Legal Status</th>
              </tr>
            </thead>
            <tbody>
              {overdueLoans.map((l) => (
                <tr key={l.id} className="bg-rose-50/20">
                  <td className="font-mono font-bold text-slate-900">{l.loanNumber}</td>
                  <td className="font-bold text-slate-900">{l.customerName}</td>
                  <td className="font-mono text-[11px] text-slate-700">{l.customerPhone}</td>
                  <td>{l.areaName} — {l.routeName.split(" - ")[0]}</td>
                  <td>{formatINR(l.principalAmount)}</td>
                  <td className="font-bold text-rose-600">{formatINR(l.outstandingBalance)}</td>
                  <td>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] bg-rose-100 text-rose-800 border border-rose-300">
                      {l.status}
                    </span>
                  </td>
                  <td className="text-[11px] text-slate-600">{l.remarks || "Overdue >30 days. Recovery agent assigned."}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: PROFIT & LOSS STATEMENT */}
      {reportTab === "PL" && (
        <div className="surface-card space-y-4 max-w-3xl">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold text-slate-900">Executive Profit & Loss Statement (P&L)</h2>
            <p className="text-[11px] text-slate-500">Regional Finance Operations — Coastal Andhra Hub</p>
          </div>

          {/* Revenue Section */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Operating Revenue (Income)</h3>
            <div className="border border-slate-200 rounded-[5px] p-2 space-y-1 text-xs">
              <div className="flex justify-between text-slate-700 py-1 border-b border-slate-100">
                <span>Interest Collected on Microfinance Loans (Weekly/Monthly)</span>
                <span className="font-bold text-slate-900">{formatINR(totalInterestIncome)}</span>
              </div>
              <div className="flex justify-between text-slate-700 py-1 border-b border-slate-100">
                <span>Consumer Product Financing Margin (Mobile/Appliances/Vehicles)</span>
                <span className="font-bold text-slate-900">{formatINR(totalProductProfits)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-800 pt-1">
                <span>Total Gross Operating Income</span>
                <span className="text-sm">{formatINR(totalGrossRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider">Operational Expenses (Overheads)</h3>
            <div className="border border-slate-200 rounded-[5px] p-2 space-y-1 text-xs">
              {expenses.map((exp) => (
                <div key={exp.id} className="flex justify-between text-slate-700 py-0.5 border-b border-slate-100">
                  <span>{exp.title} ({exp.category})</span>
                  <span className="font-medium text-slate-800">{formatINR(exp.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-rose-800 pt-1">
                <span>Total Operational Overheads</span>
                <span className="text-sm">{formatINR(totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-[#0b192c] text-white p-3 rounded-[5px] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-300 uppercase font-semibold">Audited Financial Performance</span>
              <h4 className="text-sm font-bold text-white">Net Operating Profit</h4>
            </div>
            <span className="text-lg font-bold text-emerald-400">{formatINR(netProfit)}</span>
          </div>
        </div>
      )}

      {/* Tab 4: AGENT PERFORMANCE */}
      {reportTab === "AGENTS" && (
        <div className="surface-card space-y-3">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-800">Agent Recovery Efficiency & Target Matrix</h2>
          </div>

          <table className="dense-table">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Contact</th>
                <th>Assigned Beat / Routes</th>
                <th>Target</th>
                <th>Collected</th>
                <th>Recovery %</th>
                <th className="text-right">Performance Grade</th>
              </tr>
            </thead>
            <tbody>
              {users.filter((u) => u.role === "AGENT").map((ag) => (
                <tr key={ag.id}>
                  <td className="font-bold text-slate-900">{ag.name}</td>
                  <td className="font-mono text-slate-600">{ag.phone}</td>
                  <td>{ag.assignedRouteIds?.join(", ") || "Active Routes"}</td>
                  <td className="font-medium text-slate-700">{formatINR(ag.todayTarget || 0)}</td>
                  <td className="font-bold text-emerald-700">{formatINR(ag.todayCollected || 0)}</td>
                  <td className="font-bold text-[#1e40af]">{ag.recoveryEfficiency}%</td>
                  <td className="text-right">
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-[5px]">
                      Grade A (Top Performer)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
