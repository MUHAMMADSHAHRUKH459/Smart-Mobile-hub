import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateInvoiceNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${dateStr}-${random}`;
}

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, quantity, unitPrice, costPrice, linkedProductId } = body;

    const totalAmount = unitPrice * quantity;
    const profit = (unitPrice - costPrice) * quantity;

    const sale = await prisma.sale.create({
      data: {
        invoiceNo: generateInvoiceNo(),
        productName,
        quantity: parseInt(quantity),
        unitPrice: parseFloat(unitPrice),
        costPrice: parseFloat(costPrice),
        totalAmount,
        profit,
      },
    });

    if (linkedProductId) {
      const product = await prisma.product.findUnique({
        where: { id: linkedProductId },
      });

      if (product) {
        await prisma.product.update({
          where: { id: linkedProductId },
          data: {
            quantity: Math.max(0, product.quantity - parseInt(quantity)),
          },
        });
      }
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}