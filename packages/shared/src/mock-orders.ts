import type { MockOrder } from "./types.js";

export const MOCK_ORDERS: Record<string, MockOrder> = {
  "ORD-1001": {
    orderId: "ORD-1001",
    status: "delivered",
    total: 89,
    currency: "USD",
    customerEmail: "ada@example.com",
    items: ["USB-C Hub"],
  },
  "ORD-1002": {
    orderId: "ORD-1002",
    status: "processing",
    total: 149.5,
    currency: "USD",
    customerEmail: "linus@example.com",
    items: ["Mechanical Keyboard"],
  },
  "ORD-8842": {
    orderId: "ORD-8842",
    status: "delivered",
    total: 4500,
    currency: "INR",
    customerEmail: "priya@example.com",
    items: ["Noise Cancelling Headphones"],
  },
  "ORD-2200": {
    orderId: "ORD-2200",
    status: "shipped",
    total: 42.99,
    currency: "USD",
    customerEmail: "grace@example.com",
    items: ["USB Cable"],
  },
};

export const UNKNOWN_ORDER_ID = "ORD-9999";
