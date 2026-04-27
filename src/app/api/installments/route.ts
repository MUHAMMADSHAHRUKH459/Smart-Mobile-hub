import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const installments = await prisma.installment.findMany({
      orderBy: { createdAt: "desc" },
      include: { payments: true },
    });
    return NextResponse.json(installments);
  } catch (error) {
    console.error("Error fetching installments:", error);
    return NextResponse.json(
      { error: "Failed to fetch installments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      contactNumber,
      productName,
      totalPrice,
      downPayment,
      monthlyAmount,
      dueDate,
    } = body;

    const total = parseFloat(totalPrice);
    const down = parseFloat(downPayment);
    const remaining = total - down;

    const installment = await prisma.installment.create({
      data: {
        customerName,
        contactNumber,
        productName,
        totalPrice: total,
        downPayment: down,
        remainingAmount: remaining,
        monthlyAmount: parseFloat(monthlyAmount),
        dueDate: new Date(dueDate),
      },
      include: { payments: true },
    });

    return NextResponse.json(installment, { status: 201 });
  } catch (error) {
    console.error("Error creating installment:", error);
    return NextResponse.json(
      { error: "Failed to create installment" },
      { status: 500 }
    );
  }
}