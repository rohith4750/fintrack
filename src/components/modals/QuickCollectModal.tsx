"use client";

import React, { useState, useEffect } from "react";
import { Collection, Customer, Loan, PaymentMethod, Route, User } from "@/types";
import { formatINR } from "@/lib/storage";
import {
  Receipt,
  PlusCircle,
  QrCode,
  IndianRupee,
  Smartphone,
  CreditCard,
  Building,
  CheckCircle,
  X
} from "lucide-react";

interface QuickCollectModalProps {
  loans: Loan[];
  customers: Customer[];
  users: User[];
  routes: Route[];
  initialLoanId?: string;
  onClose: () => void;
  onRecordCollection: (collection: Omit<Collection, "id" | "receiptNumber">) => void;
}

export const QuickCollectModal: React.FC<QuickCollectModalProps> = ({
  loans,
  customers,
  users,
  routes,
  initialLoanId,
  onClose,
  onRecordCollection,
}) => {
  const activeLoans = loans.filter((l) => l.status !== "CLOSED");
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    initialLoanId || activeLoans[0]?.id || ""
  );

  const selectedLoan = loans.find((l) => l.id === selectedLoanId) || activeLoans[0];

  const [amount, setAmount] = useState<number>(selectedLoan?.installmentAmount || 600);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [upiTransactionId, setUpiTransactionId] = useState<string>("");
  const [agentId, setAgentId] = useState<string>(
    users.find((u) => u.role === "AGENT")?.id || "USR-02"
  );
  const [remarks, setRemarks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedLoan) {
      setAmount(selectedLoan.installmentAmount);
    }
  }, [selectedLoanId, selectedLoan]);

  const selectedAgent = users.find((u) => u.id === agentId) || users[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedLoan) return;

    setIsSubmitting(true);
    const now = new Date();
    const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const currentTime = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;

    const remainingBalance = Math.max(0, selectedLoan.outstandingBalance - Number(amount));
    const emiCount = Math.max(1, Math.round(Number(amount) / (selectedLoan.installmentAmount || 1)));
    const defaultRemarks = emiCount > 1
      ? `Advance collection of ${emiCount} EMIs paid on ${currentDate} via ${paymentMethod}`
      : `EMI installment collected on ${currentDate} via ${paymentMethod}`;

    onRecordCollection({
      customerId: selectedLoan.customerId,
      customerName: selectedLoan.customerName,
      customerCode: selectedLoan.customerCode,
      loanId: selectedLoan.id,
      loanNumber: selectedLoan.loanNumber,
      agentId: selectedAgent?.id || "USR-02",
      agentName: selectedAgent?.name || "Ramesh Varma",
      amount: Number(amount),
      paymentMethod,
      upiTransactionId: paymentMethod === "UPI" ? upiTransactionId || `UPI/${Date.now().toString().slice(-8)}/HDFC` : undefined,
      collectionDate: currentDate,
      time: currentTime,
      areaName: selectedLoan.areaName,
      routeName: selectedLoan.routeName,
      balanceAfterPayment: remainingBalance,
      remarks: remarks || defaultRemarks,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 50);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-white border border-slate-300 w-full max-w-lg rounded-[5px] shadow-dropdown overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-3 bg-[#0b192c] text-white flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white">Record EMI / Daily Collection</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto text-xs">
          {/* Select Loan */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700">Select Active Loan Account *</label>
            <select
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              className="dense-select mt-0.5"
              required
            >
              {activeLoans.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.customerName} ({l.loanNumber}) — Bal: {formatINR(l.outstandingBalance)}
                </option>
              ))}
            </select>
          </div>

          {/* Borrower Information Card */}
          {selectedLoan && (() => {
            const unit = selectedLoan.loanType === 'WEEKLY' ? 'Week' : selectedLoan.loanType === 'MONTHLY' ? 'Month' : selectedLoan.loanType === 'DAILY' ? 'Day' : 'EMI';
            const unitPlural = selectedLoan.loanType === 'WEEKLY' ? 'Weeks' : selectedLoan.loanType === 'MONTHLY' ? 'Months' : selectedLoan.loanType === 'DAILY' ? 'Days' : 'EMIs';
            const paidUnits = Math.min(
              selectedLoan.durationUnits,
              Math.max(
                selectedLoan.installments?.filter((i) => i.status === 'PAID').length || 0,
                Math.round(selectedLoan.totalPaidAmount / (selectedLoan.installmentAmount || 1))
              )
            );
            const nextUnitNum = Math.min(selectedLoan.durationUnits, paidUnits + 1);
            const remainingUnits = Math.max(0, selectedLoan.durationUnits - paidUnits);
            const percent = selectedLoan.durationUnits > 0 ? Math.min(100, Math.round((paidUnits / selectedLoan.durationUnits) * 100)) : 0;

            return (
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-[5px] space-y-1.5">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-slate-900">{selectedLoan.customerName}</span>
                  <span className="font-mono text-blue-900 font-bold">{selectedLoan.customerCode}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Route: {selectedLoan.routeName.split(" - ")[0]}</span>
                  <span>Type: <strong className="text-slate-800">{selectedLoan.loanType}</strong></span>
                </div>

                {/* Weeks Repayment Progress Banner */}
                <div className="bg-white p-2 rounded-[5px] border border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">
                      Repayment Progress: <strong className="text-emerald-700 font-bold">{paidUnits} of {selectedLoan.durationUnits} {unitPlural} Paid</strong>
                    </span>
                    <span className="font-bold text-slate-700">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${percent === 100 ? "bg-emerald-600" : percent > 50 ? "bg-blue-600" : "bg-amber-500"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Collecting: <strong className="text-[#1e40af] font-bold">{unit} #{nextUnitNum}</strong></span>
                    <span>Remaining: <strong className="text-slate-800 font-bold">{remainingUnits} {unitPlural}</strong></span>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200">
                  <span>Current Outstanding:</span>
                  <span className="font-bold text-rose-600">{formatINR(selectedLoan.outstandingBalance)}</span>
                </div>
              </div>
            );
          })()}

          {/* Advance EMI Preset Selector */}
          {selectedLoan && (() => {
            const unit = selectedLoan.loanType === 'WEEKLY' ? 'Wk' : selectedLoan.loanType === 'MONTHLY' ? 'Mo' : 'Day';
            const baseEmi = selectedLoan.installmentAmount || 1;
            const paidUnits = Math.min(
              selectedLoan.durationUnits,
              Math.max(
                selectedLoan.installments?.filter((i) => i.status === 'PAID').length || 0,
                Math.round(selectedLoan.totalPaidAmount / baseEmi)
              )
            );
            const remainingUnits = Math.max(0, selectedLoan.durationUnits - paidUnits);
            const emiCount = Math.max(1, Math.round(amount / baseEmi));
            const baseDate = new Date(selectedLoan.startDate || selectedLoan.disbursementDate || "2026-09-20");

            // Calculate upcoming covered installment dates
            const coveredDates = Array.from({ length: Math.min(emiCount, remainingUnits) }, (_, i) => {
              const instNum = paidUnits + 1 + i;
              const d = new Date(baseDate);
              if (selectedLoan.loanType === "WEEKLY") {
                d.setDate(d.getDate() + ((instNum - 1) * 7));
              } else if (selectedLoan.loanType === "MONTHLY") {
                d.setMonth(d.getMonth() + (instNum - 1));
              } else {
                d.setDate(d.getDate() + (instNum - 1));
              }
              return {
                instNum,
                dateStr: d.toISOString().split("T")[0],
                isAdvance: i > 0,
              };
            });

            return (
              <div className="space-y-2">
                {/* Advance Quick Multipliers */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-700">Quick Select Weeks / Advance Payment</label>
                    <span className="text-[10px] text-blue-700 font-bold">₹{baseEmi} / {unit}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mt-1">
                    {[1, 2, 3, 4].map((multiplier) => {
                      if (multiplier > remainingUnits) return null;
                      const targetAmt = baseEmi * multiplier;
                      const isSelected = amount === targetAmt;
                      return (
                        <button
                          key={multiplier}
                          type="button"
                          onClick={() => setAmount(targetAmt)}
                          className={`py-1.5 px-1 rounded-[5px] text-[11px] font-bold border transition-all text-center ${
                            isSelected
                              ? "bg-[#0b192c] text-white border-[#0b192c] shadow-sm ring-1 ring-[#1e40af]"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <div>{multiplier} {unit}{multiplier > 1 ? "s" : ""}</div>
                          <div className={`text-[10px] font-mono ${isSelected ? "text-emerald-300" : "text-slate-500"}`}>
                            {formatINR(targetAmt)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Covered Dates Clearance Box */}
                {coveredDates.length > 0 && (
                  <div className="bg-blue-50/60 border border-blue-200 p-2 rounded-[5px] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                      <span>🗓️ Clearing {coveredDates.length} Installment{coveredDates.length > 1 ? "s (Advance Payment)" : " (Due Date)"}:</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-[5px]">
                        {coveredDates.length > 1 ? `${coveredDates.length} Weeks Advance` : "Regular Due"}
                      </span>
                    </div>
                    <div className="space-y-0.5 pt-0.5">
                      {coveredDates.map((item) => (
                        <div key={item.instNum} className="flex justify-between items-center text-[11px] text-slate-700">
                          <span className="font-semibold">
                            #{item.instNum} Due: <span className="font-mono text-slate-900 font-bold">{item.dateStr}</span>
                          </span>
                          <span className={`text-[10px] font-bold px-1 py-0.2 rounded-[5px] ${
                            item.isAdvance ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {item.isAdvance ? "★ ADVANCE" : "DUE NOW"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Payment Amount */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700">Collection Amount (₹) *</label>
            <div className="relative mt-0.5">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="dense-input pl-7 font-bold text-sm text-slate-900"
                required
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700">Payment Mode *</label>
            <div className="grid grid-cols-3 gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`py-1.5 px-2 text-xs font-semibold rounded-[5px] border flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === "CASH"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`py-1.5 px-2 text-xs font-semibold rounded-[5px] border flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === "UPI"
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("BANK_TRANSFER")}
                className={`py-1.5 px-2 text-xs font-semibold rounded-[5px] border flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "bg-[#0b192c] text-white border-[#0b192c] shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Bank NEFT</span>
              </button>
            </div>
          </div>

          {/* UPI Reference ID if UPI is chosen */}
          {paymentMethod === "UPI" && (
            <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-[5px] space-y-1.5">
              <div className="flex items-center justify-between text-purple-900 font-bold">
                <span>Scan Merchant QR & Record Reference</span>
                <span className="text-[10px] bg-purple-200 px-1.5 py-0.2 rounded-[5px]">Instant</span>
              </div>
              <input
                type="text"
                placeholder="UPI UTR / Reference ID (e.g. UPI/39021984/SBI)"
                value={upiTransactionId}
                onChange={(e) => setUpiTransactionId(e.target.value)}
                className="dense-input font-mono"
              />
            </div>
          )}

          {/* Collecting Agent */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700">Collecting Officer / Field Agent</label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="dense-select mt-0.5"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Collection Remarks */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700">Collection Remarks</label>
            <input
              type="text"
              placeholder="e.g. Paid at shop counter on time"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="dense-input mt-0.5"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-navy"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-emerald font-bold flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Recording..." : "Record & Generate Receipt"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
