"use client";

import React, { useState } from "react";
import { Expense, Loan, ProductFinanceOrder, User } from "@/types";
import { formatINR } from "@/lib/storage";
import {
  ReceiptIndianRupee,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  Fuel,
  Building,
  Users,
  Megaphone,
  Wrench,
  HelpCircle,
  FileSpreadsheet
} from "lucide-react";

interface ExpenseManagementProps {
  expenses: Expense[];
  loans: Loan[];
  productFinanceOrders: ProductFinanceOrder[];
  users: User[];
  onAddExpense: (expense: Omit<Expense, "id" | "voucherNumber">) => void;
}

export const ExpenseManagement: React.FC<ExpenseManagementProps> = ({
  expenses,
  loans,
  productFinanceOrders,
  users,
  onAddExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("FUEL");
  const [amount, setAmount] = useState<number>(1500);
  const [date, setDate] = useState("2026-09-20");
  const [paidTo, setPaidTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Expense["paymentMethod"]>("UPI");
  const [approvedBy, setApprovedBy] = useState("K. Srikanth Naidu");
  const [notes, setNotes] = useState("");

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    onAddExpense({
      category,
      title,
      amount: Number(amount),
      date,
      paidTo: paidTo || "Vendor / Staff",
      paymentMethod,
      approvedBy,
      notes,
    });

    setTitle("");
    setAmount(1500);
    setPaidTo("");
    setNotes("");
    setShowAddModal(false);
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "ALL" || exp.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalInterestIncome = loans.reduce((acc, l) => acc + (l.totalInterestAmount * (l.totalPaidAmount / (l.totalRepayableAmount || 1))), 0);
  const totalProductMargins = productFinanceOrders.reduce((acc, p) => acc + p.profitMargin, 0);
  const totalGrossIncome = totalInterestIncome + totalProductMargins;
  const netProfit = Math.round(totalGrossIncome - totalExpenses);

  const getCategoryIcon = (cat: Expense["category"]) => {
    switch (cat) {
      case "FUEL":
        return <Fuel className="w-3.5 h-3.5 text-amber-600" />;
      case "OFFICE_RENT":
        return <Building className="w-3.5 h-3.5 text-blue-600" />;
      case "SALARIES":
        return <Users className="w-3.5 h-3.5 text-emerald-600" />;
      case "MARKETING":
        return <Megaphone className="w-3.5 h-3.5 text-purple-600" />;
      case "VEHICLE_MAINTENANCE":
        return <Wrench className="w-3.5 h-3.5 text-slate-600" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Top Banner */}
      <div className="surface-card bg-gradient-to-r from-[#0b192c] to-[#0f2744] text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Operational Accounting</span>
            <span className="bg-rose-900/80 text-rose-200 text-[10px] px-1.5 py-0.5 rounded-[5px] border border-rose-700">
              Vouchers & Real-time P&L
            </span>
          </div>
          <h1 className="text-base font-bold text-white mt-0.5">
            Operational Expenses & Business Profitability
          </h1>
          <p className="text-xs text-slate-300">
            Record fuel allowances, salaries, office rents, marketing promotions, and calculate net operating margins.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-navy-accent flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Expense Voucher</span>
        </button>
      </div>

      {/* P&L Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="surface-card border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Gross Revenue & Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-base font-bold text-emerald-700 mt-1">{formatINR(totalGrossIncome)}</p>
          <p className="text-[10px] text-slate-500">Interest Collections + Product Financing</p>
        </div>

        <div className="surface-card border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-base font-bold text-rose-600 mt-1">{formatINR(totalExpenses)}</p>
          <p className="text-[10px] text-slate-500">{expenses.length} Approved Vouchers</p>
        </div>

        <div className="surface-card border-l-4 border-l-[#1e40af]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Net Business Profit</span>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-[5px]">NET</span>
          </div>
          <p className="text-base font-bold text-[#1e40af] mt-1">{formatINR(netProfit)}</p>
          <p className="text-[10px] text-slate-500">Net operating margin after all overheads</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="surface-card p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-[5px] text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="FUEL">Fuel & Travel</option>
            <option value="SALARIES">Salaries & Incentives</option>
            <option value="OFFICE_RENT">Office Rent</option>
            <option value="MARKETING">Marketing & Promo</option>
            <option value="VEHICLE_MAINTENANCE">Vehicle Maintenance</option>
            <option value="MISCELLANEOUS">Miscellaneous</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search voucher, payee or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dense-input pl-8"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="surface-card">
        <div className="overflow-x-auto">
          <table className="dense-table">
            <thead>
              <tr>
                <th>Voucher #</th>
                <th>Date</th>
                <th>Category</th>
                <th>Expense Description</th>
                <th>Paid To / Vendor</th>
                <th>Payment Mode</th>
                <th>Approved By</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-400">
                    No expense vouchers match your filter.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-blue-50/30">
                    <td className="font-mono font-bold text-[#1e40af]">
                      {exp.voucherNumber}
                    </td>
                    <td className="font-mono text-[11px] text-slate-600">
                      {exp.date}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                        {getCategoryIcon(exp.category)}
                        {exp.category.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-900 text-xs">{exp.title}</p>
                      {exp.notes && <p className="text-[10px] text-slate-500">{exp.notes}</p>}
                    </td>
                    <td className="text-[11px] font-medium text-slate-700">
                      {exp.paidTo}
                    </td>
                    <td>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] bg-slate-100 text-slate-700">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="text-[10px] text-slate-600">
                      {exp.approvedBy}
                    </td>
                    <td className="text-right font-bold text-rose-600 text-sm">
                      {formatINR(exp.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Voucher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white border border-slate-300 w-full max-w-md p-4 rounded-[5px] shadow-dropdown space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Record Operational Expense Voucher</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Expense Title / Reason *</label>
                <input
                  type="text"
                  placeholder="e.g. Agent Fuel Allowance for Kakinada Route"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="dense-input mt-0.5"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Category *</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="dense-select mt-0.5"
                  >
                    <option value="FUEL">Fuel & Travel</option>
                    <option value="SALARIES">Salaries & Staff</option>
                    <option value="OFFICE_RENT">Office Rent</option>
                    <option value="MARKETING">Marketing & Ads</option>
                    <option value="VEHICLE_MAINTENANCE">Vehicle Maintenance</option>
                    <option value="MISCELLANEOUS">Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Amount (₹) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="dense-input mt-0.5 font-bold text-rose-600"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Paid To (Beneficiary)</label>
                  <input
                    type="text"
                    placeholder="Staff name / Petrol pump / Landlord"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="dense-input mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Payment Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="dense-select mt-0.5"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="BANK_TRANSFER">Bank NEFT/IMPS</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Remarks / Bill Notes</label>
                <textarea
                  placeholder="Voucher details or bill reference..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="dense-input mt-0.5 h-14 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline-navy"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-navy-accent">
                  Save Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
