"use client";

import React, { useState } from "react";
import { Area, Customer, Loan, Route, User } from "@/types";
import { formatINR } from "@/lib/storage";
import {
  WalletCards,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileSpreadsheet,
  Receipt,
  ArrowUpRight,
  Sparkles,
  Layers
} from "lucide-react";

interface LoanManagementProps {
  loans: Loan[];
  customers: Customer[];
  areas: Area[];
  routes: Route[];
  users: User[];
  currentRole?: 'ADMIN' | 'AGENT';
  onOpenNewLoan: () => void;
  onOpenQuickCollect: (loanId?: string) => void;
  onViewSchedule: (loan: Loan) => void;
}

export const LoanManagement: React.FC<LoanManagementProps> = ({
  loans,
  customers,
  areas,
  routes,
  users,
  currentRole = 'ADMIN',
  onOpenNewLoan,
  onOpenQuickCollect,
  onViewSchedule,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<Loan | null>(null);

  const filteredLoans = loans.filter((l) => {
    const matchesSearch =
      l.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerPhone.includes(searchTerm) ||
      l.areaName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "ALL" || l.loanType === typeFilter;
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-3 pb-8">
      {/* Header Banner */}
      <div className="surface-card bg-gradient-to-r from-[#0b192c] to-[#0f2744] text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">
              {currentRole === 'AGENT' ? 'My Assigned Loan Accounts' : 'Loan Portfolio & Underwriting'}
            </span>
            <span className="bg-blue-900/80 text-blue-200 text-[10px] px-1.5 py-0.5 rounded-[5px] border border-blue-700">
              Weekly • Monthly • Daily • Products
            </span>
          </div>
          <h1 className="text-base font-bold text-white mt-0.5">
            {currentRole === 'AGENT' ? 'Borrower Repayment Balances & Installment Status' : 'Loan Disbursements, Schedules & Repayment Balances'}
          </h1>
          <p className="text-xs text-slate-300">
            {currentRole === 'AGENT'
              ? 'Track borrower installment schedules, collect weekly/monthly EMIs, and monitor outstanding balances.'
              : 'Track microfinance contracts, generate installment schedules, and monitor outstanding principal & interest.'}
          </p>
        </div>

        {currentRole === 'ADMIN' && (
          <button
            onClick={onOpenNewLoan}
            className="btn-navy-accent flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Disburse New Loan</span>
          </button>
        )}
      </div>

      {/* Filtering Toolbar */}
      <div className="surface-card p-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-[5px] text-xs">
            {(["ALL", "ACTIVE", "OVERDUE", "CLOSED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 font-semibold rounded-[5px] transition-colors ${
                  statusFilter === st
                    ? "bg-[#0b192c] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st === "ALL" ? `All Loans (${loans.length})` : st}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-[5px] text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Finance Types</option>
              <option value="WEEKLY">Weekly Finance</option>
              <option value="MONTHLY">Monthly Finance</option>
              <option value="DAILY">Daily Collections</option>
              <option value="PRODUCT_FINANCE">Product Financing</option>
            </select>
          </div>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search loan #, customer, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dense-input pl-8"
          />
        </div>
      </div>

      {/* Loans Table */}
      <div className="surface-card">
        <div className="overflow-x-auto">
          <table className="dense-table">
            <thead>
              <tr>
                <th>Loan No</th>
                <th>Borrower</th>
                <th>Type</th>
                <th>Principal</th>
                {currentRole === 'ADMIN' && <th>Interest (Profit)</th>}
                <th>Installment (EMI)</th>
                <th>Weeks / Paid Progress</th>
                <th>Total Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={currentRole === 'ADMIN' ? 11 : 10} className="text-center py-6 text-slate-400">
                    No loan records match your search filters.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((l) => {
                  const unit = l.loanType === 'WEEKLY' ? 'Wks' : l.loanType === 'MONTHLY' ? 'Mos' : l.loanType === 'DAILY' ? 'Days' : 'EMIs';
                  const paidWeeks = Math.min(
                    l.durationUnits,
                    Math.max(
                      l.installments?.filter((i) => i.status === 'PAID').length || 0,
                      Math.round(l.totalPaidAmount / (l.installmentAmount || 1))
                    )
                  );
                  const remainingWeeks = Math.max(0, l.durationUnits - paidWeeks);
                  const percent = l.durationUnits > 0 ? Math.min(100, Math.round((paidWeeks / l.durationUnits) * 100)) : 0;

                  return (
                    <tr key={l.id} className="hover:bg-blue-50/30">
                      <td className="font-mono font-bold text-[#1e40af]">
                        {l.loanNumber}
                      </td>
                      <td>
                        <p className="font-bold text-slate-900 leading-tight">{l.customerName}</p>
                        <p className="text-[10px] text-slate-500">{l.customerCode} • {l.areaName}</p>
                      </td>
                      <td>
                        <span className={`inline-block px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold ${
                          l.loanType === 'WEEKLY'
                            ? 'bg-blue-50 text-[#1e40af] border border-blue-200'
                            : l.loanType === 'MONTHLY'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : l.loanType === 'PRODUCT_FINANCE'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {l.loanType === 'PRODUCT_FINANCE' ? 'PRODUCT' : l.loanType}
                        </span>
                      </td>
                      <td className="font-bold text-slate-900">
                        {formatINR(l.principalAmount)}
                      </td>
                      {currentRole === 'ADMIN' && (
                        <td className="text-emerald-700 font-semibold text-[11px]">
                          {formatINR(l.totalInterestAmount)} ({l.interestRatePercentage}%)
                        </td>
                      )}
                      <td className="font-semibold text-slate-800">
                        {formatINR(l.installmentAmount)}
                        <span className="text-[9px] text-slate-500 ml-1">
                          /{l.loanType === 'WEEKLY' ? 'wk' : l.loanType === 'MONTHLY' ? 'mo' : 'day'}
                        </span>
                      </td>
                      {/* Detailed Weeks / Installments Paid Column */}
                      <td className="min-w-[130px]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-emerald-700">
                            {paidWeeks} / {l.durationUnits} {unit} Paid
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden my-0.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              percent === 100 ? "bg-emerald-600" : percent > 50 ? "bg-blue-600" : "bg-amber-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {remainingWeeks === 0 ? (
                            <span className="text-emerald-600 font-bold">✓ Fully Completed</span>
                          ) : (
                            <span>Pending: <strong className="text-slate-800 font-bold">{remainingWeeks} {unit}</strong> left</span>
                          )}
                        </div>
                      </td>
                      <td className="font-semibold text-emerald-700">
                        {formatINR(l.totalPaidAmount)}
                      </td>
                      <td className={`font-bold ${l.status === 'OVERDUE' ? 'text-rose-600' : 'text-slate-900'}`}>
                        {formatINR(l.outstandingBalance)}
                      </td>
                      <td>
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] ${
                          l.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : l.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="text-right space-x-1">
                        <button
                          onClick={() => setSelectedLoanForSchedule(l)}
                          className="btn-outline-navy text-[10px] py-0.5 px-2"
                          title="View Full Installment Timeline"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => onOpenQuickCollect(l.id)}
                          className="btn-emerald text-[10px] py-0.5 px-2"
                        >
                          Collect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Installment Schedule Breakdown Modal */}
      {selectedLoanForSchedule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white border border-slate-300 w-full max-w-2xl rounded-[5px] shadow-dropdown overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-3 bg-[#0b192c] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Loan Schedule: {selectedLoanForSchedule.loanNumber}
                </h3>
                <p className="text-[10px] text-blue-300">
                  {selectedLoanForSchedule.customerName} ({selectedLoanForSchedule.customerCode}) • {selectedLoanForSchedule.loanType} Finance
                </p>
              </div>
              <button
                onClick={() => setSelectedLoanForSchedule(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {(() => {
              const unit = selectedLoanForSchedule.loanType === 'WEEKLY' ? 'Weeks' : selectedLoanForSchedule.loanType === 'MONTHLY' ? 'Months' : selectedLoanForSchedule.loanType === 'DAILY' ? 'Days' : 'EMIs';
              const paidUnits = Math.min(
                selectedLoanForSchedule.durationUnits,
                Math.max(
                  selectedLoanForSchedule.installments?.filter((i) => i.status === 'PAID').length || 0,
                  Math.round(selectedLoanForSchedule.totalPaidAmount / (selectedLoanForSchedule.installmentAmount || 1))
                )
              );
              const remainingUnits = Math.max(0, selectedLoanForSchedule.durationUnits - paidUnits);
              const percent = selectedLoanForSchedule.durationUnits > 0 ? Math.min(100, Math.round((paidUnits / selectedLoanForSchedule.durationUnits) * 100)) : 0;

              return (
                <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2.5 text-xs">
                  <div className={`grid grid-cols-2 ${currentRole === 'ADMIN' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-2`}>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Principal Disbursed</span>
                      <p className="font-bold text-slate-900">{formatINR(selectedLoanForSchedule.principalAmount)}</p>
                    </div>
                    {currentRole === 'ADMIN' && (
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">Interest Profit</span>
                        <p className="font-bold text-emerald-700">{formatINR(selectedLoanForSchedule.totalInterestAmount)}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Recoverable</span>
                      <p className="font-bold text-slate-900">{formatINR(selectedLoanForSchedule.totalRepayableAmount)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Outstanding Due</span>
                      <p className="font-bold text-rose-600">{formatINR(selectedLoanForSchedule.outstandingBalance)}</p>
                    </div>
                  </div>

                  {/* Weeks Repayment Highlight */}
                  <div className="bg-white p-2 rounded-[5px] border border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        Tenure Repayment Progress: <strong className="text-emerald-700 font-bold">{paidUnits} of {selectedLoanForSchedule.durationUnits} {unit} Paid</strong>
                      </span>
                      <span className="font-bold text-slate-700">{percent}% Completed</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden my-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${percent === 100 ? "bg-emerald-600" : percent > 50 ? "bg-blue-600" : "bg-amber-500"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Total Paid: <strong className="text-emerald-700 font-bold">{formatINR(selectedLoanForSchedule.totalPaidAmount)}</strong></span>
                      <span>
                        {remainingUnits === 0 ? (
                          <strong className="text-emerald-600 font-bold">✓ Loan Fully Settled</strong>
                        ) : (
                          <span>Pending: <strong className="text-rose-600 font-bold">{remainingUnits} {unit}</strong> remaining</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="p-3 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold text-slate-800">Installment Ledger & Scheduled Due Dates</h4>
                <span className="text-[10px] text-slate-500 font-medium">
                  Weekly / Monthly Timelines & Advance Clearance
                </span>
              </div>

              <div className="border border-slate-200 rounded-[5px] overflow-hidden">
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Scheduled Due Date</th>
                      <th>Paid On (Collection Date)</th>
                      <th>Amount Due</th>
                      <th>Paid Amount</th>
                      <th>Receipt Voucher</th>
                      <th>Repayment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const totalUnits = selectedLoanForSchedule.durationUnits || selectedLoanForSchedule.installments.length || 1;
                      const paidUnits = Math.min(
                        totalUnits,
                        Math.max(
                          selectedLoanForSchedule.installments?.filter((i) => i.status === 'PAID').length || 0,
                          Math.round(selectedLoanForSchedule.totalPaidAmount / (selectedLoanForSchedule.installmentAmount || 1))
                        )
                      );
                      const baseDate = new Date(selectedLoanForSchedule.startDate || selectedLoanForSchedule.disbursementDate || "2026-09-20");

                      const items = Array.from({ length: totalUnits }, (_, idx) => {
                        const instNum = idx + 1;
                        const existingInst = selectedLoanForSchedule.installments?.[idx];
                        const isPaid = instNum <= paidUnits || existingInst?.status === "PAID";
                        const isNextDue = instNum === paidUnits + 1;

                        // Calculate realistic date based on loan type
                        let calculatedDueDate = existingInst?.dueDate;
                        if (!calculatedDueDate || calculatedDueDate.startsWith("2026-10-0") || (selectedLoanForSchedule.loanType === "WEEKLY" && calculatedDueDate === "2026-10-02")) {
                          const d = new Date(baseDate);
                          if (selectedLoanForSchedule.loanType === "WEEKLY") {
                            d.setDate(d.getDate() + (idx * 7));
                          } else if (selectedLoanForSchedule.loanType === "MONTHLY") {
                            d.setMonth(d.getMonth() + idx);
                          } else if (selectedLoanForSchedule.loanType === "DAILY") {
                            d.setDate(d.getDate() + idx);
                          } else {
                            d.setDate(d.getDate() + (idx * 7));
                          }
                          calculatedDueDate = d.toISOString().split("T")[0];
                        }

                        // Determine paid date
                        const actualPaidDate = isPaid
                          ? (existingInst?.paidDate || "2026-09-20")
                          : null;

                        const isAdvancePaid = isPaid && actualPaidDate && actualPaidDate < calculatedDueDate;

                        return {
                          installmentNumber: instNum,
                          dueDate: calculatedDueDate,
                          paidDate: actualPaidDate,
                          isAdvancePaid,
                          amount: selectedLoanForSchedule.installmentAmount,
                          paidAmount: isPaid ? selectedLoanForSchedule.installmentAmount : 0,
                          receiptNumber: isPaid ? (existingInst?.receiptNumber || `RCP-2026-${1000 + instNum}`) : "-",
                          status: isPaid ? "PAID" : isNextDue ? "NEXT_DUE" : "UPCOMING",
                        };
                      });

                      return items.map((inst) => (
                        <tr
                          key={inst.installmentNumber}
                          className={
                            inst.status === "PAID"
                              ? "bg-emerald-50/20"
                              : inst.status === "NEXT_DUE"
                              ? "bg-amber-50/40 font-semibold"
                              : ""
                          }
                        >
                          <td className="font-bold text-slate-700">#{inst.installmentNumber}</td>
                          <td className="font-mono text-slate-700">
                            {inst.dueDate}
                            {inst.status === "NEXT_DUE" && (
                              <span className="ml-1.5 text-[9px] bg-amber-100 text-amber-800 font-bold px-1 py-0.2 rounded-[5px]">
                                Current Due
                              </span>
                            )}
                          </td>
                          <td>
                            {inst.paidDate ? (
                              <div className="flex items-center gap-1">
                                <span className="font-mono font-bold text-slate-900">{inst.paidDate}</span>
                                {inst.isAdvancePaid && (
                                  <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1 py-0.2 rounded-[5px]">
                                    ★ Early
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">— Pending —</span>
                            )}
                          </td>
                          <td className="font-semibold text-slate-800">{formatINR(inst.amount)}</td>
                          <td className={`font-semibold ${inst.paidAmount > 0 ? "text-emerald-700" : "text-slate-400"}`}>
                            {formatINR(inst.paidAmount)}
                          </td>
                          <td className="font-mono text-[10px] text-slate-600 font-bold">
                            {inst.receiptNumber}
                          </td>
                          <td>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] inline-flex items-center gap-1 ${
                              inst.status === 'PAID'
                                ? inst.isAdvancePaid
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : inst.status === 'NEXT_DUE'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {inst.status === 'PAID'
                                ? inst.isAdvancePaid
                                  ? `★ ADVANCE (${inst.paidDate})`
                                  : `✓ PAID (${inst.paidDate})`
                                : inst.status === 'NEXT_DUE'
                                ? "⚡ DUE NOW"
                                : "ADVANCE ELIGIBLE"}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLoanForSchedule(null)}
                className="btn-outline-navy"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onOpenQuickCollect(selectedLoanForSchedule.id);
                  setSelectedLoanForSchedule(null);
                }}
                className="btn-emerald"
              >
                Collect Installment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
