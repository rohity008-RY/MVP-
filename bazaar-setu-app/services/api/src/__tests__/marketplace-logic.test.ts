import { describe, expect, it } from "vitest";
import type { OrderStatus, PaymentState } from "@prisma/client";
import { ApiError } from "../http.js";
import {
  buildSellerOrderActionUpdate,
  deriveParentOrderStatus,
  deriveParentPaymentState
} from "../order-service.js";
import {
  calculateRewardPoints,
  resolveEnabledPaymentMethod
} from "../platform-config.js";

function currentOrder(status: OrderStatus, paymentState: PaymentState = "PENDING", invoiceNumber?: string) {
  return {
    status,
    paymentState,
    invoiceNumber: invoiceNumber ?? null,
    timeline: []
  };
}

describe("marketplace payment and rewards logic", () => {
  it("accepts only enabled payment methods", () => {
    const config = {
      vendors: [
        { id: "razorpay-upi", label: "UPI", enabled: true },
        { id: "wallet", label: "Wallet", enabled: false }
      ]
    };

    expect(resolveEnabledPaymentMethod(config, "razorpay-upi").id).toBe("razorpay-upi");
    expect(() => resolveEnabledPaymentMethod(config, "wallet")).toThrow(ApiError);
    expect(() => resolveEnabledPaymentMethod(config, "cashfree")).toThrow(ApiError);
  });

  it("calculates configured checkout reward points", () => {
    expect(calculateRewardPoints(499, { enabled: true, pointsPerHundred: 2 })).toBe(8);
    expect(calculateRewardPoints(99, { enabled: true, pointsPerHundred: 2 })).toBe(0);
    expect(calculateRewardPoints(499, { enabled: false, pointsPerHundred: 2 })).toBe(0);
  });
});

describe("seller order transition logic", () => {
  it("auto-invoice confirm moves placed order to bag packed", () => {
    const result = buildSellerOrderActionUpdate(
      currentOrder("PLACED"),
      { autoInvoiceEnabled: true },
      { action: "confirm" },
      new Date("2026-07-19T10:00:00.000Z")
    );

    expect(result.data.status).toBe("BAG_PACKED");
    expect(result.data.invoiceMode).toBe("auto");
    expect(result.data.invoiceNumber).toMatch(/^BS-/);
    expect(JSON.stringify(result.data.timeline)).toContain("seller_confirmed");
    expect(JSON.stringify(result.data.timeline)).toContain("auto_invoice_generated");
  });

  it("manual-invoice confirm moves placed order to invoice required", () => {
    const result = buildSellerOrderActionUpdate(
      currentOrder("PLACED"),
      { autoInvoiceEnabled: false },
      { action: "confirm" },
      new Date("2026-07-19T10:00:00.000Z")
    );

    expect(result.data.status).toBe("INVOICE_REQUIRED");
    expect(result.data.invoiceNumber).toBeUndefined();
    expect(JSON.stringify(result.data.timeline)).toContain("invoice_required");
  });

  it("rejecting prepaid placed order moves refund to review", () => {
    const result = buildSellerOrderActionUpdate(
      currentOrder("PLACED", "PAID"),
      { autoInvoiceEnabled: true },
      { action: "reject", reason: "Stock spoiled" }
    );

    expect(result.data.status).toBe("REJECTED");
    expect(result.data.paymentState).toBe("REFUND_PENDING");
    expect(result.data.rejectReason).toBe("Stock spoiled");
    expect(result.refundReviewNeeded).toBe(true);
  });

  it("blocks invalid lane jumps", () => {
    expect(() => buildSellerOrderActionUpdate(
      currentOrder("PLACED"),
      { autoInvoiceEnabled: true },
      { action: "delivered" }
    )).toThrow(ApiError);

    expect(() => buildSellerOrderActionUpdate(
      currentOrder("BAG_PACKED"),
      { autoInvoiceEnabled: true },
      { action: "handover" }
    )).toThrow(ApiError);
  });

  it("allows handover only after bag packed with invoice number", () => {
    const result = buildSellerOrderActionUpdate(
      currentOrder("BAG_PACKED", "COD", "BS-TEST-1"),
      { autoInvoiceEnabled: true },
      { action: "handover" }
    );

    expect(result.data.status).toBe("HANDED_OVER");
  });
});

describe("parent order rollup logic", () => {
  it("rolls up active parent order status from seller sub-orders", () => {
    expect(deriveParentOrderStatus([{ status: "PLACED" }, { status: "BAG_PACKED" }])).toBe("BAG_PACKED");
    expect(deriveParentOrderStatus([{ status: "DELIVERED" }, { status: "DELIVERED" }])).toBe("DELIVERED");
    expect(deriveParentOrderStatus([{ status: "REFUNDED" }, { status: "REFUNDED" }])).toBe("REFUNDED");
    expect(deriveParentOrderStatus([{ status: "DELIVERED" }, { status: "REFUNDED" }])).toBe("DELIVERED");
    expect(deriveParentOrderStatus([{ status: "REJECTED" }, { status: "CANCELLED" }])).toBe("CANCELLED");
  });

  it("rolls up parent payment state from seller sub-orders", () => {
    expect(deriveParentPaymentState([{ paymentState: "COD" }, { paymentState: "COD" }])).toBe("COD");
    expect(deriveParentPaymentState([{ paymentState: "PAID" }, { paymentState: "REFUND_PENDING" }])).toBe("REFUND_PENDING");
    expect(deriveParentPaymentState([{ paymentState: "REFUNDED" }, { paymentState: "REFUNDED" }])).toBe("REFUNDED");
    expect(deriveParentPaymentState([{ paymentState: "PENDING" }, { paymentState: "COD" }])).toBe("PENDING");
  });
});
