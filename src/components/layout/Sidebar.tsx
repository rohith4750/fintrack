"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  Route as RouteIcon,
  Users,
  WalletCards,
  Receipt,
  ShoppingBag,
  UserCheck,
  ReceiptIndianRupee,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  RotateCcw,
  Sparkles,
  Building2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowRightLeft
} from "lucide-react";

export type NavTab = 
  | 'dashboard'
  | 'areas'
  | 'routes'
  | 'customers'
  | 'loans'
  | 'collections'
  | 'products'
  | 'agents'
  | 'agent-portal'
  | 'expenses'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentRole: 'ADMIN' | 'AGENT';
  onToggleRole: () => void;
  onResetData: () => void;
  totalOverdueCount: number;
}

interface MenuItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  subItems?: { id: NavTab; label: string; filter?: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  onToggleRole,
  onResetData,
  totalOverdueCount
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    hierarchy: true,
    finance: true,
    customers: false,
    operations: false,
  });

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside 
      className={`bg-[#0b192c] text-slate-200 border-r border-[#193555] flex flex-col transition-all duration-200 select-none shrink-0 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      style={{ minHeight: "100vh" }}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-[#193555] bg-[#071322]">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[5px] bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm tracking-wide">FINTRACK</span>
                <span className="text-[10px] bg-blue-900/80 text-blue-300 font-semibold px-1.5 py-0.5 rounded-[5px] border border-blue-700/50">PRO</span>
              </div>
              <p className="text-[10px] text-slate-400 font-normal truncate max-w-[140px]">Smart Finance & Recovery</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-[5px] bg-blue-700 flex items-center justify-center text-white font-bold">
            FT
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-[#193555] text-slate-400 hover:text-white rounded-[5px] transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode Status Pill */}
      <div className="p-2 border-b border-[#193555]/60 bg-[#091729]">
        <div className="flex items-center justify-between bg-[#11243b] px-2 py-1.5 rounded-[5px] border border-[#1d3d63]">
          <div className="flex items-center gap-1.5">
            {currentRole === 'ADMIN' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {!isCollapsed && (
              <div className="leading-tight">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Mode</p>
                <p className="text-xs font-bold text-white">
                  {currentRole === 'ADMIN' ? 'Admin Portal' : 'Agent Field Mode'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleRole}
            className="text-[10px] bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-1.5 py-0.5 rounded-[5px] font-medium transition-colors"
            title="Switch between Admin and Field Agent view"
          >
            {isCollapsed ? "⇄" : "Switch"}
          </button>
        </div>
      </div>

      {/* Navigation List with Submenus */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 text-xs">
        {/* Main Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-[5px] transition-colors ${
            currentTab === 'dashboard'
              ? 'bg-[#1e40af] text-white font-semibold shadow-sm'
              : 'text-slate-300 hover:bg-[#132841] hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-blue-400 shrink-0" />
          {!isCollapsed && <span>Executive Dashboard</span>}
        </button>

        {/* Dedicated Field Agent Mode Shortcut */}
        <button
          onClick={() => onSelectTab('agent-portal')}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[5px] transition-colors border ${
            currentTab === 'agent-portal'
              ? 'bg-emerald-700 text-white font-semibold border-emerald-500'
              : 'border-emerald-900/60 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span>Field Collection Mode</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[9px] bg-emerald-800 text-emerald-200 px-1 py-0.2 rounded-[5px]">LIVE</span>
          )}
        </button>

        {/* Section: HIERARCHY & OPERATIONS (Admin Only - Agents cannot manage Areas/Routes) */}
        {currentRole === 'ADMIN' && !isCollapsed && (
          <div className="pt-2 pb-1 px-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Operations & Regions</span>
            <button 
              onClick={() => toggleSubmenu('hierarchy')}
              className="hover:text-white"
            >
              {openSubmenus.hierarchy ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        )}

        {currentRole === 'ADMIN' && (openSubmenus.hierarchy || isCollapsed) && (
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectTab('areas')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] transition-colors ${
                currentTab === 'areas'
                  ? 'bg-[#1e40af] text-white font-semibold'
                  : 'text-slate-300 hover:bg-[#132841] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                {!isCollapsed && <span>Area Management</span>}
              </div>
              {!isCollapsed && <span className="text-[10px] text-slate-400">4 Areas</span>}
            </button>

            <button
              onClick={() => onSelectTab('routes')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] transition-colors ${
                currentTab === 'routes'
                  ? 'bg-[#1e40af] text-white font-semibold'
                  : 'text-slate-300 hover:bg-[#132841] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <RouteIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                {!isCollapsed && <span>Route Management</span>}
              </div>
              {!isCollapsed && <span className="text-[10px] text-slate-400">5 Routes</span>}
            </button>
          </div>
        )}

        {/* Section: CORE FINANCE & LOANS */}
        {!isCollapsed && (
          <div className="pt-2 pb-1 px-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Finance & Customers</span>
            <button 
              onClick={() => toggleSubmenu('finance')}
              className="hover:text-white"
            >
              {openSubmenus.finance ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        )}

        {(openSubmenus.finance || isCollapsed) && (
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectTab('customers')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] transition-colors ${
                currentTab === 'customers'
                  ? 'bg-[#1e40af] text-white font-semibold'
                  : 'text-slate-300 hover:bg-[#132841] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                {!isCollapsed && <span>{currentRole === 'AGENT' ? 'My Customers' : 'Customers'}</span>}
              </div>
              {!isCollapsed && <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-[5px]">Active</span>}
            </button>

            <button
              onClick={() => onSelectTab('loans')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] transition-colors ${
                currentTab === 'loans'
                  ? 'bg-[#1e40af] text-white font-semibold'
                  : 'text-slate-300 hover:bg-[#132841] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <WalletCards className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                {!isCollapsed && <span>{currentRole === 'AGENT' ? 'My Assigned Loans' : 'Loan Management'}</span>}
              </div>
              {totalOverdueCount > 0 && !isCollapsed && (
                <span className="text-[10px] bg-red-950 text-red-300 font-bold px-1.5 py-0.5 rounded-[5px] border border-red-800">
                  {totalOverdueCount} Overdue
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('collections')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] transition-colors ${
                currentTab === 'collections'
                  ? 'bg-[#1e40af] text-white font-semibold'
                  : 'text-slate-300 hover:bg-[#132841] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                {!isCollapsed && <span>{currentRole === 'AGENT' ? 'My Collections & Receipts' : 'Collections & Receipts'}</span>}
              </div>
            </button>

            {currentRole === 'ADMIN' && (
              <button
                onClick={() => onSelectTab('products')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] transition-colors ${
                  currentTab === 'products'
                    ? 'bg-[#1e40af] text-white font-semibold'
                    : 'text-slate-300 hover:bg-[#132841] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {!isCollapsed && <span>Product Finance</span>}
                </div>
                {!isCollapsed && <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1 py-0.5 rounded-[5px]">EMI</span>}
              </button>
            )}
          </div>
        )}

        {/* Section: AGENTS, EXPENSES & P&L (Admin Only - Agents cannot see profits or company accounts) */}
        {currentRole === 'ADMIN' && !isCollapsed && (
          <div className="pt-2 pb-1 px-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Staff & Accounts</span>
            <button 
              onClick={() => toggleSubmenu('operations')}
              className="hover:text-white"
            >
              {openSubmenus.operations ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        )}

        {currentRole === 'ADMIN' && (openSubmenus.operations || isCollapsed) && (
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectTab('agents')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] transition-colors ${
                currentTab === 'agents'
                  ? 'bg-[#1e40af] text-white font-semibold'
                  : 'text-slate-300 hover:bg-[#132841] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {!isCollapsed && <span>Agents & Attendance</span>}
              </div>
            </button>

            <button
              onClick={() => onSelectTab('expenses')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] transition-colors ${
                currentTab === 'expenses'
                  ? 'bg-[#1e40af] text-white font-semibold'
                  : 'text-slate-300 hover:bg-[#132841] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <ReceiptIndianRupee className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                {!isCollapsed && <span>Expense Management</span>}
              </div>
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] transition-colors ${
                currentTab === 'reports'
                  ? 'bg-[#1e40af] text-white font-semibold'
                  : 'text-slate-300 hover:bg-[#132841] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {!isCollapsed && <span>Reports & P&L</span>}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-2 border-t border-[#193555] bg-[#071322] space-y-1.5">
        <button
          onClick={onResetData}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] text-slate-400 hover:text-amber-300 hover:bg-[#132841] rounded-[5px] transition-colors border border-dashed border-[#1d3d63]"
          title="Reset to pre-loaded demo finance dataset"
        >
          <RotateCcw className="w-3 h-3" />
          {!isCollapsed && <span>Reset Demo Data</span>}
        </button>
      </div>
    </aside>
  );
};
