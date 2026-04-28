import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Product {
  id: string;
  name: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockAlert: number;
  category: string;
}

interface Sale {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  profit: number;
  createdAt: Date;
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const [sales, products] = await Promise.all([
      prisma.sale.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.product.findMany(),
    ]);

    const totalSalesRevenue = (sales as Sale[]).reduce((sum, s) => sum + s.totalAmount, 0);
    const totalSalesProfit = (sales as Sale[]).reduce((sum, s) => sum + s.profit, 0);
    const lowStockProducts = (products as Product[]).filter((p) => p.quantity <= p.lowStockAlert);

    const businessContext = `You are an AI assistant for a Smart Mobile Hub Management System for a small shop in Pakistan.
You help the shop owner analyze their business data and answer questions.
Always respond in the same language the user writes in (Urdu, Roman Urdu, or English).
Keep responses concise and helpful.

Current Business Data:
- Total Products in Inventory: ${products.length}
- Low Stock Products: ${lowStockProducts.length} (${lowStockProducts.map((p) => p.name).join(", ") || "None"})
- Total Sales: ${sales.length}
- Total Sales Revenue: PKR ${totalSalesRevenue.toLocaleString()}
- Total Sales Profit: PKR ${totalSalesProfit.toLocaleString()}

Top Products in Inventory:
${(products as Product[]).slice(0, 5).map((p) => `- ${p.name}: ${p.quantity} units, Cost: PKR ${p.costPrice}, Selling: PKR ${p.sellingPrice}`).join("\n")}

Recent Sales:
${(sales as Sale[]).slice(0, 5).map((s) => `- ${s.productName}: ${s.quantity} units @ PKR ${s.unitPrice}, Profit: PKR ${s.profit}`).join("\n")}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pak-repair-management-system.vercel.app",
        "X-Title": "Smart Mobile hub",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [
          { role: "system", content: businessContext },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const aiResponse =
      data.choices?.[0]?.message?.content ||
      "Sorry, kuch error aa gaya. Dobara try karein.";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}