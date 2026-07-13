import { randomBytes } from "node:crypto";
import type { Prisma, SupportMessageVisibility, SupportTicketPriority, SupportTicketSource, UserRole } from "@prisma/client";
import { prisma } from "./db.js";

export const supportTicketInclude = {
  customer: { include: { user: true } },
  seller: { include: { user: true } },
  parentOrder: true,
  subOrder: { include: { items: true } },
  createdBy: true,
  assignedTo: true,
  messages: { orderBy: { createdAt: "asc" } }
} satisfies Prisma.SupportTicketInclude;

type SupportTicketWithRelations = Prisma.SupportTicketGetPayload<{ include: typeof supportTicketInclude }>;

function randomTicketNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `BST-${date}-${suffix}`;
}

function slaDueAt(priority: SupportTicketPriority) {
  const hours = priority === "CRITICAL" ? 1 : priority === "HIGH" ? 2 : priority === "MEDIUM" ? 6 : 24;
  return new Date(Date.now() + hours * 60 * 60_000);
}

function initialVisibility(source: SupportTicketSource): SupportMessageVisibility {
  if (source === "CUSTOMER") return "CUSTOMER";
  if (source === "SELLER") return "SELLER";
  return "INTERNAL";
}

export function filterTicketMessages(ticket: SupportTicketWithRelations, audience: "customer" | "seller" | "ops") {
  if (audience === "ops") return ticket;
  const allowed: SupportMessageVisibility[] = audience === "customer" ? ["CUSTOMER", "BOTH"] : ["SELLER", "BOTH"];
  return {
    ...ticket,
    messages: ticket.messages.filter((message) => allowed.includes(message.visibility))
  };
}

export async function createSupportTicket(input: {
  source: SupportTicketSource;
  category: string;
  subCategory?: string;
  subject: string;
  description: string;
  priority?: SupportTicketPriority;
  customerId?: string;
  sellerId?: string;
  parentOrderId?: string;
  subOrderId?: string;
  createdByUserId?: string;
  assignedToUserId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const priority = input.priority ?? "MEDIUM";
  return prisma.supportTicket.create({
    data: {
      ticketNumber: randomTicketNumber(),
      source: input.source,
      category: input.category,
      subCategory: input.subCategory,
      subject: input.subject,
      description: input.description,
      priority,
      customerId: input.customerId,
      sellerId: input.sellerId,
      parentOrderId: input.parentOrderId,
      subOrderId: input.subOrderId,
      createdByUserId: input.createdByUserId,
      assignedToUserId: input.assignedToUserId,
      slaDueAt: slaDueAt(priority),
      metadata: input.metadata,
      messages: {
        create: {
          authorUserId: input.createdByUserId,
          authorRole: input.source,
          visibility: initialVisibility(input.source),
          message: input.description
        }
      }
    },
    include: supportTicketInclude
  });
}

export async function addSupportMessage(input: {
  ticketId: string;
  authorUserId?: string;
  authorRole: UserRole | SupportTicketSource | "SYSTEM";
  visibility: SupportMessageVisibility;
  message: string;
  attachments?: Prisma.InputJsonValue;
}) {
  return prisma.supportTicketMessage.create({
    data: {
      ticketId: input.ticketId,
      authorUserId: input.authorUserId,
      authorRole: input.authorRole,
      visibility: input.visibility,
      message: input.message,
      attachments: input.attachments
    }
  });
}

export async function createSystemTicketForSubOrder(input: {
  subOrderId: string;
  category: string;
  subject: string;
  description: string;
  priority?: SupportTicketPriority;
  status?: "NEW" | "REFUND_REVIEW" | "WAITING_SELLER" | "WAITING_DELIVERY";
  metadata?: Prisma.InputJsonValue;
}) {
  const subOrder = await prisma.sellerSubOrder.findUnique({
    where: { id: input.subOrderId },
    include: { parentOrder: true }
  });
  if (!subOrder) return null;

  const existing = await prisma.supportTicket.findFirst({
    where: {
      subOrderId: input.subOrderId,
      category: input.category,
      status: { notIn: ["RESOLVED"] }
    }
  });
  if (existing) return existing;

  const ticket = await createSupportTicket({
    source: "SYSTEM",
    category: input.category,
    subject: input.subject,
    description: input.description,
    priority: input.priority ?? "HIGH",
    customerId: subOrder.parentOrder.customerId,
    sellerId: subOrder.sellerId,
    parentOrderId: subOrder.parentOrderId,
    subOrderId: subOrder.id,
    metadata: input.metadata
  });

  if (input.status && input.status !== "NEW") {
    return prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: input.status },
      include: supportTicketInclude
    });
  }

  return ticket;
}
