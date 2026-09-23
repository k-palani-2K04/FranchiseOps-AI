"use client";

import React, { useState, useEffect } from "react";
import api from "../lib/api";

interface CompareItem {
  id: number;
  outletName: string;
  city: string;
  manager: string;
  latitude: number;
  longitude: number;
  financials: {
    grossRevenue: number;
    operatingCost: number;
    netProfit: number;
    profitMargin: number;
    totalOrders: number;
    customerCount: number;
    averageOrderValue: string;
    paymentSplit: {
      upi: number;
      card: number;
      cash: number;
    };
  };
  operations: {
    stockIssues: number;
    staffCount: number;
    staffRating: string;
  };
}

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocationIds: number[];
}

export default function CompareModal({ isOpen, onClose, selectedLocationIds }: CompareModalProps) {
  const [data, setData] = useState<CompareItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && selectedLocationIds.length > 0) {
      fetchComparison();
    }
  }, [isOpen, selectedLocationIds]);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(
        `/outlets/compare?ids=${selectedLocationIds.join(",")}`
      );
      setData(res.data);
    } catch (err: any) {
      setError("Failed to load store comparison data");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Franchise Location Comparative Matrix</h2>
              <p className="text-xs text-slate-400">Comparing {data.length} selected store locations across financial & operational KPIs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Loading comparative analytics...</div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl text-center">{error}</div>
          ) : (
            <>
              {/* Top Cards Header Row */}
              <div className={`grid gap-4 ${data.length === 2 ? "grid-cols-2" : data.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
                {data.map((item) => (
                  <div key={item.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-xs relative">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      {item.city}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{item.outletName}</h3>
                    <p className="text-xs text-slate-500">Manager: {item.manager}</p>
                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Margin</span>
                      <span className={`font-bold ${item.financials.profitMargin >= 30 ? "text-emerald-600" : item.financials.profitMargin >= 20 ? "text-blue-600" : "text-red-600"}`}>
                        {item.financials.profitMargin}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comprehensive Comparison Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-900 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 border-b border-slate-200">Metric Category</th>
                      {data.map((item) => (
                        <th key={item.id} className="py-3.5 px-4 border-b border-slate-200">{item.city} Store</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50/50">Gross Revenue (60d)</td>
                      {data.map((item) => (
                        <td key={item.id} className="py-3 px-4 font-bold text-emerald-600">
                          ₹{item.financials.grossRevenue.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50/50">Operating Costs</td>
                      {data.map((item) => (
                        <td key={item.id} className="py-3 px-4 font-medium text-slate-700">
                          ₹{item.financials.operatingCost.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50/50">Net Profit</td>
                      {data.map((item) => (
                        <td key={item.id} className="py-3 px-4 font-bold text-cyan-600">
                          ₹{item.financials.netProfit.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50/50">Total Customer Orders</td>
                      {data.map((item) => (
                        <td key={item.id} className="py-3 px-4 font-medium text-slate-800">
                          {item.financials.totalOrders.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50/50">Average Order Value (AOV)</td>
                      {data.map((item) => (
                        <td key={item.id} className="py-3 px-4 font-medium text-slate-800">
                          ₹{item.financials.averageOrderValue}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50/50">Digital Payment % (UPI + Card)</td>
                      {data.map((item) => {
                        const total = item.financials.paymentSplit.upi + item.financials.paymentSplit.card + item.financials.paymentSplit.cash;
                        const digitalPct = total > 0 ? (((item.financials.paymentSplit.upi + item.financials.paymentSplit.card) / total) * 100).toFixed(1) : '0.0';
                        return (
                          <td key={item.id} className="py-3 px-4 font-medium text-indigo-600">
                            {digitalPct}%
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50/50">Active Inventory Low Stock Alerts</td>
                      {data.map((item) => (
                        <td key={item.id} className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${item.operations.stockIssues > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                            {item.operations.stockIssues} Alert{item.operations.stockIssues === 1 ? "" : "s"}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50/50">Active Staff Roster Count</td>
                      {data.map((item) => (
                        <td key={item.id} className="py-3 px-4 font-medium text-slate-800">
                          {item.operations.staffCount} Staff Members
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50/50">Average Staff Performance Rating</td>
                      {data.map((item) => (
                        <td key={item.id} className="py-3 px-4 font-bold text-amber-500 flex items-center space-x-1">
                          <span>★ {item.operations.staffRating}</span>
                          <span className="text-slate-400 font-normal text-[11px]">/ 5.0</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            Close Comparison Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
