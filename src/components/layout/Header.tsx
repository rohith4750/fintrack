"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  PlusCircle,
  ShieldCheck,
  Smartphone,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  UserPlus
} from "lucide-react";
import { Branch, SystemNotification } from "@/types";

interface HeaderProps {
  branches: Branch[];
  selectedBranchId: string;
  onSelectBranch: (id: string) => void;
  currentRole: 'ADMIN' | 'AGENT';
  onToggleRole: () => void;
  notifications: SystemNotification[];
  onMarkNotificationRead: (id: string) => void;
  onOpenQuickCollect: () => void;
  onOpenNewLoan: () => void;
  onOpenNewCustomer: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  branches,
  selectedBranchId,
  onSelectBranch,
  currentRole,
  onToggleRole,
  notifications,
  onMarkNotificationRead,
  onOpenQuickCollect,
  onOpenNewLoan,
  onOpenNewCustomer,
  searchTerm,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifications = notifications.filter(n => !n.read);

  const selectedBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Branch selector & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {/* Branch Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-[5px] text-xs font-medium text-slate-700">
          <Building className="w-3.5 h-3.5 text-[#1e40af]" />
          <select
            value={selectedBranchId}
            onChange={(e) => onSelectBranch(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.city})
              </option>
            ))}
          </select>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Customer, Mobile, Aadhaar, Loan #, Route..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#1e40af] text-slate-800 text-xs pl-8 pr-3 py-1.5 focus:outline-none rounded-[5px] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions, Notifications & User Info */}
      <div className="flex items-center gap-2">
        {/* Quick Action: New Customer */}
        <button
          onClick={onOpenNewCustomer}
          className="hidden md:inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2.5 py-1.5 text-xs font-medium rounded-[5px] transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5 text-slate-600" />
          <span>New Customer</span>
        </button>

        {/* Quick Action: New Loan */}
        <button
          onClick={onOpenNewLoan}
          className="hidden sm:inline-flex items-center gap-1.5 bg-[#0b192c] hover:bg-[#102a43] text-white px-2.5 py-1.5 text-xs font-medium rounded-[5px] shadow-sm transition-colors"
        >
          <CreditCard className="w-3.5 h-3.5 text-blue-300" />
          <span>Disburse Loan</span>
        </button>

        {/* Quick Action: Fast EMI Collection */}
        <button
          onClick={onOpenQuickCollect}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold rounded-[5px] shadow-sm transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Quick Collect</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-slate-600 hover:text-[#1e40af] hover:bg-slate-100 rounded-[5px] relative transition-colors"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-dropdown rounded-[5px] z-50 overflow-hidden">
              <div className="px-3 py-2 bg-[#0b192c] text-white flex items-center justify-between">
                <span className="text-xs font-semibold">System Reminders & Alerts</span>
                <span className="text-[10px] bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded-[5px]">
                  {unreadNotifications.length} New
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No active alerts
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.read ? "bg-blue-50/40 font-medium" : "text-slate-600"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.type === "OVERDUE" ? (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-800 leading-tight">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {n.message}
                          </p>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            {n.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current User Role Pill */}
        <div 
          onClick={onToggleRole}
          className="flex items-center gap-2 pl-2 cursor-pointer group"
          title="Click to toggle Admin / Agent role"
        >
          <div className="w-7 h-7 rounded-[5px] bg-[#0b192c] text-white flex items-center justify-center font-bold text-xs group-hover:bg-[#1e40af] transition-colors">
            {currentRole === 'ADMIN' ? 'AD' : 'AG'}
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <p className="text-xs font-bold text-slate-800">
              {currentRole === 'ADMIN' ? 'K. Srikanth Naidu' : 'Ramesh Varma'}
            </p>
            <p className="text-[10px] text-slate-500">
              {currentRole === 'ADMIN' ? 'System Administrator' : 'Senior Field Agent'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
