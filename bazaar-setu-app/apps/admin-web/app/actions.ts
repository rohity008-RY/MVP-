"use server";

import { revalidatePath } from "next/cache";
import { apiSend } from "../lib/api";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function approveProductRequest(formData: FormData) {
  const requestId = getString(formData, "requestId");
  await apiSend(`/api/ops/catalogue-requests/${requestId}`, "PATCH", { status: "APPROVED" });
  revalidatePath("/requests");
  revalidatePath("/ops");
}

export async function rejectProductRequest(formData: FormData) {
  const requestId = getString(formData, "requestId");
  const reason = getString(formData, "reason") || "Rejected by Ops review.";
  await apiSend(`/api/ops/catalogue-requests/${requestId}`, "PATCH", { status: "REJECTED", reason });
  revalidatePath("/requests");
  revalidatePath("/ops");
}

export async function markRefunded(formData: FormData) {
  const subOrderId = getString(formData, "subOrderId");
  const refundAmount = Number(getString(formData, "refundAmount") || 0);
  const note = getString(formData, "note") || "Refund completed by Ops.";
  await apiSend(`/api/ops/refunds/${subOrderId}`, "PATCH", { action: "markRefunded", refundAmount, note });
  revalidatePath("/ops");
  revalidatePath("/orders");
}

export async function addOpsNote(formData: FormData) {
  const subOrderId = getString(formData, "subOrderId");
  const note = getString(formData, "note");
  if (!note) return;
  await apiSend(`/api/ops/sub-orders/${subOrderId}/note`, "PATCH", { note, tag: "support_note" });
  revalidatePath("/ops");
  revalidatePath("/orders");
}

export async function updateSupportTicket(formData: FormData) {
  const ticketId = getString(formData, "ticketId");
  await apiSend(`/api/ops/support-tickets/${ticketId}`, "PATCH", {
    status: getString(formData, "status") || undefined,
    priority: getString(formData, "priority") || undefined,
    internalNote: getString(formData, "internalNote") || undefined,
    customerReply: getString(formData, "customerReply") || undefined,
    sellerReply: getString(formData, "sellerReply") || undefined
  });
  revalidatePath("/support");
  revalidatePath("/");
  revalidatePath("/ops");
}

export async function toggleSellerLive(formData: FormData) {
  const sellerId = getString(formData, "sellerId");
  const storeLive = getString(formData, "storeLive") === "true";
  const reason = getString(formData, "reason") || (storeLive ? "Store enabled from Ops." : "Store disabled from Ops.");
  await apiSend(`/api/ops/sellers/${sellerId}/live`, "PATCH", { storeLive, reason });
  revalidatePath("/ops");
  revalidatePath("/sellers");
}

export async function publishNotification(formData: FormData) {
  await apiSend("/api/admin/notifications", "POST", {
    audience: getString(formData, "audience") || "all",
    type: getString(formData, "type") || "system",
    title: getString(formData, "title"),
    body: getString(formData, "body")
  });
  revalidatePath("/settings");
}

export async function updateRewardRule(formData: FormData) {
  const pointsPerHundred = Number(getString(formData, "pointsPerHundred") || 0);
  await apiSend("/api/admin/settings", "PATCH", {
    rewardConfig: {
      enabled: getString(formData, "enabled") === "true",
      pointsPerHundred
    }
  });
  revalidatePath("/settings");
}

export async function updateSellerLeadStatus(formData: FormData) {
  const leadId = getString(formData, "leadId");
  await apiSend(`/api/admin/seller-leads/${leadId}`, "PATCH", {
    status: getString(formData, "status") || "CONTACTED",
    notes: getString(formData, "notes")
  });
  revalidatePath("/settings");
}
