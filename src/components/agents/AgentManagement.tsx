"use client";

import React, { useState } from "react";
import { AgentAttendance, Route, User, Area } from "@/types";
import { formatINR } from "@/lib/storage";
import {
  UserCheck,
  Smartphone,
  MapPin,
  Route as RouteIcon,
  CheckCircle,
  Clock,
  Gauge,
  Phone,
  Calendar,
  Sparkles,
  Plus,
  Key,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  SlidersHorizontal,
  Ban,
  AlertCircle
} from "lucide-react";

interface AgentManagementProps {
  users: User[];
  routes: Route[];
  areas: Area[];
  attendance: AgentAttendance[];
  onUpdateAgentAttendance: (agentId: string, status: AgentAttendance["status"]) => void;
  onSelectAgentForFieldMode: (agentId: string) => void;
  onAddAgent: (agent: Omit<User, "id" | "recoveryEfficiency" | "todayCollected">) => void;
  onUpdateAgentCredentials?: (agentId: string, updates: Partial<User>) => void;
}

export const AgentManagement: React.FC<AgentManagementProps> = ({
  users,
  routes,
  areas,
  attendance,
  onUpdateAgentAttendance,
  onSelectAgentForFieldMode,
  onAddAgent,
  onUpdateAgentCredentials,
}) => {
  const agents = users.filter((u) => u.role === "AGENT");

  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [selectedAgentForSecurity, setSelectedAgentForSecurity] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Agent Form States
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLoginId, setNewLoginId] = useState("");
  const [newPin, setNewPin] = useState("1234");
  const [newPassword, setNewPassword] = useState("agentpassword");
  const [newTarget, setNewTarget] = useState<number>(35000);
  const [newAreaIds, setNewAreaIds] = useState<string[]>([areas[0]?.id || "AREA-01"]);
  const [canCollectCash, setCanCollectCash] = useState(true);
  const [canCollectUPI, setCanCollectUPI] = useState(true);
  const [canEditCustomer, setCanEditCustomer] = useState(false);
  const [maxCashLimit, setMaxCashLimit] = useState<number>(75000);

  // Security Modal States
  const [editPin, setEditPin] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showPinMask, setShowPinMask] = useState(false);

  const handleOpenSecurityModal = (agent: User) => {
    setSelectedAgentForSecurity(agent);
    setEditPin(agent.pin || "1234");
    setEditPassword(agent.password || "agentpassword");
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentForSecurity || !onUpdateAgentCredentials) return;

    onUpdateAgentCredentials(selectedAgentForSecurity.id, {
      pin: editPin,
      password: editPassword,
    });

    setSelectedAgentForSecurity(null);
  };

  const handleToggleAgentStatus = (agent: User) => {
    if (!onUpdateAgentCredentials) return;
    const newStatus = agent.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    onUpdateAgentCredentials(agent.id, {
      status: newStatus,
    });
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!newName || !newPhone) return;

    setIsSubmitting(true);

    const generatedUserId = `USR-${String(users.length + 1).padStart(2, "0")}`;
    const loginId = newLoginId || `AGT-${newPhone.slice(-4)}`;

    onAddAgent({
      userId: generatedUserId,
      name: newName.trim(),
      email: newEmail.trim() || `${loginId.toLowerCase()}@fintrack.in`,
      phone: newPhone.trim(),
      role: "AGENT",
      status: "ACTIVE",
      loginId,
      pin: newPin || "1234",
      password: newPassword || "agentpassword",
      assignedAreaIds: newAreaIds,
      todayTarget: Number(newTarget) || 30000,
      attendanceStatus: "PRESENT",
      permissions: {
        canCollectCash,
        canCollectUPI,
        canEditCustomer,
        canDisburseLoan: false,
        maxDailyCashLimit: Number(maxCashLimit) || 50000,
      },
    });

    setTimeout(() => {
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewLoginId("");
      setNewPin("1234");
      setNewPassword("agentpassword");
      setIsSubmitting(false);
      setShowAddAgentModal(false);
    }, 50);
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Banner with Admin Master Notice */}
      <div className="surface-card bg-gradient-to-r from-[#0b192c] to-[#0f2744] text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Field Force Administration</span>
            <span className="bg-emerald-900/80 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded-[5px] border border-emerald-700">
              Admin Master Security & PIN Control
            </span>
          </div>
          <h1 className="text-base font-bold text-white mt-0.5">
            Agent Roster, Credentials & Route Authorization
          </h1>
          <p className="text-xs text-slate-300">
            Admin maintains 100% control: Create field agents, provision mobile PINs, set cash collection limits, and audit attendance.
          </p>
        </div>

        <button
          onClick={() => setShowAddAgentModal(true)}
          className="btn-navy-accent flex items-center gap-1.5 font-bold"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Provision New Agent</span>
        </button>
      </div>

      {/* Admin Security Banner */}
      <div className="bg-blue-50/80 border border-blue-200 p-2.5 rounded-[5px] flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-800">
          <ShieldCheck className="w-4 h-4 text-[#1e40af] shrink-0" />
          <span>
            <strong>Centralized Security Mode:</strong> Field agents access mobile and web collection terminals using Admin-assigned 4-digit PINs. All authorization and access revocations are strictly managed by Admin.
          </span>
        </div>
      </div>

      {/* Agent Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {agents.map((agent) => {
          const agentRoutes = routes.filter((r) => r.assignedAgentId === agent.id || r.assignedAgentId === agent.userId);
          const percent = Math.min(100, Math.round(((agent.todayCollected || 0) / (agent.todayTarget || 1)) * 100));

          return (
            <div key={agent.id} className="surface-card flex flex-col justify-between hover:border-[#1e40af] transition-all">
              <div>
                {/* Agent Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-[5px] bg-[#0b192c] text-white flex items-center justify-center font-bold text-xs border border-[#1e40af]">
                      {agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs leading-tight">{agent.name}</h3>
                      <p className="text-[10px] text-slate-500 font-mono">{agent.phone}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] ${
                    agent.status === "SUSPENDED"
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : agent.attendanceStatus === "ON_FIELD"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {agent.status === "SUSPENDED" ? "SUSPENDED" : agent.attendanceStatus || "ON_FIELD"}
                  </span>
                </div>

                {/* Login ID & Quick PIN Badge */}
                <div className="mt-2.5 bg-slate-100/80 p-1.5 rounded-[5px] border border-slate-200 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Key className="w-3 h-3 text-slate-500" />
                    <span className="font-mono font-bold text-slate-800">{agent.loginId || agent.id}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">PIN:</span>
                    <span className="font-mono font-bold text-[#1e40af] bg-white px-1.5 py-0.2 rounded border border-blue-200">
                      {agent.pin || "••••"}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-2 bg-slate-50 p-2 rounded-[5px] border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Recovery Efficiency:</span>
                    <span className="font-bold text-emerald-700">{agent.recoveryEfficiency}%</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Today Target:</span>
                    <span className="font-semibold text-slate-800">{formatINR(agent.todayTarget || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Today Collected:</span>
                    <span className="font-bold text-blue-900">{formatINR(agent.todayCollected || 0)}</span>
                  </div>
                  <div className="pt-0.5">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                      <span>Beat Progress</span>
                      <span className="font-bold text-slate-800">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#1e40af] h-1.5 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Assigned Routes */}
                <div className="mt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Assigned Routes ({agentRoutes.length})</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agentRoutes.map((r) => (
                      <span key={r.id} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-[5px] font-medium border border-slate-200">
                        {r.code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                <button
                  onClick={() => handleOpenSecurityModal(agent)}
                  className="btn-outline-navy text-[10px] py-1 px-1.5 flex items-center gap-1 text-slate-700"
                  title="Admin PIN & Password Management"
                >
                  <Lock className="w-3 h-3 text-[#1e40af]" />
                  <span>PIN/Security</span>
                </button>

                <button
                  onClick={() => onSelectAgentForFieldMode(agent.id)}
                  className="btn-emerald text-[10px] py-1 px-2 flex items-center gap-1 font-semibold"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Launch Portal</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance & Field Activity Log */}
      <div className="surface-card">
        <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1e40af]" />
            <div>
              <h2 className="text-xs font-bold text-slate-800">Daily Agent Check-In & Kilometers Log</h2>
              <p className="text-[10px] text-slate-500">Field vehicle distance verification & route start timestamps</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-[5px] font-semibold font-mono">
            Date: 2026-09-20
          </span>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="dense-table">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Check-In Time</th>
                <th>Status</th>
                <th>Odometer (Start km)</th>
                <th>Assigned Beat / Route</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((att) => (
                <tr key={att.id}>
                  <td className="font-bold text-slate-900">{att.agentName}</td>
                  <td className="font-mono text-slate-700">{att.checkInTime || "08:30 AM"}</td>
                  <td>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] ${
                      att.status === "ON_FIELD" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {att.status}
                    </span>
                  </td>
                  <td className="font-mono text-slate-800 font-medium">
                    {att.startKilometers ? `${att.startKilometers} km` : "N/A"}
                  </td>
                  <td>
                    <span className="text-[11px] text-slate-700">{att.remarks || "Regular Collection Route"}</span>
                  </td>
                  <td className="text-slate-500 text-[11px]">
                    Route operational verified
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Security & PIN Management Modal */}
      {selectedAgentForSecurity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white border border-slate-300 w-full max-w-md p-4 rounded-[5px] shadow-dropdown space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1e40af]" />
                <h2 className="text-sm font-bold text-slate-900">Admin PIN & Access Control</h2>
              </div>
              <button onClick={() => setSelectedAgentForSecurity(null)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-[5px] border border-slate-200">
              <p className="font-bold text-slate-900 text-xs">{selectedAgentForSecurity.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">Login ID: {selectedAgentForSecurity.loginId || selectedAgentForSecurity.id} • {selectedAgentForSecurity.phone}</p>
            </div>

            <form onSubmit={handleSaveSecurity} className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex justify-between items-center">
                  <span>4-Digit Collection PIN *</span>
                  <button
                    type="button"
                    onClick={() => setShowPinMask(!showPinMask)}
                    className="text-[10px] text-[#1e40af] hover:underline"
                  >
                    {showPinMask ? "Hide PIN" : "Show PIN"}
                  </button>
                </label>
                <input
                  type={showPinMask ? "text" : "password"}
                  maxLength={6}
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  className="dense-input mt-0.5 font-mono text-base font-bold tracking-widest text-[#1e40af]"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Agent enters this PIN to authenticate on mobile devices.</p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">Account Password</label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="dense-input mt-0.5 font-mono"
                  required
                />
              </div>

              {/* Status Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Account Access Status:</span>
                  <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] ${
                    selectedAgentForSecurity.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}>
                    {selectedAgentForSecurity.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAgentStatus(selectedAgentForSecurity)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-[5px] border ${
                    selectedAgentForSecurity.status === "ACTIVE"
                      ? "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                  }`}
                >
                  {selectedAgentForSecurity.status === "ACTIVE" ? "Suspend Access" : "Activate Access"}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAgentForSecurity(null)}
                  className="btn-outline-navy"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-navy-accent font-bold">
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provision New Agent Modal */}
      {showAddAgentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white border border-slate-300 w-full max-w-lg p-4 rounded-[5px] shadow-dropdown space-y-3 max-h-[92vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#1e40af]" />
                <h2 className="text-sm font-bold text-slate-900">Provision New Field Agent & Set PIN</h2>
              </div>
              <button onClick={() => setShowAddAgentModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Agent Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. M. Rajesh Kumar"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="dense-input mt-0.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Mobile Phone Number *</label>
                  <input
                    type="text"
                    placeholder="+91 98480 xxxxx"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="dense-input mt-0.5"
                    required
                  />
                </div>
              </div>

              {/* Credentials & PIN */}
              <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-[5px] space-y-2">
                <div className="flex items-center gap-1.5 text-[#1e40af] font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin-Assigned App Access Credentials</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600">Login ID / Code</label>
                    <input
                      type="text"
                      placeholder="e.g. AGT-RJY-06"
                      value={newLoginId}
                      onChange={(e) => setNewLoginId(e.target.value)}
                      className="dense-input mt-0.5 uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600">Quick 4-Digit PIN *</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="4412"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="dense-input mt-0.5 font-mono font-bold text-center text-[#1e40af]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600">Default Password</label>
                    <input
                      type="text"
                      placeholder="agentpassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="dense-input mt-0.5 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Daily Collection Target (₹)</label>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="dense-input mt-0.5 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Max Daily Cash Limit (₹)</label>
                  <input
                    type="number"
                    value={maxCashLimit}
                    onChange={(e) => setMaxCashLimit(Number(e.target.value))}
                    className="dense-input mt-0.5 font-bold text-emerald-800"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="border border-slate-200 p-2.5 rounded-[5px] space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Agent Collection Permissions</span>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCollectCash}
                      onChange={(e) => setCanCollectCash(e.target.checked)}
                      className="rounded text-[#1e40af]"
                    />
                    <span className="text-[11px] text-slate-700">Collect Cash</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCollectUPI}
                      onChange={(e) => setCanCollectUPI(e.target.checked)}
                      className="rounded text-[#1e40af]"
                    />
                    <span className="text-[11px] text-slate-700">Collect UPI</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canEditCustomer}
                      onChange={(e) => setCanEditCustomer(e.target.checked)}
                      className="rounded text-[#1e40af]"
                    />
                    <span className="text-[11px] text-slate-700">Edit Customer</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAgentModal(false)}
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
                  {isSubmitting ? "Provisioning..." : "Provision Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
