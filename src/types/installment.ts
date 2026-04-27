export type InstallmentStatus = "ACTIVE" | "COMPLETED" | "OVERDUE";

export interface InstallmentPayment {
  id: string;
  installmentId: string;
  amountPaid: number;
  paymentDate: string;
  note?: string;
}

export interface Installment {
  id: string;
  customerName: string;
  contactNumber: string;
  productName: string;
  totalPrice: number;
  downPayment: number;
  remainingAmount: number;
  monthlyAmount: number;
  dueDate: string;
  status: InstallmentStatus;
  payments: InstallmentPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstallmentInput {
  customerName: string;
  contactNumber: string;
  productName: string;
  totalPrice: number;
  downPayment: number;
  monthlyAmount: number;
  dueDate: string;
}