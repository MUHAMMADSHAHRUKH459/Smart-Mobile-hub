"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardData {
  totalRevenue: number;
  totalProfit: number;
  totalSalesRevenue: number;
  totalSalesProfit: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  lowStockProducts: {
    id: string;
    name: string;
    quantity: number;
    lowStockAlert: number;
  }[];
  totalSales: number;
}

interface RecentSale {
  id: string;
  invoiceNo: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  profit: number;
  createdAt: string;
}

interface RecentInstallment {
  id: string;
  customerName: string;
  productName: string;
  remainingAmount: number;
  status: string;
  dueDate: string;
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardData | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [recentInstallments, setRecentInstallments] = useState<RecentInstallment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [analyticsRes, salesRes, installmentsRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/sales"),
          fetch("/api/installments"),
        ]);

        const [analyticsData, salesData, installmentsData] = await Promise.all([
          analyticsRes.json(),
          salesRes.json(),
          installmentsRes.json(),
        ]);

        if (!cancelled) {
          setAnalytics(analyticsData);
          setRecentSales(Array.isArray(salesData) ? salesData.slice(0, 5) : []);
          setRecentInstallments(Array.isArray(installmentsData) ? installmentsData.slice(0, 5) : []);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(analytics?.totalRevenue || 0),
      icon: DollarSign,
      lightColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      label: "Total Profit",
      value: formatCurrency(analytics?.totalProfit || 0),
      icon: TrendingUp,
      lightColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Total Sales",
      value: analytics?.totalSales || 0,
      icon: ShoppingCart,
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Products",
      value: analytics?.lowStockProducts !== undefined
        ? (analytics.lowStockProducts.length > 0 ? `${analytics.lowStockProducts.length} Low` : "All Good")
        : "—",
      icon: Package,
      lightColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
  ];

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md shadow-indigo-200">
          <h1 className="text-xl lg:text-2xl font-bold mb-1">Welcome back, Admin! 👋</h1>
          <p className="text-indigo-100 text-sm">Here is your business overview for today.</p>
          <div className="mt-3 flex flex-wrap gap-6">
            <div>
              <p className="text-indigo-200 text-xs">Sales Revenue</p>
              <p className="text-white font-bold">{formatCurrency(analytics?.totalSalesRevenue || 0)}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs">Total Profit</p>
              <p className="text-white font-bold">{formatCurrency(analytics?.totalProfit || 0)}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs">Total Sales</p>
              <p className="text-white font-bold">{analytics?.totalSales || 0}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-indigo-100 p-4 lg:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs lg:text-sm text-slate-500">{stat.label}</p>
                  <div className={`w-8 h-8 lg:w-9 lg:h-9 ${stat.lightColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${stat.textColor}`} />
                  </div>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Low Stock */}
          <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <h3 className="text-base font-semibold text-slate-800">Low Stock Alert</h3>
            </div>
            {!analytics?.lowStockProducts.length ? (
              <div className="flex flex-col items-center justify-center h-28 text-center">
                <Package className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-xs text-slate-400">All products well stocked</p>
              </div>
            ) : (
              <div className="space-y-2">
                {analytics.lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-2.5 bg-yellow-50 rounded-xl border border-yellow-100">
                    <p className="text-xs font-medium text-slate-700 truncate">{product.name}</p>
                    <span className="text-xs font-bold text-yellow-600 ml-2 shrink-0">{product.quantity} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Top Products</h3>
            {!analytics?.topProducts.length ? (
              <div className="flex flex-col items-center justify-center h-28 text-center">
                <ShoppingCart className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">No sales data yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {analytics.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.name} className="flex items-center gap-3 p-2.5 bg-indigo-50 rounded-xl">
                    <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-xs font-medium text-slate-700 flex-1 truncate">{product.name}</p>
                    <span className="text-xs text-slate-400 shrink-0">{product.quantity} sold</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Sales */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-50">
              <h3 className="text-base font-semibold text-slate-800">Recent Sales</h3>
              <a href="/sales" className="text-xs text-indigo-600 hover:underline">View all</a>
            </div>
            <div className="divide-y divide-indigo-50">
              {recentSales.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No sales yet</p>
                </div>
              ) : (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between px-5 py-3 hover:bg-indigo-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{sale.productName}</p>
                      <p className="text-xs text-slate-400">{sale.quantity} units • {formatDate(sale.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">{formatCurrency(sale.totalAmount)}</p>
                      <p className="text-xs text-green-500">+{formatCurrency(sale.profit)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Installments */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-50">
              <h3 className="text-base font-semibold text-slate-800">Recent Installments</h3>
              <a href="/installments" className="text-xs text-indigo-600 hover:underline">View all</a>
            </div>
            <div className="divide-y divide-indigo-50">
              {recentInstallments.length === 0 ? (
                <div className="p-8 text-center">
                  <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No installments yet</p>
                </div>
              ) : (
                recentInstallments.map((inst) => (
                  <div key={inst.id} className="flex items-center justify-between px-5 py-3 hover:bg-indigo-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{inst.customerName}</p>
                      <p className="text-xs text-slate-400 truncate">{inst.productName}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        inst.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : inst.status === "OVERDUE"
                          ? "bg-red-100 text-red-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {inst.status.charAt(0) + inst.status.slice(1).toLowerCase()}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(inst.remainingAmount)} left</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}