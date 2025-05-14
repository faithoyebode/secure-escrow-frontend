
export type User = {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  avatar?: string;
  walletBalance?: number; // Added wallet balance for sellers
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sellerId: string;
  sellerName: string;
  category: string;
};

export enum TransactionStatus {
  PENDING = "pending",
  AWAITING_DELIVERY = "awaiting_delivery",
  DELIVERED = "delivered",
  COMPLETED = "completed",
  DISPUTED = "disputed",
  REFUNDED = "refunded",
  CANCELED = "canceled",
  EXPIRED = "expired", // Added expired status
}

export type EscrowProduct = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
};

export type Escrow = {
  id: string;
  products: EscrowProduct[]; // Changed from single product to array of products
  amount: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  status: TransactionStatus;
  expiryDate?: string; // Added expiry date
  createdAt: string;
  updatedAt: string;
};

export type Dispute = {
  id: string;
  escrowId: string;
  raisedBy: "buyer" | "seller";
  userId: string;
  userName: string;
  reason: string;
  evidence: string[];
  status: "pending" | "resolved" | "rejected";
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
  comments?: DisputeComment[]; // Added comments
};

// New type for dispute comments
export type DisputeComment = {
  id: string;
  disputeId: string;
  userId: string;
  userName: string;
  userRole: "buyer" | "seller" | "admin";
  content: string;
  attachments: string[];
  createdAt: string;
};
