"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import InventoryTable from "@/components/inventory/InventoryTable";
import InventoryForm from "@/components/inventory/InventoryForm";
import SalesForm from "@/components/sales/SalesForm";
import { Product } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Search,
  Smartphone,
} from "lucide-react";

function InventoryContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>(undefined);
  const [sellProduct, setSellProduct] = useState<Product | undefined>(undefined);
  const [showSaleForm, setShowSaleForm] = useState(false);
  // ✅ Fix: initial value seedha searchParams se lo, second useEffect ki zaroorat nahi
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch("/api/inventory");
        const data = await res.json();
        if (!cancelled) setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // ✅ Removed: second useEffect jo searchParams pe setState karta tha

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditProduct(undefined);
  };

  const handleSell = (product: Product) => {
    setSellProduct(product);
    setShowSaleForm(true);
  };

  const handleCloseSaleForm = () => {
    setShowSaleForm(false);
    setSellProduct(undefined);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.modelName?.toLowerCase().includes(search.toLowerCase()) ||
      p.imei1?.toLowerCase().includes(search.toLowerCase()) ||
      p.imei2?.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.lowStockAlert
  ).length;
  const outOfStock = products.filter((p) => p.quantity === 0).length;
  const totalValue = products.reduce(
    (sum, p) => sum + p.sellingPrice * p.quantity,
    0
  );

  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Smartphone,
      lightColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      label: "Low Stock",
      value: lowStockProducts,
      icon: AlertTriangle,
      lightColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      label: "Out of Stock",
      value: outOfStock,
      icon: Package,
      lightColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      label: "Inventory Value",
      value: formatCurrency(totalValue),
      icon: TrendingUp,
      lightColor: "bg-green-50",
      textColor: "text-green-600",
    },
  ];

  return (
    <MainLayout title="Inventory">
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage your products, stock levels and IMEI numbers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="w-9 h-9 rounded-xl bg-white border border-indigo-100 flex items-center justify-center hover:bg-indigo-50 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4 text-indigo-500" />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <div className={`w-9 h-9 ${stat.lightColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
          <input
            type="text"
            placeholder="Search by name, model, category or IMEI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-indigo-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 shadow-sm"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-indigo-100 p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading products...</p>
          </div>
        ) : (
          <InventoryTable
            products={filteredProducts}
            onRefresh={handleRefresh}
            onEdit={handleEdit}
            onSell={handleSell}
          />
        )}
      </div>

      {/* Inventory Form Modal */}
      {showForm && (
        <InventoryForm
          onClose={handleCloseForm}
          onSuccess={handleRefresh}
          editProduct={editProduct}
        />
      )}

      {/* Sale Form Modal */}
      {showSaleForm && sellProduct && (
        <SalesForm
          onClose={handleCloseSaleForm}
          onSuccess={() => {
            handleRefresh();
            handleCloseSaleForm();
          }}
          preSelectedProduct={sellProduct}
        />
      )}
    </MainLayout>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InventoryContent />
    </Suspense>
  );
}