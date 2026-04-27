import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SaleItem {
  totalAmount: number;
  profit: number;
  quantity: number;
  productName: string;
  unitPrice: number;
  createdAt: Date;
}

interface ProductItem {
  id: string;
  name: string;
  quantity: number;
  lowStockAlert: number;
  costPrice: number;
  sellingPrice: number;
}

export async function GET() {
  try {
    const [sales, products] = await Promise.all([
      prisma.sale.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.product.findMany(),
    ]);

    const typedSales = sales as unknown as SaleItem[];
    const typedProducts = products as unknown as ProductItem[];

    const totalSalesRevenue = typedSales.reduce((sum: number, s) => sum + s.totalAmount, 0);
    const totalSalesProfit = typedSales.reduce((sum: number, s) => sum + s.profit, 0);
    const totalRevenue = totalSalesRevenue;
    const totalProfit = totalSalesProfit;

    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    typedSales.forEach((s) => {
      if (!productSales[s.productName]) {
        productSales[s.productName] = { name: s.productName, quantity: 0, revenue: 0 };
      }
      productSales[s.productName].quantity += s.quantity;
      productSales[s.productName].revenue += s.totalAmount;
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const monthlySales: Record<string, { month: string; revenue: number; profit: number }> = {};
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString("en-PK", { month: "short", year: "numeric" });
    }).reverse();

    last6Months.forEach((month) => {
      monthlySales[month] = { month, revenue: 0, profit: 0 };
    });

    typedSales.forEach((s) => {
      const month = new Date(s.createdAt).toLocaleString("en-PK", {
        month: "short",
        year: "numeric",
      });
      if (monthlySales[month]) {
        monthlySales[month].revenue += s.totalAmount;
        monthlySales[month].profit += s.profit;
      }
    });

    const lowStockProducts = typedProducts.filter(
      (p) => p.quantity <= p.lowStockAlert
    );

    return NextResponse.json({
      totalRevenue,
      totalProfit,
      totalSalesRevenue,
      totalSalesProfit,
      topProducts,
      monthlySales: Object.values(monthlySales),
      lowStockProducts,
      totalSales: sales.length,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}