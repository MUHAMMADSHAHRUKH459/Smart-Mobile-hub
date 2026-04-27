"use client";

import { useState } from "react";
import { Installment } from "@/types/installment";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Trash2, CreditCard, Plus, ChevronDown, ChevronUp } from "lucide-react";

interface InstallmentTableProps {
  installments: Installment[];
  onRefresh: () => void;
}

interface PaymentFormState {
  amountPaid: number;
  note: string;
}

export default function InstallmentTable({
  installments,
  onRefresh,
}: InstallmentTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
    amountPaid: 0,
    note: "",
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this installment?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/installments/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (error) {
      console.error("Error deleting installment:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddPayment = async (id: string) => {
    if (!paymentForm.amountPaid) return;
    setPayingId(id);
    try {
      await fetch(`/api/installments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm),
      });
      setPaymentForm({ amountPaid: 0, note: "" });
      onRefresh();
    } catch (error) {
      console.error("Error adding payment:", error);
    } finally {
      setPayingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "OVERDUE":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
    }
  };

  if (installments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-indigo-100 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">
          No Installments Yet
        </h3>
        <p className="text-sm text-slate-400">
          Add your first installment to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {installments.map((installment) => {
        const isExpanded = expandedId === installment.id;
        const totalPaid = installment.payments.reduce(
          (sum, p) => sum + p.amountPaid,
          0
        );
        const progressPercent = Math.min(
          100,
          ((installment.downPayment + totalPaid) / installment.totalPrice) * 100
        );

        return (
          <div
            key={installment.id}
            className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden"
          >
            {/* Main Row */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    {installment.customerName}
                  </h3>
                  <p className="text-xs text-slate-400">{installment.contactNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusStyle(installment.status)}`}>
                    {installment.status}
                  </span>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : installment.id)}
                    className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(installment.id)}
                    disabled={deletingId === installment.id}
                    className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Product */}
              <p className="text-sm font-medium text-indigo-600 mb-3">
                {installment.productName}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <div className="bg-indigo-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">Total Price</p>
                  <p className="text-sm font-bold text-slate-800">
                    {formatCurrency(installment.totalPrice)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">Down Payment</p>
                  <p className="text-sm font-bold text-green-600">
                    {formatCurrency(installment.downPayment)}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">Remaining</p>
                  <p className="text-sm font-bold text-orange-600">
                    {formatCurrency(installment.remainingAmount)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">Monthly</p>
                  <p className="text-sm font-bold text-purple-600">
                    {formatCurrency(installment.monthlyAmount)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Payment Progress</span>
                  <span>{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-indigo-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Due Date: {formatDate(installment.dueDate)}
              </p>
            </div>

            {/* Expanded Section */}
            {isExpanded && (
              <div className="border-t border-indigo-100 p-5 bg-indigo-50/50">
                {/* Add Payment */}
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Add Payment
                </h4>
                <div className="flex gap-3 mb-4">
                  <input
                    type="number"
                    placeholder="Amount (PKR)"
                    value={paymentForm.amountPaid || ""}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        amountPaid: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="flex-1 px-3 py-2 rounded-xl border border-indigo-200 bg-white text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={paymentForm.note}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 rounded-xl border border-indigo-200 bg-white text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={() => handleAddPayment(installment.id)}
                    disabled={payingId === installment.id}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Payment History */}
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Payment History
                </h4>
                {installment.payments.length === 0 ? (
                  <p className="text-xs text-slate-400">No payments yet</p>
                ) : (
                  <div className="space-y-2">
                    {installment.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-indigo-100"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {formatCurrency(payment.amountPaid)}
                          </p>
                          {payment.note && (
                            <p className="text-xs text-slate-400">{payment.note}</p>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {formatDate(payment.paymentDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}