"use client";

import { useState } from "react";
import { X, CreditCard } from "lucide-react";
import { CreateInstallmentInput } from "@/types/installment";
import { formatCurrency } from "@/lib/utils";

interface InstallmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function InstallmentForm({
  onClose,
  onSuccess,
}: InstallmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateInstallmentInput>({
    customerName: "",
    contactNumber: "",
    productName: "",
    totalPrice: 0,
    downPayment: 0,
    monthlyAmount: 0,
    dueDate: "",
  });

  const remainingAmount = form.totalPrice - form.downPayment;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["totalPrice", "downPayment", "monthlyAmount"].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/installments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Error creating installment");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-100 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-indigo-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                New Installment
              </h2>
              <p className="text-xs text-slate-400">Add customer installment plan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition-colors"
          >
            <X className="w-4 h-4 text-indigo-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleInputChange}
              required
              placeholder="Ali Khan"
              className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleInputChange}
              required
              placeholder="03001234567"
              className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              value={form.productName}
              onChange={handleInputChange}
              required
              placeholder="iPhone 15 Pro"
              className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Total Price & Down Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Total Price (PKR)
              </label>
              <input
                type="number"
                name="totalPrice"
                value={form.totalPrice}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="80000"
                className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Down Payment (PKR)
              </label>
              <input
                type="number"
                name="downPayment"
                value={form.downPayment}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="20000"
                className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Monthly Amount & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monthly Amount (PKR)
              </label>
              <input
                type="number"
                name="monthlyAmount"
                value={form.monthlyAmount}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="10000"
                className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Price:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(form.totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Down Payment:</span>
              <span className="font-semibold text-green-600">{formatCurrency(form.downPayment)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-indigo-200 pt-2">
              <span className="text-slate-500">Remaining Amount:</span>
              <span className="font-bold text-indigo-600">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-200 text-slate-600 text-sm font-medium hover:bg-indigo-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Installment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}