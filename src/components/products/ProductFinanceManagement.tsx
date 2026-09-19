"use client";

import React, { useState } from "react";
import { Customer, Loan, Product, ProductFinanceOrder, User } from "@/types";
import { formatINR } from "@/lib/storage";
import {
  ShoppingBag,
  Plus,
  Search,
  Tv,
  Smartphone,
  Bike,
  Package,
  CheckCircle,
  TrendingUp,
  Tag,
  DollarSign,
  Layers
} from "lucide-react";

interface ProductFinanceManagementProps {
  products: Product[];
  productFinanceOrders: ProductFinanceOrder[];
  customers: Customer[];
  users: User[];
  onAddProductOrder: (order: Omit<ProductFinanceOrder, "id" | "orderNumber" | "orderDate" | "status">) => void;
  onAddProduct: (product: Omit<Product, "id">) => void;
}

export const ProductFinanceManagement: React.FC<ProductFinanceManagementProps> = ({
  products,
  productFinanceOrders,
  customers,
  users,
  onAddProductOrder,
  onAddProduct,
}) => {
  const [activeTab, setActiveTab] = useState<"ORDERS" | "CATALOG">("ORDERS");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);

  // Form states for New Product Finance Order
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || "");
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [downPayment, setDownPayment] = useState<number>(10000);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [interestRate, setInterestRate] = useState<number>(18);
  const [serialNumber, setSerialNumber] = useState("");

  // Form states for New Product in Catalog
  const [newProdName, setNewProdName] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<Product["category"]>("MOBILE");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdCost, setNewProdCost] = useState<number>(30000);
  const [newProdPrice, setNewProdPrice] = useState<number>(38000);
  const [newProdStock, setNewProdStock] = useState<number>(5);
  const [newProdDownPayment, setNewProdDownPayment] = useState<number>(8000);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Calculated numbers for active form
  const productCost = selectedProduct?.productCost || 0;
  const sellingPrice = selectedProduct?.sellingPrice || 0;
  const financedAmount = Math.max(0, sellingPrice - downPayment);
  const totalInterest = Math.round((financedAmount * interestRate) / 100);
  const totalRepayable = financedAmount + totalInterest;
  const monthlyEmi = Math.ceil(totalRepayable / tenureMonths);
  const totalProfitMargin = (sellingPrice - productCost) + totalInterest;

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedCustomer) return;

    onAddProductOrder({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerCode: selectedCustomer.customerCode,
      customerPhone: selectedCustomer.mobileNumber,
      loanId: `LN-PF-${Date.now().toString().slice(-4)}`,
      productCost: selectedProduct.productCost,
      sellingPrice: selectedProduct.sellingPrice,
      downPayment: Number(downPayment),
      financedAmount,
      profitMargin: totalProfitMargin,
      tenureMonths: Number(tenureMonths),
      monthlyEmi,
      serialNumber: serialNumber || `SN-${Date.now()}`,
    });

    setShowNewOrderModal(false);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdSku) return;

    onAddProduct({
      sku: newProdSku.toUpperCase(),
      name: newProdName,
      category: newProdCategory,
      brand: newProdBrand || "Brand",
      productCost: Number(newProdCost),
      sellingPrice: Number(newProdPrice),
      stockQuantity: Number(newProdStock),
      standardDownPayment: Number(newProdDownPayment),
      standardTenureMonths: 12,
      status: "IN_STOCK",
    });

    setNewProdName("");
    setNewProdSku("");
    setShowNewProductModal(false);
  };

  const filteredOrders = productFinanceOrders.filter((o) =>
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3 pb-8">
      {/* Top Banner */}
      <div className="surface-card bg-gradient-to-r from-[#0b192c] to-[#0f2744] text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Consumer Product Financing</span>
            <span className="bg-amber-900/80 text-amber-200 text-[10px] px-1.5 py-0.5 rounded-[5px] border border-amber-700">
              Down Payment + EMI Profit Engine
            </span>
          </div>
          <h1 className="text-base font-bold text-white mt-0.5">
            Mobiles, Appliances & Two-Wheeler Product Finance
          </h1>
          <p className="text-xs text-slate-300">
            Sell consumer appliances with upfront down payments, calculated EMI schedules, and high retail profit margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewProductModal(true)}
            className="btn-outline-navy bg-[#132841] text-slate-200 hover:bg-[#1b385a] border-[#22446c] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Catalog Item</span>
          </button>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="btn-navy-accent flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Finance New Product</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="surface-card p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-[5px]">
          <button
            onClick={() => setActiveTab("ORDERS")}
            className={`px-3 py-1 text-xs font-semibold rounded-[5px] transition-colors flex items-center gap-1.5 ${
              activeTab === "ORDERS"
                ? "bg-[#0b192c] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Financed Orders ({productFinanceOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("CATALOG")}
            className={`px-3 py-1 text-xs font-semibold rounded-[5px] transition-colors flex items-center gap-1.5 ${
              activeTab === "CATALOG"
                ? "bg-[#0b192c] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Product Inventory ({products.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, product or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dense-input pl-8"
          />
        </div>
      </div>

      {/* View: FINANCED ORDERS */}
      {activeTab === "ORDERS" && (
        <div className="surface-card">
          <div className="overflow-x-auto">
            <table className="dense-table">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Product & Category</th>
                  <th>Customer</th>
                  <th>Selling Price</th>
                  <th>Down Payment</th>
                  <th>Financed Balance</th>
                  <th>Monthly EMI</th>
                  <th>Profit Margin</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-slate-400">
                      No financed product orders match your search.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-blue-50/30">
                      <td className="font-mono font-bold text-[#1e40af]">
                        {ord.orderNumber}
                      </td>
                      <td>
                        <p className="font-bold text-slate-900 leading-tight">{ord.productName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">SN: {ord.serialNumber || "N/A"}</p>
                      </td>
                      <td>
                        <p className="font-semibold text-slate-800 text-[11px]">{ord.customerName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{ord.customerCode}</p>
                      </td>
                      <td className="font-bold text-slate-900">
                        {formatINR(ord.sellingPrice)}
                      </td>
                      <td className="text-emerald-700 font-semibold">
                        {formatINR(ord.downPayment)}
                      </td>
                      <td className="font-medium text-slate-700">
                        {formatINR(ord.financedAmount)}
                      </td>
                      <td className="font-bold text-slate-800">
                        {formatINR(ord.monthlyEmi)} <span className="text-[10px] text-slate-500 font-normal">({ord.tenureMonths}m)</span>
                      </td>
                      <td className="font-bold text-teal-700">
                        {formatINR(ord.profitMargin)}
                      </td>
                      <td>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] bg-emerald-50 text-emerald-800 border border-emerald-300">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View: PRODUCT CATALOG */}
      {activeTab === "CATALOG" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredProducts.map((prod) => {
            const margin = prod.sellingPrice - prod.productCost;
            return (
              <div key={prod.id} className="surface-card flex flex-col justify-between hover:border-[#1e40af] transition-colors">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#1e40af] uppercase tracking-wider">{prod.brand}</span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{prod.name}</h3>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-[5px]">
                      {prod.sku}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-50 p-2 rounded-[5px] border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Cost Price</span>
                      <p className="font-semibold text-slate-800">{formatINR(prod.productCost)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Selling Price</span>
                      <p className="font-bold text-slate-900">{formatINR(prod.sellingPrice)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Retail Margin</span>
                      <p className="font-bold text-emerald-700">+{formatINR(margin)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">In Stock</span>
                      <p className="font-bold text-slate-800">{prod.stockQuantity} Units</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-600">
                    Min DP: <span className="font-semibold text-slate-800">{formatINR(prod.standardDownPayment)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProductId(prod.id);
                      setDownPayment(prod.standardDownPayment);
                      setShowNewOrderModal(true);
                    }}
                    className="btn-navy-accent text-[10px] py-1 px-2.5"
                  >
                    Finance Item
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Finance New Product Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white border border-slate-300 w-full max-w-xl p-4 rounded-[5px] shadow-dropdown space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">Finance Product Sale (EMI Order)</h2>
              </div>
              <button onClick={() => setShowNewOrderModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Select Borrower / Customer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="dense-select mt-0.5"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.customerCode}) - {c.areaName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">Select Product from Catalog *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod) setDownPayment(prod.standardDownPayment);
                  }}
                  className="dense-select mt-0.5"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Retail {formatINR(p.sellingPrice)} (Stock: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Down Payment (₹) *</label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="dense-input mt-0.5 font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Tenure (Months) *</label>
                  <select
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(Number(e.target.value))}
                    className="dense-select mt-0.5"
                  >
                    <option value={6}>6 Months</option>
                    <option value={8}>8 Months</option>
                    <option value={10}>10 Months</option>
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={18}>18 Months</option>
                    <option value={24}>24 Months (2 Years)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="dense-input mt-0.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">Item Serial / IMEI / Chassis Number</label>
                <input
                  type="text"
                  placeholder="e.g. IMEI 354892019284019 or Reg AP 05 XX 1234"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="dense-input mt-0.5 font-mono"
                />
              </div>

              {/* Real-time Profit & EMI Breakdown calculation */}
              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-[5px] space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-[#1e40af] font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>Real-time Financial & Profit Breakdown</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-blue-200/60">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Financed Principal</span>
                    <p className="font-bold text-slate-900">{formatINR(financedAmount)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Monthly EMI</span>
                    <p className="font-bold text-[#1e40af] text-sm">{formatINR(monthlyEmi)}/mo</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Interest Income</span>
                    <p className="font-bold text-emerald-700">{formatINR(totalInterest)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Net Profit Margin</span>
                    <p className="font-bold text-emerald-800 text-sm">+{formatINR(totalProfitMargin)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="btn-outline-navy"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-navy-accent">
                  Create Product Finance Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showNewProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white border border-slate-300 w-full max-w-md p-4 rounded-[5px] shadow-dropdown space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Add Item to Financed Catalog</h2>
              <button onClick={() => setShowNewProductModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Samsung Galaxy A55 5G"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="dense-input mt-0.5"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">SKU Code *</label>
                  <input
                    type="text"
                    placeholder="PROD-SAMS-A55"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="dense-input mt-0.5 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Category *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e: any) => setNewProdCategory(e.target.value)}
                    className="dense-select mt-0.5"
                  >
                    <option value="MOBILE">Mobile Phone</option>
                    <option value="TV">Television</option>
                    <option value="REFRIGERATOR">Refrigerator</option>
                    <option value="WASHING_MACHINE">Washing Machine</option>
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Cost Price (₹) *</label>
                  <input
                    type="number"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(Number(e.target.value))}
                    className="dense-input mt-0.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="dense-input mt-0.5 font-bold"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Initial Stock Units</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="dense-input mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Standard Down Payment (₹)</label>
                  <input
                    type="number"
                    value={newProdDownPayment}
                    onChange={(e) => setNewProdDownPayment(Number(e.target.value))}
                    className="dense-input mt-0.5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="btn-outline-navy"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-navy-accent">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
