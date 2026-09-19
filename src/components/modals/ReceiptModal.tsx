"use client";

import React from "react";
import { Collection } from "@/types";
import { formatINR } from "@/lib/storage";
import { Printer, Share2, CheckCircle2, Sparkles, X, Smartphone, Copy } from "lucide-react";

interface ReceiptModalProps {
  collection: Collection | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ collection, onClose }) => {
  if (!collection) return null;

  const handlePrint = () => {
    window.print();
  };

  const shareText = `*FINTRACK COLLECTION RECEIPT*%0A*Receipt No:* ${collection.receiptNumber}%0A*Customer:* ${collection.customerName} (${collection.customerCode})%0A*Loan:* ${collection.loanNumber}%0A*Amount Paid:* ${formatINR(collection.amount)}%0A*Mode:* ${collection.paymentMethod}%0A*Date:* ${collection.collectionDate} ${collection.time}%0A*Remaining Balance:* ${formatINR(collection.balanceAfterPayment)}%0A*Agent:* ${collection.agentName}%0AThank you!`;

  const handleWhatsAppShare = () => {
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-white border border-slate-300 w-full max-w-md rounded-[5px] shadow-dropdown overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Header */}
        <div className="p-3 bg-[#0b192c] text-white flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white">Payment Receipt Generated</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div className="p-4 overflow-y-auto bg-slate-50 flex-1 flex justify-center">
          <div
            id="printable-receipt"
            className="bg-white border border-slate-200 p-4 rounded-[5px] shadow-sm w-full max-w-xs font-mono text-xs text-slate-800 space-y-2.5 border-dashed"
          >
            {/* Business Header */}
            <div className="text-center border-b border-slate-300 pb-2">
              <h2 className="font-bold text-sm tracking-wider text-slate-900 font-sans">FINTRACK PLATFORM</h2>
              <p className="text-[10px] text-slate-600 font-sans">Coastal Andhra Microfinance & Collections</p>
              <p className="text-[9px] text-slate-500">Ph: +91 883 2459800 • Reg # AP-FT-2026</p>
              <div className="mt-1.5 inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-[5px]">
                ★ PAYMENT ACKNOWLEDGEMENT ★
              </div>
            </div>

            {/* Receipt & Customer Details */}
            <div className="space-y-1 text-[11px] border-b border-slate-200 pb-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-slate-900">{collection.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span>{collection.collectionDate} {collection.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900 text-right">{collection.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Code:</span>
                <span>{collection.customerCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loan Reference:</span>
                <span className="font-bold text-blue-900">{collection.loanNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Route & Area:</span>
                <span className="text-right truncate max-w-[140px]">{collection.routeName.split(" - ")[0]} ({collection.areaName})</span>
              </div>
            </div>

            {/* Amount Paid Box */}
            <div className="bg-slate-100 p-2.5 rounded-[5px] text-center border border-slate-200">
              <span className="text-[10px] uppercase text-slate-500 font-sans font-semibold">Amount Received</span>
              <p className="text-xl font-bold text-emerald-700 font-sans mt-0.5">{formatINR(collection.amount)}</p>
              <p className="text-[10px] text-slate-600 font-sans mt-0.5">
                Paid via <strong className="font-bold text-slate-900">{collection.paymentMethod}</strong>
                {collection.upiTransactionId ? ` (${collection.upiTransactionId})` : ""}
              </p>
            </div>

            {/* Balances & Collector Stamp */}
            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex justify-between text-slate-700">
                <span>Remaining Balance:</span>
                <span className="font-bold text-slate-900">{formatINR(collection.balanceAfterPayment)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Field Collector:</span>
                <span className="font-semibold text-slate-900">{collection.agentName}</span>
              </div>
              {collection.remarks && (
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 italic">
                  Note: {collection.remarks}
                </div>
              )}
            </div>

            <div className="text-center pt-2 border-t border-slate-300 text-[9px] text-slate-500 font-sans">
              Computer-generated e-receipt. Valid without physical signature.
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="btn-outline-navy text-xs flex items-center gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share WhatsApp</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-outline-navy"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="btn-navy flex items-center gap-1.5 font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
