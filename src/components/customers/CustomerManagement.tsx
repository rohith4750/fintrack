"use client";

import React, { useState } from "react";
import { Area, Customer, Loan, Route, User } from "@/types";
import { formatINR } from "@/lib/storage";
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  CreditCard,
  Building,
  CheckCircle,
  XCircle,
  Eye,
  SlidersHorizontal,
  Smartphone,
  Check
} from "lucide-react";

interface CustomerManagementProps {
  customers: Customer[];
  loans: Loan[];
  areas: Area[];
  routes: Route[];
  users: User[];
  onAddCustomer: (customer: Omit<Customer, "id" | "customerCode" | "totalLoans" | "activeLoanAmount" | "totalOutstanding" | "joinDate">) => void;
  onSelectCustomer: (customerId: string) => void;
  onOpenNewLoanForCustomer: (customer: Customer) => void;
  onOpenQuickCollectForCustomer: (customer: Customer) => void;
  onReassignCustomerAgent?: (customerId: string, agentId: string, agentName: string) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  loans,
  areas,
  routes,
  users,
  onAddCustomer,
  onSelectCustomer,
  onOpenNewLoanForCustomer,
  onOpenQuickCollectForCustomer,
  onReassignCustomerAgent,
}) => {
  const agents = users.filter((u) => u.role === "AGENT");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState("ALL");
  const [selectedAgentFilter, setSelectedAgentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BLOCKED" | "CLOSED">("ALL");
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for new customer
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [address, setAddress] = useState("");
  const [areaId, setAreaId] = useState(areas[0]?.id || "");
  const [routeId, setRouteId] = useState(routes[0]?.id || "");
  const [assignedAgentId, setAssignedAgentId] = useState(
    routes[0]?.assignedAgentId || agents[0]?.id || "USR-02"
  );
  const [occupation, setOccupation] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState<number>(35000);
  const [referenceName, setReferenceName] = useState("");
  const [referenceContact, setReferenceContact] = useState("");

  const handleAreaChange = (aId: string) => {
    setAreaId(aId);
    const matchingRoutes = routes.filter((r) => r.areaId === aId);
    if (matchingRoutes.length > 0) {
      const firstRoute = matchingRoutes[0];
      setRouteId(firstRoute.id);
      if (firstRoute.assignedAgentId) {
        setAssignedAgentId(firstRoute.assignedAgentId);
      }
    }
  };

  const handleRouteChange = (rId: string) => {
    setRouteId(rId);
    const selectedRoute = routes.find((r) => r.id === rId);
    if (selectedRoute && selectedRoute.assignedAgentId) {
      setAssignedAgentId(selectedRoute.assignedAgentId);
    }
  };

  const handleSubmitNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    if (!name.trim() || !mobileNumber.trim()) return;

    setIsSubmitting(true);

    const selectedArea = areas.find((a) => a.id === areaId);
    const selectedRoute = routes.find((r) => r.id === routeId);
    const selectedAgent = users.find((u) => u.id === assignedAgentId);

    onAddCustomer({
      name: name.trim(),
      mobileNumber: mobileNumber.trim(),
      aadhaarNumber: aadhaarNumber.trim() || "N/A",
      address: address.trim() || "N/A",
      areaId,
      areaName: selectedArea?.name || "Rajahmundry",
      routeId,
      routeName: selectedRoute?.name || "Route A",
      assignedAgentId: selectedAgent?.id || "USR-02",
      assignedAgentName: selectedAgent?.name || "Ramesh Varma",
      assignedAgentPhone: selectedAgent?.phone,
      occupation: occupation.trim() || "Self Employed",
      monthlyIncome: Number(monthlyIncome) || 30000,
      referenceName: referenceName.trim() || "N/A",
      referenceContact: referenceContact.trim() || "N/A",
      status: "ACTIVE",
      creditScore: 750,
    });

    // Reset form safely
    setTimeout(() => {
      setName("");
      setMobileNumber("");
      setAadhaarNumber("");
      setAddress("");
      setOccupation("");
      setReferenceName("");
      setReferenceContact("");
      setIsSubmitting(false);
      setShowAddModal(false);
    }, 50);
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobileNumber.includes(searchTerm) ||
      c.aadhaarNumber.includes(searchTerm) ||
      (c.assignedAgentName && c.assignedAgentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.occupation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea = selectedAreaFilter === "ALL" || c.areaId === selectedAreaFilter;
    const matchesAgent = selectedAgentFilter === "ALL" || c.assignedAgentId === selectedAgentFilter;
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesArea && matchesAgent && matchesStatus;
  });

  const activeCustomerLoans = viewCustomer
    ? loans.filter((l) => l.customerId === viewCustomer.id || l.customerCode === viewCustomer.customerCode)
    : [];

  return (
    <div className="space-y-3 pb-8">
      {/* Top Header */}
      <div className="surface-card bg-gradient-to-r from-[#0b192c] to-[#0f2744] text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Customer Directory</span>
            <span className="bg-indigo-900/80 text-indigo-200 text-[10px] px-1.5 py-0.5 rounded-[5px] border border-indigo-700">
              Agent Assignment & Portfolio
            </span>
          </div>
          <h1 className="text-base font-bold text-white mt-0.5">
            Borrower Ledger & Customer Management
          </h1>
          <p className="text-xs text-slate-300">
            Admin controls: Assign dedicated field collection agents, verify Aadhaar KYC, and onboard clients.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-navy-accent flex items-center gap-1.5 font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Onboard Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="surface-card p-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-[5px] text-xs">
            {(["ALL", "ACTIVE", "BLOCKED", "CLOSED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 font-semibold rounded-[5px] transition-colors ${
                  statusFilter === st
                    ? "bg-[#0b192c] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st === "ALL" ? `All (${customers.length})` : st === "BLOCKED" ? "Defaulters / Blocked" : st}
              </button>
            ))}
          </div>

          {/* Area Filter Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-[5px] text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedAreaFilter}
              onChange={(e) => setSelectedAreaFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Areas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Agent Filter Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-[5px] text-xs">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={selectedAgentFilter}
              onChange={(e) => setSelectedAgentFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Field Agents</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  Agent: {ag.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, name, mobile, agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dense-input pl-8"
          />
        </div>
      </div>

      {/* Customer Table with Assigned Agent column */}
      <div className="surface-card">
        <div className="overflow-x-auto">
          <table className="dense-table">
            <thead>
              <tr>
                <th>Customer Code</th>
                <th>Name & Phone</th>
                <th>Area & Route</th>
                <th>Assigned Agent</th>
                <th>Occupation</th>
                <th>Aadhaar</th>
                <th>Credit Score</th>
                <th>Active Loans</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-6 text-slate-400">
                    No customer records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-blue-50/30">
                    <td className="font-mono font-bold text-[#1e40af]">
                      {cust.customerCode}
                    </td>
                    <td>
                      <p className="font-bold text-slate-900 leading-tight">{cust.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{cust.mobileNumber}</p>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-800 text-[11px]">{cust.areaName}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[130px]">{cust.routeName.split(" - ")[0]}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 bg-emerald-50/70 border border-emerald-200/80 px-1.5 py-0.5 rounded-[5px] w-fit">
                        <UserCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                        <span className="font-bold text-emerald-900 text-[11px]">
                          {cust.assignedAgentName || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-[11px] text-slate-700">{cust.occupation}</span>
                    </td>
                    <td className="font-mono text-[10px] text-slate-500">
                      {cust.aadhaarNumber}
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold ${
                        cust.creditScore >= 750
                          ? "bg-emerald-100 text-emerald-800"
                          : cust.creditScore >= 650
                          ? "bg-blue-100 text-blue-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {cust.creditScore} {cust.creditScore >= 750 ? "✓" : "!"}
                      </span>
                    </td>
                    <td className="font-semibold text-slate-800 text-center">
                      {cust.totalLoans}
                    </td>
                    <td className="font-bold text-slate-900">
                      {formatINR(cust.totalOutstanding)}
                    </td>
                    <td>
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] ${
                        cust.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          : cust.status === "BLOCKED"
                          ? "bg-rose-50 text-rose-700 border border-rose-300"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="text-right space-x-1">
                      <button
                        onClick={() => setViewCustomer(cust)}
                        className="btn-outline-navy text-[10px] py-0.5 px-2 inline-flex items-center gap-1"
                        title="View Profile & Loans"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => onOpenQuickCollectForCustomer(cust)}
                        className="btn-emerald text-[10px] py-0.5 px-2"
                        title="Collect EMI"
                      >
                        Collect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Profile Modal with Reassign Agent feature */}
      {viewCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white border border-slate-300 w-full max-w-2xl rounded-[5px] shadow-dropdown overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-3 bg-[#0b192c] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[5px] bg-[#1e40af] flex items-center justify-center font-bold text-sm">
                  {viewCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{viewCustomer.name}</h3>
                  <p className="text-[10px] text-blue-300 font-mono">{viewCustomer.customerCode} • Joined {viewCustomer.joinDate}</p>
                </div>
              </div>
              <button onClick={() => setViewCustomer(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            {/* Modal Body */}
            <div className="p-3.5 overflow-y-auto space-y-3 text-xs">
              {/* Assigned Agent Control Card */}
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-[5px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-[5px] bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Responsible Field Agent</span>
                    <p className="text-xs font-bold text-slate-900">
                      {viewCustomer.assignedAgentName || "Unassigned"}
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono">
                      Territory: {viewCustomer.routeName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <span className="text-[10px] font-semibold text-slate-600">Reassign:</span>
                  <select
                    value={viewCustomer.assignedAgentId || "USR-02"}
                    onChange={(e) => {
                      const newAg = users.find((u) => u.id === e.target.value);
                      if (newAg && onReassignCustomerAgent) {
                        onReassignCustomerAgent(viewCustomer.id, newAg.id, newAg.name);
                        setViewCustomer({
                          ...viewCustomer,
                          assignedAgentId: newAg.id,
                          assignedAgentName: newAg.name,
                          assignedAgentPhone: newAg.phone,
                        });
                      }
                    }}
                    className="text-[11px] bg-white border border-emerald-300 text-slate-800 py-1 px-1.5 rounded-[5px] focus:outline-none"
                  >
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name} ({ag.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* KYC & Demographics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-[5px] border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Mobile Number</span>
                  <p className="font-bold text-slate-900 mt-0.5">{viewCustomer.mobileNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Aadhaar KYC</span>
                  <p className="font-mono text-slate-800 mt-0.5">{viewCustomer.aadhaarNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Monthly Income</span>
                  <p className="font-bold text-slate-900 mt-0.5">{formatINR(viewCustomer.monthlyIncome)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Credit Risk Score</span>
                  <p className="font-bold text-emerald-700 mt-0.5">{viewCustomer.creditScore} / 900</p>
                </div>
              </div>

              {/* Address & Guarantor Reference */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-2.5 border border-slate-200 rounded-[5px]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Residence & Shop Address</span>
                  <p className="text-slate-800 mt-1 font-medium">{viewCustomer.address}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{viewCustomer.areaName} — {viewCustomer.routeName}</p>
                </div>
                <div className="p-2.5 border border-slate-200 rounded-[5px]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Guarantor / Reference Contact</span>
                  <p className="text-slate-800 mt-1 font-medium">{viewCustomer.referenceName}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5 font-mono">{viewCustomer.referenceContact}</p>
                </div>
              </div>

              {/* Active & Past Loans for this customer */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">Customer Loans Ledger ({activeCustomerLoans.length})</h4>
                  <button
                    onClick={() => {
                      onOpenNewLoanForCustomer(viewCustomer);
                      setViewCustomer(null);
                    }}
                    className="btn-navy-accent text-[10px] py-0.5 px-2"
                  >
                    + Disburse New Loan
                  </button>
                </div>

                <div className="border border-slate-200 rounded-[5px] overflow-hidden">
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th>Loan No</th>
                        <th>Type</th>
                        <th>Disbursed</th>
                        <th>Installment</th>
                        <th>Weeks / Paid Progress</th>
                        <th>Total Paid</th>
                        <th>Outstanding</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCustomerLoans.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-3 text-slate-400">
                            No active loans found for this customer.
                          </td>
                        </tr>
                      ) : (
                        activeCustomerLoans.map((l) => {
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
                            <tr key={l.id}>
                              <td className="font-mono font-bold text-[#1e40af]">{l.loanNumber}</td>
                              <td><span className="text-[10px] bg-slate-100 font-semibold px-1 py-0.5 rounded-[5px]">{l.loanType}</span></td>
                              <td className="font-semibold">{formatINR(l.principalAmount)}</td>
                              <td>{formatINR(l.installmentAmount)}</td>
                              <td className="min-w-[120px]">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-emerald-800">{paidWeeks} / {l.durationUnits} {unit}</span>
                                  <span className="font-semibold text-slate-500">{percent}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden my-0.5">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      percent === 100 ? "bg-emerald-600" : percent > 50 ? "bg-blue-600" : "bg-amber-500"
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="text-[9px] text-slate-500">
                                  {remainingWeeks === 0 ? "✓ Completed" : `${remainingWeeks} ${unit} left`}
                                </span>
                              </td>
                              <td className="text-emerald-700 font-semibold">{formatINR(l.totalPaidAmount)}</td>
                              <td className="text-rose-600 font-bold">{formatINR(l.outstandingBalance)}</td>
                              <td>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] ${
                                  l.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                }`}>
                                  {l.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setViewCustomer(null)}
                className="btn-outline-navy"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onOpenQuickCollectForCustomer(viewCustomer);
                  setViewCustomer(null);
                }}
                className="btn-emerald"
              >
                Collect Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Customer Modal with Assigned Agent */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white border border-slate-300 w-full max-w-xl p-4 rounded-[5px] shadow-dropdown space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#1e40af]" />
                <h2 className="text-sm font-bold text-slate-900">Onboard New Customer (KYC Registration)</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>

            <form onSubmit={handleSubmitNewCustomer} className="space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Full Customer Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. M. Rama Krishna"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="dense-input mt-0.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="+91 98480 xxxxx"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="dense-input mt-0.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Aadhaar Number</label>
                  <input
                    type="text"
                    placeholder="12 digit Aadhaar"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    className="dense-input mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Occupation / Business</label>
                  <input
                    type="text"
                    placeholder="e.g. Vegetable Vendor, Kirana Shop"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="dense-input mt-0.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Operating Area *</label>
                  <select
                    value={areaId}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    className="dense-select mt-0.5"
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Collection Route *</label>
                  <select
                    value={routeId}
                    onChange={(e) => handleRouteChange(e.target.value)}
                    className="dense-select mt-0.5"
                  >
                    {routes
                      .filter((r) => r.areaId === areaId)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Explicit Agent Assignment Selector */}
              <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-[5px]">
                <div className="flex items-center gap-1.5 mb-1 text-[#1e40af] font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Dedicated Field Agent (Responsible for Recoveries) *</span>
                </div>
                <select
                  value={assignedAgentId}
                  onChange={(e) => setAssignedAgentId(e.target.value)}
                  className="dense-select bg-white font-semibold text-slate-800"
                  required
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.phone}) — {ag.status}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  This field agent will be responsible for customer visits, EMI collection receipts, and recovery ledger.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">Full Address</label>
                <textarea
                  placeholder="Door No, Street name, Landmark..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="dense-input mt-0.5 h-14 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Guarantor / Reference Name</label>
                  <input
                    type="text"
                    placeholder="e.g. V. Venkata Rao (Neighbor/Relative)"
                    value={referenceName}
                    onChange={(e) => setReferenceName(e.target.value)}
                    className="dense-input mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Reference Mobile</label>
                  <input
                    type="text"
                    placeholder="+91 94401 xxxxx"
                    value={referenceContact}
                    onChange={(e) => setReferenceContact(e.target.value)}
                    className="dense-input mt-0.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline-navy"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-navy-accent font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Onboarding..." : "Complete Onboarding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
