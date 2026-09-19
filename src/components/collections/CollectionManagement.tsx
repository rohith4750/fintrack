"use client";

import React, { useState } from "react";
import { Collection, Customer, Loan, Route, User } from "@/types";
import { formatINR } from "@/lib/storage";
import {
  Receipt,
  Search,
  Plus,
  Calendar,
  Filter,
  CreditCard,
  Printer,
  Share2,
  CheckCircle,
  Download,
  IndianRupee,
  Smartphone
} from "lucide-react";

interface CollectionManagementProps {
  collections: Collection[];
  loans: Loan[];
  customers: Customer[];
  routes: Route[];
  users: User[];
  onOpenQuickCollect: () => void;
  onViewReceipt: (col: Collection) => void;
  onExportCSV: () => void;
}

export const CollectionManagement: React.FC<CollectionManagementProps> = ({
  collections,
  loans,
  customers,
  routes,
  users,
  onOpenQuickCollect,
  onViewReceipt,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("ALL");
  const [routeFilter, setRouteFilter] = useState<string>("ALL");

  const filteredCollections = collections.filter((c) => {
    const matchesSearch =
      c.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.upiTransactionId && c.upiTransactionId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = paymentMethodFilter === "ALL" || c.paymentMethod === paymentMethodFilter;
    const matchesRoute = routeFilter === "ALL" || c.routeName === routeFilter;

    return matchesSearch && matchesMethod && matchesRoute;
  });

  // Calculate payment method breakdowns
  const cashTotal = collections
    .filter((c) => c.paymentMethod === "CASH")
    .reduce((acc, c) => acc + c.amount, 0);

  const upiTotal = collections
    .filter((c) => c.paymentMethod === "UPI")
    .reduce((acc, c) => acc + c.amount, 0);

  const bankTotal = collections
    .filter((c) => c.paymentMethod === "BANK_TRANSFER")
    .reduce((acc, c) => acc + c.amount, 0);

  const grandTotal = cashTotal + upiTotal + bankTotal;

  return (
    <div className="space-y-3 pb-8">
      {/* Top Banner */}
      <div className="surface-card bg-gradient-to-r from-[#0b192c] to-[#0f2744] text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Cash & UPI Terminal</span>
            <span className="bg-emerald-900/80 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded-[5px] border border-emerald-700">
              Instant Thermal Receipts
            </span>
          </div>
          <h1 className="text-base font-bold text-white mt-0.5">
            Collections & Payment Receipts Ledger
          </h1>
          <p className="text-xs text-slate-300">
            Real-time transaction register, UPI reference verification, and receipt vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="btn-outline-navy bg-[#132841] text-slate-200 hover:bg-[#1b385a] border-[#22446c] flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenQuickCollect}
            className="btn-emerald flex items-center gap-1.5 font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Collection</span>
          </button>
        </div>
      </div>

      {/* Collection Breakdown Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="surface-card border-l-4 border-l-blue-600">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Collected</span>
          <p className="text-base font-bold text-slate-900 mt-0.5">{formatINR(grandTotal)}</p>
          <p className="text-[10px] text-slate-500">{collections.length} Receipts Issued</p>
        </div>

        <div className="surface-card border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Cash Collected</span>
          <p className="text-base font-bold text-emerald-700 mt-0.5">{formatINR(cashTotal)}</p>
          <p className="text-[10px] text-slate-500">Handed by field agents</p>
        </div>

        <div className="surface-card border-l-4 border-l-purple-500">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">UPI / QR Payments</span>
          <p className="text-base font-bold text-purple-700 mt-0.5">{formatINR(upiTotal)}</p>
          <p className="text-[10px] text-slate-500">GPay, PhonePe, Paytm</p>
        </div>

        <div className="surface-card border-l-4 border-l-cyan-500">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Bank Transfer / NEFT</span>
          <p className="text-base font-bold text-cyan-800 mt-0.5">{formatINR(bankTotal)}</p>
          <p className="text-[10px] text-slate-500">Direct Account Deposit</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="surface-card p-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Payment Method Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-[5px] text-xs">
            {(["ALL", "CASH", "UPI", "BANK_TRANSFER"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethodFilter(m)}
                className={`px-2.5 py-1 font-semibold rounded-[5px] transition-colors ${
                  paymentMethodFilter === m
                    ? "bg-[#0b192c] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m === "ALL" ? "All Modes" : m}
              </button>
            ))}
          </div>

          {/* Route Filter Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-[5px] text-xs">
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Routes</option>
              {routes.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipt #, customer, UPI ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dense-input pl-8"
          />
        </div>
      </div>

      {/* Collections Table */}
      <div className="surface-card">
        <div className="overflow-x-auto">
          <table className="dense-table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Loan No</th>
                <th>Route / Area</th>
                <th>Collecting Agent</th>
                <th>Method & Ref</th>
                <th>Amount</th>
                <th>Balance Left</th>
                <th className="text-right">Receipt Voucher</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-6 text-slate-400">
                    No payment records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-blue-50/30">
                    <td className="font-mono font-bold text-[#1e40af]">
                      {col.receiptNumber}
                    </td>
                    <td>
                      <p className="font-semibold text-slate-800 text-[11px]">{col.collectionDate}</p>
                      <p className="text-[10px] text-slate-500">{col.time}</p>
                    </td>
                    <td>
                      <p className="font-bold text-slate-900 leading-tight">{col.customerName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{col.customerCode}</p>
                    </td>
                    <td className="font-mono text-slate-700">
                      {col.loanNumber}
                    </td>
                    <td>
                      <p className="font-medium text-slate-800 text-[11px] truncate max-w-[120px]">{col.routeName.split(" - ")[0]}</p>
                      <p className="text-[10px] text-slate-500">{col.areaName}</p>
                    </td>
                    <td>
                      <span className="font-semibold text-slate-800 text-[11px]">{col.agentName}</span>
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
                      {col.upiTransactionId && (
                        <p className="font-mono text-[9px] text-slate-500 truncate max-w-[110px]">{col.upiTransactionId}</p>
                      )}
                    </td>
                    <td className="font-bold text-emerald-700 text-sm">
                      {formatINR(col.amount)}
                      {col.remarks && (
                        <p className="text-[9px] text-slate-500 font-normal italic truncate max-w-[130px]" title={col.remarks}>
                          {col.remarks}
                        </p>
                      )}
                    </td>
                    <td className="font-medium text-slate-700">
                      {formatINR(col.balanceAfterPayment)}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => onViewReceipt(col)}
                        className="btn-navy text-[10px] py-0.5 px-2 inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Bill</span>
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
