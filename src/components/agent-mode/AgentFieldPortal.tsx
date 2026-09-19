"use client";

import React, { useState } from "react";
import { Collection, Customer, Loan, Route, User } from "@/types";
import { formatINR } from "@/lib/storage";
import {
  Smartphone,
  Route as RouteIcon,
  CheckCircle2,
  Phone,
  Receipt,
  QrCode,
  IndianRupee,
  MapPin,
  Clock,
  Search,
  ArrowRight,
  ShieldCheck,
  Check
} from "lucide-react";

interface AgentFieldPortalProps {
  currentAgent: User;
  routes: Route[];
  loans: Loan[];
  customers: Customer[];
  collections: Collection[];
  allAgents?: User[];
  onSelectAgent?: (agentId: string) => void;
  onOpenQuickCollect: (loanId?: string) => void;
  onViewReceipt: (col: Collection) => void;
  onSwitchToAdmin: () => void;
}

export const AgentFieldPortal: React.FC<AgentFieldPortalProps> = ({
  currentAgent,
  routes,
  loans,
  customers,
  collections,
  allAgents = [],
  onSelectAgent,
  onOpenQuickCollect,
  onViewReceipt,
  onSwitchToAdmin,
}) => {
  // STRICT AGENT ISOLATION: Only get routes assigned to this specific agent
  const customerRouteIds = customers
    .filter((c) => c.assignedAgentId === currentAgent.id || c.assignedAgentId === currentAgent.userId)
    .map((c) => c.routeId);

  const agentRoutes = routes.filter(
    (r) => r.assignedAgentId === currentAgent.id || r.assignedAgentId === currentAgent.userId || customerRouteIds.includes(r.id)
  );

  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    agentRoutes[0]?.id || ""
  );
  const [filterMode, setFilterMode] = useState<"PENDING" | "COLLECTED" | "ALL">("PENDING");
  const [searchTerm, setSearchTerm] = useState("");

  const activeRoute = agentRoutes.find((r) => r.id === selectedRouteId) || agentRoutes[0];

  // Customers belonging strictly to this agent
  const myCustomers = customers.filter(
    (c) => c.assignedAgentId === currentAgent.id || c.assignedAgentId === currentAgent.userId || (agentRoutes.some((ar) => ar.id === c.routeId))
  );

  // Loans belonging strictly to this agent
  const agentLoans = loans.filter((l) => {
    const isMyLoan = l.agentId === currentAgent.id || l.agentId === currentAgent.userId;
    const isMyCustomerLoan = myCustomers.some((c) => c.id === l.customerId || c.customerCode === l.customerCode);
    return (isMyLoan || isMyCustomerLoan) && l.status !== "CLOSED";
  });

  // Loans on the currently selected route
  const routeLoans = selectedRouteId
    ? agentLoans.filter((l) => l.routeId === selectedRouteId)
    : agentLoans;

  // Check which loans were collected today (2026-09-20)
  const todayStr = "2026-09-20";
  const todayCollections = collections.filter(
    (c) => c.collectionDate === todayStr && (c.agentId === currentAgent.id || c.agentId === currentAgent.userId)
  );

  const enrichedStops = routeLoans.map((loan, index) => {
    const customer = myCustomers.find((c) => c.id === loan.customerId || c.customerCode === loan.customerCode) || customers.find((c) => c.id === loan.customerId);
    const todayCollection = todayCollections.find((c) => c.loanId === loan.id || c.loanNumber === loan.loanNumber);
    const isCollectedToday = !!todayCollection;

    return {
      stopNumber: index + 1,
      loan,
      customer,
      isCollectedToday,
      todayCollection,
    };
  });

  const filteredStops = enrichedStops.filter((stop) => {
    const matchesSearch =
      stop.loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.loan.customerPhone.includes(searchTerm) ||
      (stop.customer?.address || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === "PENDING") return !stop.isCollectedToday;
    if (filterMode === "COLLECTED") return stop.isCollectedToday;
    return true;
  });

  const totalStops = enrichedStops.length;
  const completedStops = enrichedStops.filter((s) => s.isCollectedToday).length;
  const progressPercent = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;

  return (
    <div className="space-y-3 pb-12 max-w-4xl mx-auto">
      {/* Field Mode Top Bar */}
      <div className="bg-[#0b192c] text-white p-3 rounded-[5px] border border-[#193555] shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[5px] bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {allAgents.length > 1 && onSelectAgent ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-300 font-semibold">Active Agent:</span>
                  <select
                    value={currentAgent.id}
                    onChange={(e) => onSelectAgent(e.target.value)}
                    className="bg-[#132841] border border-emerald-500/50 text-white font-bold text-xs py-0.5 px-2 rounded-[5px] focus:outline-none"
                  >
                    {allAgents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name} ({ag.loginId || ag.id})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-xs font-bold text-white">{currentAgent.name}</span>
              )}
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-[5px] border border-emerald-500/40">
                FIELD AGENT
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Login ID: {currentAgent.loginId || currentAgent.id} • PIN: {currentAgent.pin || "••••"} • Assigned: {agentRoutes.length} Route(s)
            </p>
          </div>
        </div>

        <button
          onClick={onSwitchToAdmin}
          className="btn-outline-navy bg-[#132841] text-blue-200 hover:bg-[#1b385a] border-[#22446c] text-[11px] py-1 px-2.5 flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Switch to Admin Portal</span>
        </button>
      </div>

      {/* Route Selector & Daily Progress Card */}
      <div className="surface-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">My Assigned Routes ({agentRoutes.length})</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <RouteIcon className="w-4 h-4 text-[#1e40af]" />
              {agentRoutes.length > 0 ? (
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="font-bold text-slate-900 text-sm bg-transparent focus:outline-none cursor-pointer"
                >
                  {agentRoutes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.collectionFrequency})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-slate-600 italic">No specific beat assigned</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">
              Today: <strong className="text-emerald-700">{formatINR(activeRoute?.todayCollected || currentAgent.todayCollected || 0)}</strong> / {formatINR(activeRoute?.todayTarget || currentAgent.todayTarget || 0)}
            </span>
          </div>
        </div>

        {/* Live Route Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>
              Route Visited: <strong>{completedStops}</strong> of <strong>{totalStops}</strong> Borrowers
            </span>
            <span className="font-bold text-[#1e40af]">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="surface-card p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-[5px] text-xs">
          <button
            onClick={() => setFilterMode("PENDING")}
            className={`px-3 py-1 font-semibold rounded-[5px] transition-colors ${
              filterMode === "PENDING"
                ? "bg-[#0b192c] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending Today ({enrichedStops.filter((s) => !s.isCollectedToday).length})
          </button>
          <button
            onClick={() => setFilterMode("COLLECTED")}
            className={`px-3 py-1 font-semibold rounded-[5px] transition-colors ${
              filterMode === "COLLECTED"
                ? "bg-[#0b192c] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Collected ({completedStops})
          </button>
          <button
            onClick={() => setFilterMode("ALL")}
            className={`px-3 py-1 font-semibold rounded-[5px] transition-colors ${
              filterMode === "ALL"
                ? "bg-[#0b192c] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Stops ({totalStops})
          </button>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search borrower or street..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dense-input pl-8"
          />
        </div>
      </div>

      {/* Route Stops List */}
      <div className="space-y-2">
        {filteredStops.length === 0 ? (
          <div className="surface-card py-8 text-center text-slate-500 text-xs">
            {filterMode === "PENDING"
              ? "🎉 Great work! All scheduled collections on this route are completed for today."
              : "No customer stops match your search criteria."}
          </div>
        ) : (
          filteredStops.map((stop) => (
            <div
              key={stop.loan.id}
              className={`surface-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border transition-all ${
                stop.isCollectedToday
                  ? "bg-emerald-50/20 border-emerald-200"
                  : "hover:border-[#1e40af]"
              }`}
            >
              {/* Left Stop Info */}
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-7 h-7 rounded-[5px] flex items-center justify-center font-bold text-xs shrink-0 ${
                    stop.isCollectedToday
                      ? "bg-emerald-600 text-white"
                      : "bg-[#0b192c] text-white"
                  }`}
                >
                  {stop.isCollectedToday ? <Check className="w-4 h-4" /> : `#${stop.stopNumber}`}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-xs">{stop.loan.customerName}</h3>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 py-0.2 rounded-[5px]">
                      {stop.loan.customerCode}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-[#1e40af] font-semibold px-1.5 py-0.2 rounded-[5px]">
                      {stop.loan.loanType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{stop.customer?.address || "Street Address"}</span>
                    </span>
                    <a
                      href={`tel:${stop.loan.customerPhone}`}
                      className="flex items-center gap-1 text-[#1e40af] hover:underline font-mono"
                    >
                      <Phone className="w-3 h-3 text-[#1e40af] shrink-0" />
                      <span>{stop.loan.customerPhone}</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span>Loan: <strong className="text-slate-800">{stop.loan.loanNumber}</strong></span>
                    <span>•</span>
                    <span>Total Bal: <strong className="text-slate-800">{formatINR(stop.loan.outstandingBalance)}</strong></span>
                  </div>

                  {/* Weeks Paid Progress Pill */}
                  {(() => {
                    const unit = stop.loan.loanType === 'WEEKLY' ? 'Wks' : stop.loan.loanType === 'MONTHLY' ? 'Mos' : stop.loan.loanType === 'DAILY' ? 'Days' : 'EMIs';
                    const paidWeeks = Math.min(
                      stop.loan.durationUnits,
                      Math.max(
                        stop.loan.installments?.filter((i) => i.status === 'PAID').length || 0,
                        Math.round(stop.loan.totalPaidAmount / (stop.loan.installmentAmount || 1))
                      )
                    );
                    const remainingWeeks = Math.max(0, stop.loan.durationUnits - paidWeeks);
                    const percent = stop.loan.durationUnits > 0 ? Math.min(100, Math.round((paidWeeks / stop.loan.durationUnits) * 100)) : 0;

                    return (
                      <div className="flex items-center gap-2 mt-1.5 bg-slate-100/80 px-2 py-1 rounded-[5px] border border-slate-200/80 w-fit">
                        <span className="text-[10px] font-bold text-emerald-800">
                          {paidWeeks} / {stop.loan.durationUnits} {unit} Paid ({percent}%)
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          • {remainingWeeks === 0 ? "✓ Full" : `${remainingWeeks} ${unit} left`}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Right Action */}
              <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Scheduled Due</span>
                  <span className="text-sm font-bold text-slate-900">{formatINR(stop.loan.installmentAmount)}</span>
                </div>

                {stop.isCollectedToday ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-[5px] border border-emerald-300">
                      ✓ Collected
                    </span>
                    {stop.todayCollection && (
                      <button
                        onClick={() => onViewReceipt(stop.todayCollection!)}
                        className="btn-outline-navy text-[10px] py-1 px-2"
                      >
                        Receipt
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenQuickCollect(stop.loan.id)}
                    className="btn-emerald font-bold text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Collect {formatINR(stop.loan.installmentAmount)}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
