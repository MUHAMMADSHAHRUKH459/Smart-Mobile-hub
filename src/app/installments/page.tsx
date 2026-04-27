"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import InstallmentTable from "@/components/installments/InstallmentTable";
import InstallmentForm from "@/components/installments/InstallmentForm";
import { Installment } from "@/types/installment";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function InstallmentsPage() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadInstallments() {
      setLoading(true);
      try {
        const res = await fetch("/api/installments");
        const data = await res.json();
        if (!cancelled) setInstallments(data);
      } catch (error) {
        console.error("Error fetching installments:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInstallments();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  const totalInstallments = installments.length;
  const activeInstallments = installments.filter(
    (i) => i.status === "ACTIVE"
  ).length;
  const completedInstallments = installments.filter(
    (i) => i.status === "COMPLETED"
  ).length;
  const totalRemaining = installments.reduce(
    (sum, i) => sum + i.remainingAmount,
    0
  );

  const stats = [
    {
      label: "Total Installments",
      value: totalInstallments,
      icon: CreditCard,
      lightColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      label: "Active",
      value: activeInstallments,
      icon: Clock,
      lightColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Completed",
      value: completedInstallments,
      icon: CheckCircle,
      lightColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Total Remaining",
      value: formatCurrency(totalRemaining),
      icon: AlertCircle,
      lightColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  return (
    <MainLayout title="Installments">
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Installments
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage customer installment plans
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
              New Installment
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
                <p className="text-2xl font-bold text-slate-800">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-indigo-100 p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading installments...</p>
          </div>
        ) : (
          <InstallmentTable
            installments={installments}
            onRefresh={handleRefresh}
          />
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <InstallmentForm
          onClose={() => setShowForm(false)}
          onSuccess={handleRefresh}
        />
      )}
    </MainLayout>
  );
}