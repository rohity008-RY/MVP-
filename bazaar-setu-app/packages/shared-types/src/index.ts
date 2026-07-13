export type UserRole = "customer" | "seller" | "admin" | "support";

export interface AuthUser {
  id: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN" | "SUPPORT";
  name: string;
  phone: string;
  email?: string | null;
}

export interface AuthResponse {
  token: string;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  user: AuthUser;
  customerProfile?: { id: string; rewardPoints: number } | null;
  sellerProfile?: { id: string; ownerName: string; shopName: string } | null;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "invoice_required"
  | "bag_packed"
  | "handed_over"
  | "delivered"
  | "rejected"
  | "cancelled"
  | "refunded";

export type PaymentState = "pending" | "paid" | "cod" | "refund_pending" | "refunded" | "failed";

export type SlaUnit = "minutes" | "hours" | "days";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Address extends LatLng {
  id: string;
  label: string;
  type: "home" | "office" | "other" | "store";
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ProductMaster {
  id: string;
  categoryId: string;
  subcategory?: string;
  name: string;
  brand?: string;
  unit: string;
  uqc?: string;
  hsn?: string;
  gstRate?: number;
  imageUrl?: string;
  aliases: string[];
  fssaiApplicable: boolean;
  legalMetrology?: {
    netQuantity?: string;
    mrp?: number;
    manufacturer?: string;
    packer?: string;
    countryOfOrigin?: string;
    expiryOrBestBefore?: string;
    consumerCare?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  parentId?: string;
}

export interface SellerProfile {
  id: string;
  ownerName: string;
  shopName: string;
  phone: string;
  email?: string;
  storeLive: boolean;
  selectedCategoryIds: string[];
  defaultSlaValue: number;
  defaultSlaUnit: SlaUnit;
  autoInvoiceEnabled: boolean;
  deliveryFee: number;
  primaryAddress: Address;
}

export interface SellerProduct {
  id: string;
  sellerId: string;
  productId: string;
  locationId?: string;
  price: number;
  qty: number;
  active: boolean;
  tags: string[];
  slaOverrideValue?: number;
  slaOverrideUnit?: SlaUnit;
}

export interface CartItem {
  productId: string;
  sellerProductId: string;
  sellerId: string;
  qty: number;
}

export interface OrderItem {
  productId: string;
  sellerProductId: string;
  name: string;
  hsn?: string;
  unit: string;
  qty: number;
  price: number;
  taxAmount: number;
}

export interface SellerSubOrder {
  id: string;
  parentOrderId: string;
  sellerId: string;
  status: OrderStatus;
  paymentState: PaymentState;
  invoiceNumber?: string;
  invoiceMode?: "auto" | "manual";
  rejectReason?: string;
  refundAmount?: number;
  slaDueAt?: string;
  timeline: Array<{ status: OrderStatus | string; at: string; note?: string }>;
  items: OrderItem[];
}

export interface ParentOrder {
  id: string;
  customerId: string;
  addressId: string;
  status: OrderStatus;
  paymentState: PaymentState;
  paymentMethod: string;
  total: number;
  deliveryFee: number;
  createdAt: string;
  subOrders: SellerSubOrder[];
}

export interface ProductApprovalRequest {
  id: string;
  sellerId: string;
  name: string;
  categoryId: string;
  unit: string;
  hsn?: string;
  imageUrl?: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  aiExtractedFields?: Record<string, string>;
}

export interface Notification {
  id: string;
  audience: "customer" | "seller" | "admin" | "all";
  title: string;
  body: string;
  type: "offer" | "order" | "system" | "approval" | "refund";
  createdAt: string;
}

export type SupportTicketStatus =
  | "NEW"
  | "ASSIGNED"
  | "WAITING_CUSTOMER"
  | "WAITING_SELLER"
  | "WAITING_DELIVERY"
  | "REFUND_REVIEW"
  | "RESOLVED"
  | "REOPENED";

export type SupportTicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SupportTicketSource = "CUSTOMER" | "SELLER" | "OPS" | "SYSTEM";

export type SupportMessageVisibility = "INTERNAL" | "CUSTOMER" | "SELLER" | "BOTH";

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  authorUserId?: string | null;
  authorRole: string;
  visibility: SupportMessageVisibility;
  message: string;
  attachments?: Record<string, unknown> | null;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  source: SupportTicketSource;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  category: string;
  subCategory?: string | null;
  subject: string;
  description: string;
  customerId?: string | null;
  sellerId?: string | null;
  parentOrderId?: string | null;
  subOrderId?: string | null;
  assignedToUserId?: string | null;
  slaDueAt?: string | null;
  resolvedAt?: string | null;
  reopenedAt?: string | null;
  metadata?: Record<string, unknown> | null;
  customer?: { user?: { name: string; phone: string } } | null;
  seller?: { shopName: string; user?: { phone: string; email?: string | null } } | null;
  parentOrder?: { id: string; status: string; paymentState: string } | null;
  subOrder?: { id: string; status: string; paymentState: string; invoiceNumber?: string | null; items?: OrderItem[] } | null;
  assignedTo?: { name: string; phone: string } | null;
  messages: SupportTicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SellerLead {
  id: string;
  customerId?: string;
  name: string;
  phone: string;
  notes?: string;
  status: "NEW" | "CONTACTED" | "ONBOARDED" | "REJECTED";
  createdAt: string;
}

export interface PaymentVendorConfig {
  id: string;
  label: string;
  enabled: boolean;
}

export interface PlatformSettings {
  paymentConfig: { vendors: PaymentVendorConfig[] };
  rewardConfig: { enabled: boolean; pointsPerHundred: number };
}
