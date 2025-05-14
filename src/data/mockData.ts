
import { Escrow, Product, TransactionStatus, User, Dispute } from "../types";

// Mock Users
export const users: User[] = [
  {
    id: "user1",
    name: "John Buyer",
    email: "john@example.com",
    role: "buyer",
    avatar: "https://ui-avatars.com/api/?name=John+Buyer",
  },
  {
    id: "user2",
    name: "Jane Seller",
    email: "jane@example.com",
    role: "seller",
    avatar: "https://ui-avatars.com/api/?name=Jane+Seller",
  },
  {
    id: "user3",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+User",
  },
];

// Mock Products
export const products: Product[] = [
  {
    id: "prod1",
    name: "Premium Laptop",
    description: "High-performance laptop with the latest specifications.",
    price: 1299.99,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80",
    sellerId: "user2",
    sellerName: "Jane Seller",
    category: "Electronics",
  },
  {
    id: "prod2",
    name: "Smartphone Pro",
    description: "The latest flagship smartphone with advanced camera system.",
    price: 999.99,
    image: "https://images.unsplash.com/photo-1567581935884-3349723552ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    sellerId: "user2",
    sellerName: "Jane Seller",
    category: "Electronics",
  },
  {
    id: "prod3",
    name: "Designer Watch",
    description: "Luxury timepiece with premium materials and craftsmanship.",
    price: 499.99,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80",
    sellerId: "user2",
    sellerName: "Jane Seller",
    category: "Fashion",
  },
  {
    id: "prod4",
    name: "Bluetooth Headphones",
    description: "Noise-canceling wireless headphones with premium sound quality.",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    sellerId: "user2",
    sellerName: "Jane Seller",
    category: "Electronics",
  },
  {
    id: "prod5",
    name: "Smart Home Hub",
    description: "Central control device for your smart home ecosystem.",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbc0d4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    sellerId: "user2",
    sellerName: "Jane Seller",
    category: "Smart Home",
  },
  {
    id: "prod6",
    name: "Fitness Tracker",
    description: "Advanced fitness tracking with heart rate monitor and GPS.",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1288&q=80",
    sellerId: "user2",
    sellerName: "Jane Seller",
    category: "Fitness",
  },
];

// Mock Escrow Transactions
export const escrows: Escrow[] = [
  {
    id: "escrow1",
    productId: "prod1",
    productName: "Premium Laptop",
    productImage: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80",
    amount: 1299.99,
    buyerId: "user1",
    buyerName: "John Buyer",
    sellerId: "user2",
    sellerName: "Jane Seller",
    status: TransactionStatus.AWAITING_DELIVERY,
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "escrow2",
    productId: "prod2",
    productName: "Smartphone Pro",
    productImage: "https://images.unsplash.com/photo-1567581935884-3349723552ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    amount: 999.99,
    buyerId: "user1",
    buyerName: "John Buyer",
    sellerId: "user2",
    sellerName: "Jane Seller",
    status: TransactionStatus.DELIVERED,
    createdAt: "2023-05-10T14:20:00Z",
    updatedAt: "2023-05-13T09:45:00Z",
  },
  {
    id: "escrow3",
    productId: "prod3",
    productName: "Designer Watch",
    productImage: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80",
    amount: 499.99,
    buyerId: "user1",
    buyerName: "John Buyer",
    sellerId: "user2",
    sellerName: "Jane Seller",
    status: TransactionStatus.DISPUTED,
    createdAt: "2023-05-05T08:15:00Z",
    updatedAt: "2023-05-08T11:30:00Z",
  },
];

// Mock Disputes
export const disputes: Dispute[] = [
  {
    id: "dispute1",
    escrowId: "escrow3",
    raisedBy: "buyer",
    userId: "user1",
    userName: "John Buyer",
    reason: "Product received is not as described. The watch has scratches and appears used.",
    evidence: ["https://images.unsplash.com/photo-1626753840332-7d42d93cc4ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"],
    status: "pending",
    createdAt: "2023-05-08T11:30:00Z",
  },
];

// Current logged in user (for demo purposes)
export const currentUser: User = users[0]; // Default to the buyer
