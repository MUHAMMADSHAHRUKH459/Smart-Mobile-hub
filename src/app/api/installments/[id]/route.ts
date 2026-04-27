import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Payment {
  amountPaid: number;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const installment = await prisma.installment.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!installment) {
      return NextResponse.json(
        { error: "Installment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(installment);
  } catch (error) {
    console.error("Error fetching installment:", error);
    return NextResponse.json(
      { error: "Failed to fetch installment" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { amountPaid, note } = body;

    const installment = await prisma.installment.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!installment) {
      return NextResponse.json(
        { error: "Installment not found" },
        { status: 404 }
      );
    }

    const payment = await prisma.installmentPayment.create({
      data: {
        installmentId: id,
        amountPaid: parseFloat(amountPaid),
        note: note || null,
      },
    });

    const totalPaid = (installment.payments as Payment[]).reduce(
      (sum: number, p: Payment) => sum + p.amountPaid,
      0
    ) + parseFloat(amountPaid);

    const newRemaining = installment.totalPrice - installment.downPayment - totalPaid;
    const newStatus = newRemaining <= 0 ? "COMPLETED" : "ACTIVE";

    await prisma.installment.update({
      where: { id },
      data: {
        remainingAmount: Math.max(0, newRemaining),
        status: newStatus,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error adding payment:", error);
    return NextResponse.json(
      { error: "Failed to add payment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.installmentPayment.deleteMany({
      where: { installmentId: id },
    });

    await prisma.installment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting installment:", error);
    return NextResponse.json(
      { error: "Failed to delete installment" },
      { status: 500 }
    );
  }
}