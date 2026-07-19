import type { OrderStatus, PaymentState, Prisma, SellerProfile, SellerSubOrder } from "@prisma/client";
import { ApiError } from "./http.js";

export type SellerOrderAction = "confirm" | "reject" | "addInvoice" | "handover" | "delivered";

type SellerOrderInput = {
  action: SellerOrderAction;
  invoiceNumber?: string;
  reason?: string;
};

type SellerOrderState = Pick<SellerSubOrder, "status" | "paymentState" | "invoiceNumber" | "timeline">;
type SellerInvoiceSettings = Pick<SellerProfile, "autoInvoiceEnabled">;

const allowedPreviousStatus: Record<SellerOrderAction, OrderStatus[]> = {
  confirm: ["PLACED"],
  reject: ["PLACED"],
  addInvoice: ["INVOICE_REQUIRED"],
  handover: ["BAG_PACKED"],
  delivered: ["HANDED_OVER"]
};

function generateInvoiceNumber() {
  return `BS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function appendTimeline(timeline: Prisma.JsonValue, events: Array<Record<string, unknown>>) {
  const current = Array.isArray(timeline) ? timeline : [];
  return [...current, ...events] as Prisma.InputJsonValue;
}

function assertTransitionAllowed(action: SellerOrderAction, currentStatus: OrderStatus) {
  if (!allowedPreviousStatus[action].includes(currentStatus)) {
    throw new ApiError(409, `Cannot ${action} order from ${currentStatus}.`, "INVALID_ORDER_TRANSITION", {
      action,
      currentStatus,
      allowedPreviousStatus: allowedPreviousStatus[action]
    });
  }
}

export function buildSellerOrderActionUpdate(
  current: SellerOrderState,
  seller: SellerInvoiceSettings,
  input: SellerOrderInput,
  now = new Date()
) {
  assertTransitionAllowed(input.action, current.status);

  const events: Array<Record<string, unknown>> = [];
  const data: Prisma.SellerSubOrderUpdateInput = {};
  const at = now.toISOString();

  if (input.action === "confirm") {
    events.push({ status: "CONFIRMED", tag: "seller_confirmed", at });
    if (seller.autoInvoiceEnabled) {
      const invoiceNumber = generateInvoiceNumber();
      data.status = "BAG_PACKED";
      data.invoiceNumber = invoiceNumber;
      data.invoiceMode = "auto";
      events.push({ status: "BAG_PACKED", tag: "auto_invoice_generated", invoiceNumber, at });
    } else {
      data.status = "INVOICE_REQUIRED";
      events.push({ status: "INVOICE_REQUIRED", tag: "invoice_required", at });
    }
  }

  if (input.action === "reject") {
    data.status = "REJECTED";
    data.rejectReason = input.reason?.trim() || "No reason added";
    if (current.paymentState === "PAID") data.paymentState = "REFUND_PENDING";
    events.push({
      status: "REJECTED",
      tag: "seller_rejected",
      note: input.reason?.trim() || "No reason added",
      paymentState: data.paymentState ?? current.paymentState,
      at
    });
  }

  if (input.action === "addInvoice") {
    data.status = "BAG_PACKED";
    data.invoiceNumber = input.invoiceNumber?.trim();
    data.invoiceMode = "manual";
    events.push({ status: "BAG_PACKED", tag: "manual_invoice_added", invoiceNumber: data.invoiceNumber, at });
  }

  if (input.action === "handover") {
    if (!current.invoiceNumber) {
      throw new ApiError(409, "Invoice number is required before handover.", "INVOICE_REQUIRED");
    }
    data.status = "HANDED_OVER";
    events.push({ status: "HANDED_OVER", tag: "seller_handed_over", at });
  }

  if (input.action === "delivered") {
    data.status = "DELIVERED";
    events.push({ status: "DELIVERED", tag: "delivered", at });
  }

  data.timeline = appendTimeline(current.timeline, events);
  return {
    data,
    refundReviewNeeded: input.action === "reject" && current.paymentState === "PAID"
  };
}

const parentProgression: OrderStatus[] = ["HANDED_OVER", "BAG_PACKED", "INVOICE_REQUIRED", "CONFIRMED", "PLACED"];
const terminalStatuses: OrderStatus[] = ["DELIVERED", "REJECTED", "CANCELLED", "REFUNDED"];

export function deriveParentOrderStatus(subOrders: Array<{ status: OrderStatus }>): OrderStatus {
  if (!subOrders.length) return "PLACED";
  if (subOrders.every((order) => order.status === "DELIVERED")) return "DELIVERED";
  if (subOrders.every((order) => order.status === "REFUNDED")) return "REFUNDED";
  if (subOrders.every((order) => terminalStatuses.includes(order.status))) {
    return subOrders.some((order) => order.status === "DELIVERED") ? "DELIVERED" : "CANCELLED";
  }

  const activeStatuses = subOrders.map((order) => order.status).filter((status) => !terminalStatuses.includes(status));
  for (const status of parentProgression) {
    if (activeStatuses.includes(status)) return status;
  }
  return "PLACED";
}

export function deriveParentPaymentState(subOrders: Array<{ paymentState: PaymentState }>): PaymentState {
  if (!subOrders.length) return "PENDING";
  if (subOrders.some((order) => order.paymentState === "REFUND_PENDING")) return "REFUND_PENDING";
  if (subOrders.every((order) => order.paymentState === "REFUNDED")) return "REFUNDED";
  if (subOrders.every((order) => order.paymentState === "COD")) return "COD";
  if (subOrders.some((order) => order.paymentState === "PAID")) return "PAID";
  if (subOrders.some((order) => order.paymentState === "PENDING")) return "PENDING";
  if (subOrders.some((order) => order.paymentState === "FAILED")) return "FAILED";
  return "PENDING";
}

export async function rollupParentOrder(tx: Prisma.TransactionClient, parentOrderId: string) {
  const subOrders = await tx.sellerSubOrder.findMany({
    where: { parentOrderId },
    select: { status: true, paymentState: true }
  });

  return tx.parentOrder.update({
    where: { id: parentOrderId },
    data: {
      status: deriveParentOrderStatus(subOrders),
      paymentState: deriveParentPaymentState(subOrders)
    }
  });
}
