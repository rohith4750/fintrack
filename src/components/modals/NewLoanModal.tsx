"use client";

import React, { useState } from "react";
import { Area, Customer, Loan, LoanType, Route, User } from "@/types";
import { calculateLoanDetails, formatINR } from "@/lib/storage";
import { CreditCard, Plus, Calculator, Calendar, DollarSign, UserCheck, X } from "lucide-react";

interface NewLoanModalProps {
  customers: Customer[];
  areas: Area[];
  routes: Route[];
  users: User[];
  initialCustomerId?: string;
  onClose: () => void;
  onCreateLoan: (loan: Omit<Loan, "id" | "loanNumber" | "totalPaidAmount" | "status" | "installments">) => void;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({
  customers,
  areas,
  routes,
  users,
  initialCustomerId,
  onClose,
  onCreateLoan,
}) => {
  const [customerId, setCustomerId] = useState(initialCustomerId || customers[0]?.id || "");
  const [loanType, setLoanType] = useState<LoanType>("WEEKLY");
  const [principalAmount, setPrincipalAmount] = useState<number>(20000);
  const [interestRatePercentage, setInterestRatePercentage] = useState<number>(20);
  const [durationUnits, setDurationUnits] = useState<number>(20);
  const [disbursementDate, setDisbursementDate] = useState("2026-09-20");
  const [agentId, setAgentId] = useState(users.find((u) => u.role === "AGENT")?.id || "");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === customerId) || customers[0];
  const selectedAgent = users.find((u) => u.id === agentId) || users[1];

  const handleTypeChange = (type: LoanType) => {
    setLoanType(type);
    if (type === "WEEKLY") {
      setInterestRatePercentage(20);
      setDurationUnits(20);
    } else if (type === "MONTHLY") {
      setInterestRatePercentage(15);
      setDurationUnits(12);
    } else if (type === "DAILY") {
      setInterestRatePercentage(20);
      setDurationUnits(100);
    } else if (type === "PRODUCT_FINANCE") {
      setInterestRatePercentage(18);
      setDurationUnits(12);
    }
  };

  const { totalInterest, totalRepayable, installmentAmount } = calculateLoanDetails(
    Number(principalAmount) || 0,
    Number(interestRatePercentage) || 0,
    Number(durationUnits) || 1,
    loanType
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedCustomer) return;

    setIsSubmitting(true);

    onCreateLoan({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerCode: selectedCustomer.customerCode,
      customerPhone: selectedCustomer.mobileNumber,
      areaId: selectedCustomer.areaId,
      areaName: selectedCustomer.areaName,
      routeId: selectedCustomer.routeId,
      routeName: selectedCustomer.routeName,
      loanType,
      principalAmount: Number(principalAmount),
      interestRatePercentage: Number(interestRatePercentage),
      totalInterestAmount: totalInterest,
      totalRepayableAmount: totalRepayable,
      installmentAmount,
      durationUnits: Number(durationUnits),
      disbursementDate,
      startDate: "2026-09-27",
      endDate: "2027-02-15",
      outstandingBalance: totalRepayable,
      nextDueDate: "2026-09-27",
      agentId: selectedAgent?.id || "USR-02",
      agentName: selectedAgent?.name || "Ramesh Varma",
      remarks: remarks || `${loanType} finance disbursed at branch counter`,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 50);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-white border border-slate-300 w-full max-w-xl p-4 rounded-[5px] shadow-dropdown space-y-3 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-[#1e40af]" />
            <h2 className="text-sm font-bold text-slate-900">Disburse New Loan (Finance Contract)</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Customer Selection */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700">Select Borrower / Customer *</label>
            <select
              value={customerId}
              onChange={(e) => {
                const newCId = e.target.value;
                setCustomerId(newCId);
                const c = customers.find((cust) => cust.id === newCId);
                if (c?.assignedAgentId) {
                  setAgentId(c.assignedAgentId);
                }
              }}
              className="dense-select mt-0.5"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customerCode}) — {c.areaName} ({c.routeName.split(" - ")[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Finance Type Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700">Finance Scheme Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-0.5">
              {(["WEEKLY", "MONTHLY", "DAILY", "PRODUCT_FINANCE"] as LoanType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-[5px] border text-center transition-all ${
                    loanType === t
                      ? "bg-[#0b192c] text-white border-[#0b192c] shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {t === "WEEKLY" ? "Weekly Finance" : t === "MONTHLY" ? "Monthly Finance" : t === "DAILY" ? "Daily Collection" : "Product EMI"}
                </button>
              ))}
            </div>
          </div>

          {/* Principal & Interest */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-700">Principal Amount (₹) *</label>
              <input
                type="number"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                className="dense-input mt-0.5 font-bold text-slate-900"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700">Interest Rate (%) *</label>
              <input
                type="number"
                value={interestRatePercentage}
                onChange={(e) => setInterestRatePercentage(Number(e.target.value))}
                className="dense-input mt-0.5"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700">
                Duration ({loanType === "WEEKLY" ? "Weeks" : loanType === "MONTHLY" ? "Months" : "Days"}) *
              </label>
              <input
                type="number"
                value={durationUnits}
                onChange={(e) => setDurationUnits(Number(e.target.value))}
                className="dense-input mt-0.5 font-bold"
                required
              />
            </div>
          </div>

          {/* Agent & Disbursement Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-700">Assigned Recovery Officer / Agent (or Admin) *</label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="dense-select mt-0.5 font-medium text-slate-800"
                required
              >
                {users.map((u) => (
                  <option key={u.id || u.userId} value={u.id || u.userId}>
                    {u.name} ({u.role}) — {u.phone || u.loginId}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700">Disbursement Date *</label>
              <input
                type="date"
                value={disbursementDate}
                onChange={(e) => setDisbursementDate(e.target.value)}
                className="dense-input mt-0.5"
                required
              />
            </div>
          </div>

          {/* Real-time Calculation Summary Box */}
          <div className="bg-[#0b192c] text-white p-3 rounded-[5px] space-y-1.5 text-xs">
            <div className="flex items-center justify-between border-b border-[#193555] pb-1.5">
              <span className="text-[11px] text-blue-300 font-bold uppercase">Live Schedule Calculation</span>
              <span className="text-emerald-400 font-bold">{interestRatePercentage}% Flat Scheme</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Total Interest</span>
                <p className="font-bold text-emerald-400">{formatINR(totalInterest)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Total Repayable</span>
                <p className="font-bold text-white">{formatINR(totalRepayable)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">EMI Installment</span>
                <p className="font-bold text-sky-400 text-sm">{formatINR(installmentAmount)}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700">Disbursement Remarks / Purpose</label>
            <input
              type="text"
              placeholder="e.g. Working capital inventory expansion"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="dense-input mt-0.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-navy"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-navy-accent font-bold"
            >
              {isSubmitting ? "Disbursing..." : "Disburse & Issue Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
