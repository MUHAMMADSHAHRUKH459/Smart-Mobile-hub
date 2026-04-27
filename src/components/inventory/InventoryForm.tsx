"use client";

import { useState } from "react";
import { X, Package, Plus, Trash2 } from "lucide-react";
import { CreateProductInput, Product } from "@/types/inventory";

interface InventoryFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editProduct?: Product;
}

const categories = [
  "Smartphones",
  "Tablets",
  "Keypad",
  "Accessories",
];

export default function InventoryForm({
  onClose,
  onSuccess,
  editProduct,
}: InventoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [showImei2, setShowImei2] = useState(!!editProduct?.imei2);
  const [form, setForm] = useState<CreateProductInput>({
    name: editProduct?.name || "",
    modelName: editProduct?.modelName || "",
    category: editProduct?.category || "",
    quantity: editProduct?.quantity || 0,
    costPrice: editProduct?.costPrice || 0,
    sellingPrice: editProduct?.sellingPrice || 0,
    lowStockAlert: editProduct?.lowStockAlert || 5,
    imei1: editProduct?.imei1 || "",
    imei2: editProduct?.imei2 || "",
  });

  const profit = form.sellingPrice - form.costPrice;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["quantity", "costPrice", "sellingPrice", "lowStockAlert"].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editProduct
        ? `/api/inventory/${editProduct.id}`
        : "/api/inventory";
      const method = editProduct ? "PATCH" : "POST";

      const submitData = {
        ...form,
        imei2: showImei2 ? form.imei2 : "",
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
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
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {editProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-xs text-slate-400">Fill in product details</p>
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

          {/* Product Name & Model Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                required
                placeholder="iPhone"
                className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Model Name
              </label>
              <input
                type="text"
                name="modelName"
                value={form.modelName}
                onChange={handleInputChange}
                placeholder="15 Pro Max"
                className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleSelectChange}
              required
              className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select...</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* IMEI 1 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              IMEI 1
            </label>
            <input
              type="text"
              name="imei1"
              value={form.imei1}
              onChange={handleInputChange}
              placeholder="350000000000000"
              maxLength={15}
              className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* IMEI 2 */}
          {showImei2 ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  IMEI 2
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowImei2(false);
                    setForm((prev) => ({ ...prev, imei2: "" }));
                  }}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
              <input
                type="text"
                name="imei2"
                value={form.imei2}
                onChange={handleInputChange}
                placeholder="350000000000001"
                maxLength={15}
                className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowImei2(true)}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Another IMEI
            </button>
          )}

          {/* Quantity & Low Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Low Stock Alert
              </label>
              <input
                type="number"
                name="lowStockAlert"
                value={form.lowStockAlert}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Cost & Selling Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cost Price (PKR)
              </label>
              <input
                type="number"
                name="costPrice"
                value={form.costPrice}
                onChange={handleInputChange}
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
                name="sellingPrice"
                value={form.sellingPrice}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Profit Preview */}
          <div className={`rounded-xl px-4 py-3 flex items-center justify-between border ${
            profit >= 0
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}>
            <span className="text-sm font-medium text-slate-600">
              Profit per unit
            </span>
            <span className={`text-lg font-bold ${
              profit >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              PKR {profit.toLocaleString()}
            </span>
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
              {loading ? "Saving..." : editProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}