import { describe, expect, it } from "vitest";
import { filterTicketMessages } from "../support-service.js";

function ticketWithMessages() {
  const base = {
    id: "ticket-1",
    ticketNumber: "BST-TEST-1",
    source: "CUSTOMER",
    status: "ASSIGNED",
    priority: "HIGH",
    category: "late_order",
    subCategory: null,
    subject: "Late order",
    description: "Order is late",
    customerId: "customer-1",
    sellerId: "seller-1",
    parentOrderId: "order-1",
    subOrderId: "sub-1",
    createdByUserId: "user-1",
    assignedToUserId: null,
    slaDueAt: new Date(),
    resolvedAt: null,
    reopenedAt: null,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: null,
    seller: null,
    parentOrder: null,
    subOrder: null,
    createdBy: null,
    assignedTo: null,
    messages: [
      { id: "message-internal", ticketId: "ticket-1", authorUserId: null, authorRole: "SUPPORT", visibility: "INTERNAL", message: "Only ops can see this.", attachments: null, createdAt: new Date() },
      { id: "message-customer", ticketId: "ticket-1", authorUserId: null, authorRole: "SUPPORT", visibility: "CUSTOMER", message: "Customer reply.", attachments: null, createdAt: new Date() },
      { id: "message-seller", ticketId: "ticket-1", authorUserId: null, authorRole: "SUPPORT", visibility: "SELLER", message: "Seller reply.", attachments: null, createdAt: new Date() },
      { id: "message-both", ticketId: "ticket-1", authorUserId: null, authorRole: "SUPPORT", visibility: "BOTH", message: "Everyone can see this.", attachments: null, createdAt: new Date() }
    ]
  };
  return base as Parameters<typeof filterTicketMessages>[0];
}

describe("support ticket message filtering", () => {
  it("hides internal and seller-only messages from customers", () => {
    const filtered = filterTicketMessages(ticketWithMessages(), "customer");
    expect(filtered.messages.map((message) => message.id)).toEqual(["message-customer", "message-both"]);
  });

  it("hides internal and customer-only messages from sellers", () => {
    const filtered = filterTicketMessages(ticketWithMessages(), "seller");
    expect(filtered.messages.map((message) => message.id)).toEqual(["message-seller", "message-both"]);
  });

  it("keeps all messages for ops users", () => {
    const filtered = filterTicketMessages(ticketWithMessages(), "ops");
    expect(filtered.messages.map((message) => message.id)).toEqual(["message-internal", "message-customer", "message-seller", "message-both"]);
  });
});
