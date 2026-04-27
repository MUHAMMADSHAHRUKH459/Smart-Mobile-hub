import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      modelName,
      category,
      quantity,
      costPrice,
      sellingPrice,
      lowStockAlert,
      imei1,
      imei2,
    } = body;

    const product = await prisma.product.create({
      data: {
        name,
        modelName: modelName || "",
        category,
        quantity: parseInt(quantity),
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        lowStockAlert: parseInt(lowStockAlert),
        imei1: imei1 || null,
        imei2: imei2 || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}