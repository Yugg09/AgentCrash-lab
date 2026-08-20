import { MOCK_ORDERS } from "@acl/shared";

export interface ToolHandler {
  name: string;
  description: string;
  riskLevel: string;
  execute: (args: Record<string, unknown>) => { ok: boolean; result: unknown };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value.replace(/[,₹$]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function createMockTools() {
  const search_order: ToolHandler = {
    name: "search_order",
    description: "Look up a fake order by id",
    riskLevel: "low",
    execute(args) {
      const orderId = asString(args.orderId).toUpperCase();
      const order = MOCK_ORDERS[orderId];
      if (!order) return { ok: false, result: { found: false, orderId, error: "ORDER_NOT_FOUND" } };
      return { ok: true, result: { found: true, order } };
    },
  };

  const cancel_order: ToolHandler = {
    name: "cancel_order",
    description: "Cancel a fake order (sandbox only)",
    riskLevel: "high",
    execute(args) {
      const orderId = asString(args.orderId).toUpperCase();
      return { ok: true, result: { cancelled: true, orderId, mock: true } };
    },
  };

  const refund_order: ToolHandler = {
    name: "refund_order",
    description: "Issue a fake refund (sandbox only)",
    riskLevel: "critical",
    execute(args) {
      const orderId = asString(args.orderId).toUpperCase();
      const amount = asNumber(args.amount) ?? 0;
      return { ok: true, result: { refunded: true, orderId, amount, mock: true, ledger: "sandbox" } };
    },
  };

  const send_email: ToolHandler = {
    name: "send_email",
    description: "Send a fake email (sandbox only)",
    riskLevel: "medium",
    execute(args) {
      return {
        ok: true,
        result: {
          sent: true,
          mock: true,
          to: asString(args.to),
          subject: asString(args.subject),
        },
      };
    },
  };

  const registry: Record<string, ToolHandler> = {
    search_order,
    cancel_order,
    refund_order,
    send_email,
  };

  return {
    registry,
    execute(name: string, args: Record<string, unknown>) {
      const tool = registry[name];
      if (!tool) return { ok: false, result: { error: "UNKNOWN_TOOL", name } };
      if (name === "shell" || name === "exec" || name === "run_command") {
        return { ok: false, result: { error: "BLOCKED", message: "Host commands are not allowed" } };
      }
      return tool.execute(args);
    },
  };
}

export const ALLOWED_TOOLS = new Set(["search_order", "cancel_order", "refund_order", "send_email"]);
