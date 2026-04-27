"use client";

import { useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types/inventory";

interface SalesFormProps {
  onClose: () => void;
  onSuccess: () => void;
  preSelectedProduct?: Product;
}

export default function SalesForm({ onClose, onSuccess, preSelectedProduct }: SalesFormProps) {
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState(
    preSelectedProduct ? `${preSelectedProduct.name} ${preSelectedProduct.modelName}`.trim() : ""
  );
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(preSelectedProduct?.sellingPrice || 0);
  const [costPrice, setCostPrice] = useState(preSelectedProduct?.costPrice || 0);
  const [linkedProductId] = useState(preSelectedProduct?.id || "");

  const totalAmount = unitPrice * quantity;
  const profit = (unitPrice - costPrice) * quantity;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          quantity,
          unitPrice,
          costPrice,
          linkedProductId,
        }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Error creating sale");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-100 w-full max-w-lg border border-indigo-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">New Sale</h2>
              <p className="text-xs text-slate-400">
                {preSelectedProduct ? `Selling: ${preSelectedProduct.name} ${preSelectedProduct.modelName}` : "Create a new sale entry"}
              </p>
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
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              placeholder="e.g. iPhone 15 Pro"
              readOnly={!!preSelectedProduct}
              className={`w-full px-3 py-2 rounded-xl border border-indigo-100 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400 ${
                preSelectedProduct ? "bg-indigo-50 cursor-not-allowed" : "bg-indigo-50"
              }`}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              required
              min="1"
              max={preSelectedProduct?.quantity || 999}
              className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {preSelectedProduct && (
              <p className="text-xs text-slate-400 mt-1">
                Available stock: {preSelectedProduct.quantity}
              </p>
            )}
          </div>

          {/* Cost & Selling Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cost Price (PKR)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                required
                min="0"
                className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Selling Price (PKR)
              </label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                required
                min="0"
                className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Summary */}
          <div className={`rounded-xl p-4 space-y-2 border ${
            profit >= 0
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Amount:</span>
              <span className="font-bold text-slate-800">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Profit:</span>
              <span className={`font-bold ${profit >= 0 ? "text-green-600" : "text-red-500"}`}>
                {formatCurrency(profit)}
              </span>
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
              {loading ? "Processing..." : "Complete Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}