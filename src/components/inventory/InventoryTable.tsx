"use client";

import { useState } from "react";
import { Product } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import StockBadge from "./StockBadge";
import { Trash2, Pencil, Package, Smartphone, ShoppingCart } from "lucide-react";

interface InventoryTableProps {
  products: Product[];
  onRefresh: () => void;
  onEdit: (product: Product) => void;
  onSell: (product: Product) => void;
}

export default function InventoryTable({
  products,
  onRefresh,
  onEdit,
  onSell,
}: InventoryTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-indigo-100 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">
          No Products Yet
        </h3>
        <p className="text-sm text-slate-400">
          Add your first product to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-indigo-50 border-b border-indigo-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Product</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Model</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">IMEI</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Qty</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Cost</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Selling</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Profit</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-50">
            {products.map((product) => {
              const profitPerUnit = product.sellingPrice - product.costPrice;
              return (
                <tr key={product.id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-indigo-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-800">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600">{product.modelName || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {product.imei1 ? (
                        <p className="text-xs font-mono bg-slate-50 text-slate-600 px-2 py-1 rounded-lg">
                          {product.imei1}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-300">—</p>
                      )}
                      {product.imei2 && (
                        <p className="text-xs font-mono bg-slate-50 text-slate-600 px-2 py-1 rounded-lg">
                          {product.imei2}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-800">{product.quantity}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600">{formatCurrency(product.costPrice)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600">{formatCurrency(product.sellingPrice)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className={`text-sm font-semibold ${profitPerUnit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(profitPerUnit)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge quantity={product.quantity} lowStockAlert={product.lowStockAlert} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSell(product)}
                        disabled={product.quantity === 0}
                        className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Sell"
                      >
                        <ShoppingCart className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-indigo-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}