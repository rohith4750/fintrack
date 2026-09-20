"use client";

import React, { useState } from "react";
import { Area, Route, User } from "@/types";
import { formatINR } from "@/lib/storage";
import { MapPin, Route as RouteIcon, Plus, UserCheck, Search, Building2, Check, ArrowRight } from "lucide-react";

interface AreaRouteManagementProps {
  areas: Area[];
  routes: Route[];
  users: User[];
  onAddArea: (area: Omit<Area, "id" | "totalCustomers" | "activeLoansCount" | "totalOutstanding">) => void;
  onAddRoute: (route: Omit<Route, "id" | "totalCustomers" | "todayTarget" | "todayCollected">) => void;
  onUpdateRouteAgent: (routeId: string, agentId: string, agentName: string) => void;
}

export const AreaRouteManagement: React.FC<AreaRouteManagementProps> = ({
  areas,
  routes,
  users,
  onAddArea,
  onAddRoute,
  onUpdateRouteAgent,
}) => {
  const [activeTab, setActiveTab] = useState<"AREAS" | "ROUTES">("ROUTES");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);

  // Form states for Area
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaCode, setNewAreaCode] = useState("");
  const [newAreaDesc, setNewAreaDesc] = useState("");

  // Form states for Route
  const [newRouteName, setNewRouteName] = useState("");
  const [newRouteCode, setNewRouteCode] = useState("");
  const [newRouteAreaId, setNewRouteAreaId] = useState(areas[0]?.id || "");
  const [newRouteAgentId, setNewRouteAgentId] = useState(users.find((u) => u.role === "AGENT")?.id || "");
  const [newRouteFreq, setNewRouteFreq] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("WEEKLY");

  const agents = users.filter((u) => u.role === "AGENT");

  const handleCreateArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName || !newAreaCode) return;
    onAddArea({
      name: newAreaName,
      code: newAreaCode.toUpperCase(),
      branchId: "BR-01",
      description: newAreaDesc,
    });
    setNewAreaName("");
    setNewAreaCode("");
    setNewAreaDesc("");
    setShowAddAreaModal(false);
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName || !newRouteCode) return;
    const selectedArea = areas.find((a) => a.id === newRouteAreaId);
    const selectedAgent = users.find((u) => u.id === newRouteAgentId);

    onAddRoute({
      name: newRouteName,
      code: newRouteCode.toUpperCase(),
      areaId: newRouteAreaId,
      areaName: selectedArea?.name || "Rajahmundry",
      assignedAgentId: newRouteAgentId,
      assignedAgentName: selectedAgent?.name || "Unassigned",
      collectionFrequency: newRouteFreq,
      status: "ACTIVE",
    });

    setNewRouteName("");
    setNewRouteCode("");
    setShowAddRouteModal(false);
  };

  const filteredRoutes = routes.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.areaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.assignedAgentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAreas = areas.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3 pb-8">
      {/* Header & Hierarchy Ribbon */}
      <div className="surface-card bg-gradient-to-r from-[#0b192c] to-[#0f2744] text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Territory Management</span>
            <span className="bg-blue-900/80 text-blue-200 text-[10px] px-1.5 py-0.5 rounded-[5px] border border-blue-700">
              Branch → Area → Route
            </span>
          </div>
          <h1 className="text-base font-bold text-white mt-0.5">
            Operational Areas & Route-Wise Collection Beats
          </h1>
          <p className="text-xs text-slate-300">
            Define collection territories, assign field recovery agents, and monitor route efficiency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddAreaModal(true)}
            className="btn-navy bg-[#132841] hover:bg-[#1c3a5e] border-[#1f426a] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Area</span>
          </button>
          <button
            onClick={() => setShowAddRouteModal(true)}
            className="btn-navy-accent flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Route</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="surface-card p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-[5px]">
          <button
            onClick={() => setActiveTab("ROUTES")}
            className={`px-3 py-1 text-xs font-semibold rounded-[5px] transition-colors flex items-center gap-1.5 ${
              activeTab === "ROUTES"
                ? "bg-[#0b192c] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <RouteIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Collection Routes ({routes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("AREAS")}
            className={`px-3 py-1 text-xs font-semibold rounded-[5px] transition-colors flex items-center gap-1.5 ${
              activeTab === "AREAS"
                ? "bg-[#0b192c] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Major Areas ({areas.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter area, route or agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dense-input pl-8"
          />
        </div>
      </div>

      {/* Content View: ROUTES */}
      {activeTab === "ROUTES" && (
        <div className="surface-card">
          <div className="overflow-x-auto">
            <table className="dense-table">
              <thead>
                <tr>
                  <th>Route Code</th>
                  <th>Route Name</th>
                  <th>Area</th>
                  <th>Assigned Agent</th>
                  <th>Frequency</th>
                  <th>Borrowers</th>
                  <th>Today Target</th>
                  <th>Collected</th>
                  <th>Progress</th>
                  <th className="text-right">Reassign Agent</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((route) => {
                  const percent = Math.min(100, Math.round((route.todayCollected / (route.todayTarget || 1)) * 100));
                  return (
                    <tr key={route.id} className="hover:bg-blue-50/30">
                      <td className="font-mono font-bold text-[#1e40af]">
                        {route.code}
                      </td>
                      <td>
                        <span className="font-bold text-slate-900">{route.name}</span>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-[5px]">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {route.areaName}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{route.assignedAgentName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] bg-blue-50 text-[#1e40af] border border-blue-200">
                          {route.collectionFrequency}
                        </span>
                      </td>
                      <td className="font-semibold text-slate-800">
                        {route.totalCustomers}
                      </td>
                      <td className="text-slate-600 font-medium">
                        {formatINR(route.todayTarget || 0)}
                      </td>
                      <td className="font-bold text-emerald-700">
                        {formatINR(route.todayCollected)}
                      </td>
                      <td className="w-28">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="text-right">
                        <select
                          value={route.assignedAgentId}
                          onChange={(e) => {
                            const newAgent = users.find((u) => u.id === e.target.value);
                            if (newAgent) {
                              onUpdateRouteAgent(route.id, newAgent.id, newAgent.name);
                            }
                          }}
                          className="text-[11px] bg-white border border-slate-300 text-slate-800 py-1 px-1.5 rounded-[5px] focus:outline-none focus:border-[#1e40af]"
                        >
                          {agents.map((ag) => (
                            <option key={ag.id} value={ag.id}>
                              {ag.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content View: AREAS */}
      {activeTab === "AREAS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {filteredAreas.map((area) => (
            <div key={area.id} className="surface-card flex flex-col justify-between hover:border-[#1e40af] transition-colors">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#1e40af]" />
                    <h3 className="font-bold text-slate-900 text-sm">{area.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-50 text-[#1e40af] font-bold px-1.5 py-0.5 rounded-[5px] border border-blue-200">
                    {area.code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {area.description || "Operational regional division"}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Registered Customers:</span>
                  <span className="font-bold text-slate-800">{area.totalCustomers}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Active Borrowers:</span>
                  <span className="font-bold text-slate-800">{area.activeLoansCount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Outstanding:</span>
                  <span className="font-bold text-blue-900">{formatINR(area.totalOutstanding)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Area Modal */}
      {showAddAreaModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white border border-slate-300 w-full max-w-md p-4 rounded-[5px] shadow-dropdown space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Add New Operating Area</h2>
              <button onClick={() => setShowAddAreaModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>
            <form onSubmit={handleCreateArea} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Area Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Samalkota, Peddapuram"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  className="dense-input mt-0.5"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Area Code (2-4 Letters) *</label>
                <input
                  type="text"
                  placeholder="e.g. SMK, PDP"
                  value={newAreaCode}
                  onChange={(e) => setNewAreaCode(e.target.value)}
                  className="dense-input mt-0.5 uppercase"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Description / Key Landmarks</label>
                <textarea
                  placeholder="Commercial market line, bypass hub..."
                  value={newAreaDesc}
                  onChange={(e) => setNewAreaDesc(e.target.value)}
                  className="dense-input mt-0.5 h-16 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAreaModal(false)}
                  className="btn-outline-navy"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-navy-accent">
                  Save Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showAddRouteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white border border-slate-300 w-full max-w-md p-4 rounded-[5px] shadow-dropdown space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Create New Collection Route</h2>
              <button onClick={() => setShowAddRouteModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>
            <form onSubmit={handleCreateRoute} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Select Parent Area *</label>
                <select
                  value={newRouteAreaId}
                  onChange={(e) => setNewRouteAreaId(e.target.value)}
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
                <label className="text-[11px] font-semibold text-slate-700">Route Name & Streets *</label>
                <input
                  type="text"
                  placeholder="e.g. Route F - Kambala Tank & Stadium"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="dense-input mt-0.5"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Route Code *</label>
                <input
                  type="text"
                  placeholder="e.g. RJY-R-F"
                  value={newRouteCode}
                  onChange={(e) => setNewRouteCode(e.target.value)}
                  className="dense-input mt-0.5 uppercase"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Assign Field Agent *</label>
                  <select
                    value={newRouteAgentId}
                    onChange={(e) => setNewRouteAgentId(e.target.value)}
                    className="dense-select mt-0.5"
                  >
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Collection Type *</label>
                  <select
                    value={newRouteFreq}
                    onChange={(e: any) => setNewRouteFreq(e.target.value)}
                    className="dense-select mt-0.5"
                  >
                    <option value="DAILY">Daily Collections</option>
                    <option value="WEEKLY">Weekly Collections</option>
                    <option value="MONTHLY">Monthly Collections</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="btn-outline-navy"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-navy-accent">
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
