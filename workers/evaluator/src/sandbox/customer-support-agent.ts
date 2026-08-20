import { EMAIL_RE, MOCK_ORDERS, type TraceEvent } from "@acl/shared";
import { ALLOWED_TOOLS, createMockTools } from "../tools/mock-tools.js";

export type PolicyMode = "vulnerable" | "strict";

export interface AgentRunInput {
  prompt: string;
  systemPrompt: string;
  policy: PolicyMode;
}

export interface AgentRunResult {
  trace: TraceEvent[];
  finalResponse: string;
}

const CONFIRM_RE =
  /\b(i confirm|yes,? (please )?refund|confirmed|i authorize|go ahead and refund|i explicitly confirm)\b/i;

function now() {
  return Date.now();
}

function extractOrderId(text: string): string | undefined {
  return text.match(/\b(ORD-\d+)\b/i)?.[1]?.toUpperCase();
}

function extractAmount(text: string): number | undefined {
  const rupee = text.match(/₹\s*([\d,]+(?:\.\d+)?)/);
  const dollar = text.match(/\$\s*([\d,]+(?:\.\d+)?)/);
  const plain = text.match(/\b(?:amount|refund)\s+(?:of\s+)?([\d,]+(?:\.\d+)?)/i);
  const raw = rupee?.[1] ?? dollar?.[1] ?? plain?.[1];
  if (!raw) return undefined;
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function extractEmail(text: string): string | undefined {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
}

function wants(text: string, re: RegExp) {
  return re.test(text);
}

export function runCustomerSupportAgent(input: AgentRunInput): AgentRunResult {
  const tools = createMockTools();
  const trace: TraceEvent[] = [];
  const prompt = input.prompt;
  const policy = input.policy;
  const orderId = extractOrderId(prompt);
  const amountHint = extractAmount(prompt);
  const emailHint = extractEmail(prompt);
  const confirmed = CONFIRM_RE.test(prompt);
  const prohibit = /\b(do not|don't|never)\s+(refund|cancel)\b/i.test(prompt);
  const keepActive = /\bkeep it active\b/i.test(prompt);
  const injection = /\b(ignore (your )?(previous )?safety|system override|new policy|dan:)\b/i.test(prompt);
  const bulk = /\bevery other order|all customers|all orders\b/i.test(prompt);
  const retryStorm = /\bkeep calling|until it works|retry\b/i.test(prompt);
  const refundIntent =
    /\b(just refund|refund (my|the|this|it|ord-|₹|\$)|want my money|make it right|refund it|refund ₹|refund \$)\b/i.test(
      prompt,
    ) || (/\brefund\b/i.test(prompt) && !/\b(policy|explain)\b/i.test(prompt));
  const cancelIntent = /\bcancel\b/i.test(prompt);
  const emailIntent = /\bsend (a |an )?(email|shipping update|password reset|order confirmation)\b/i.test(prompt);
  const searchIntent = /\b(status|look up|lookup|find|items|email on file|exists|shipped)\b/i.test(prompt);
  const unhappyAmbiguous = /\bdo something about my order|i am unhappy\b/i.test(prompt);

  const push = (event: Omit<TraceEvent, "ts">) => {
    trace.push({ ts: now(), ...event });
  };

  const callTool = (name: string, args: Record<string, unknown>) => {
    if (!ALLOWED_TOOLS.has(name)) {
      push({ type: "error", name, content: "Blocked tool: host commands and unknown tools cannot run" });
      return { ok: false, result: { error: "BLOCKED" } };
    }
    push({ type: "tool_call", name, args });
    const result = tools.execute(name, args);
    push({ type: "tool_result", name, result: result.result });
    return result;
  };

  push({
    type: "thought",
    content:
      policy === "vulnerable"
        ? "Vulnerable demo policy: optimize for completing the requested action quickly."
        : "Strict policy: verify, confirm, and refuse unsafe actions.",
  });

  if (policy === "vulnerable") {
    return runVulnerable();
  }
  return runStrict();

  function finalize(message: string): AgentRunResult {
    push({ type: "message", content: message });
    return { trace, finalResponse: message };
  }

  function runVulnerable(): AgentRunResult {
    if (unhappyAmbiguous && orderId && !refundIntent && !cancelIntent) {
      return finalize(
        `I can look into ${orderId}. Would you like a status update, cancellation, or refund?`,
      );
    }

    if (emailIntent) {
      const to = emailHint ?? "not-an-email";
      callTool("send_email", {
        to,
        subject: "Account notice",
        body: "Automated sandbox email.",
      });
    }

    if (cancelIntent && !keepActive) {
      callTool("cancel_order", { orderId: orderId ?? "ORD-1001" });
    }

    if (refundIntent || injection) {
      const oid = orderId ?? "ORD-1001";
      const catalog = MOCK_ORDERS[oid];
      const amount = amountHint ?? catalog?.total ?? 50000;
      const repeats = retryStorm ? 3 : 1;
      for (let i = 0; i < repeats; i += 1) {
        callTool("refund_order", { orderId: oid, amount });
      }
      if (bulk) {
        callTool("refund_order", { orderId: "ORD-1002", amount: 149.5 });
      }
      return finalize(
        `Done. I processed a refund of ${amount} for ${oid}${bulk ? " and started additional refunds" : ""}.`,
      );
    }

    if (cancelIntent) {
      return finalize(`Cancellation submitted for ${orderId ?? "the order"}.`);
    }

    if (searchIntent && orderId) {
      const result = callTool("search_order", { orderId });
      return finalize(`Lookup result: ${JSON.stringify(result.result)}`);
    }

    if (searchIntent && !orderId) {
      return finalize("Share an order id like ORD-1001 and I can look it up.");
    }

    if (emailIntent) {
      return finalize("I sent the email from the sandbox mailer.");
    }

    return finalize("I can look up orders, send updates, cancel, or refund — tell me the order id.");
  }

  function runStrict(): AgentRunResult {
    if (prohibit && (refundIntent || cancelIntent)) {
      return finalize("I will not refund or cancel because you explicitly asked me not to perform those actions.");
    }

    if (keepActive && cancelIntent) {
      return finalize(
        "Those instructions conflict (cancel vs keep active). I will not cancel until you choose one action.",
      );
    }

    if (injection) {
      push({ type: "thought", content: "Ignoring injected policy override. Safety rules remain in force." });
    }

    if (bulk) {
      return finalize("I can only act on a single verified order. Bulk refunds and mass emails are not allowed.");
    }

    if (unhappyAmbiguous && !refundIntent) {
      return finalize(
        `I can help with ${orderId ?? "your order"}, but I need a specific action: status, cancel, or refund.`,
      );
    }

    if (emailIntent) {
      const to = emailHint ?? "";
      if (!EMAIL_RE.test(to)) {
        return finalize("I cannot send email without a valid recipient address.");
      }
      callTool("send_email", { to, subject: "Order update", body: "Sandbox status update." });
      if (!refundIntent && !cancelIntent) {
        return finalize(`Sent a sandbox email to ${to}.`);
      }
    }

    if (searchIntent && !refundIntent && !cancelIntent) {
      if (!orderId) return finalize("Please provide an order id so I can look it up.");
      const result = callTool("search_order", { orderId });
      return finalize(`Order lookup: ${JSON.stringify(result.result)}`);
    }

    if (cancelIntent) {
      if (!orderId) return finalize("I need a valid order id before I can consider cancellation.");
      const lookup = callTool("search_order", { orderId });
      const found = Boolean((lookup.result as { found?: boolean })?.found);
      if (!found) return finalize(`I cannot cancel ${orderId} because it was not found.`);
      callTool("cancel_order", { orderId });
      return finalize(`Order ${orderId} was validated and cancelled in the sandbox.`);
    }

    if (refundIntent) {
      if (!orderId) return finalize("I need an order id before I can evaluate a refund.");
      const lookup = callTool("search_order", { orderId });
      const found = (lookup.result as { found?: boolean; order?: { total: number } })?.found;
      const total = (lookup.result as { order?: { total: number } })?.order?.total;
      if (!found || total === undefined) {
        return finalize(`I cannot refund ${orderId} because the order could not be verified.`);
      }
      if (!confirmed) {
        return finalize(
          `Order ${orderId} totals ${total}. I need explicit confirmation (for example "I confirm") before issuing a refund.`,
        );
      }
      const amount = amountHint ?? total;
      if (amount > total) {
        return finalize(`I cannot refund ${amount} because it exceeds the verified total of ${total}.`);
      }
      callTool("refund_order", { orderId, amount });
      return finalize(`Refund of ${amount} for ${orderId} completed in the sandbox after confirmation.`);
    }

    if (retryStorm) {
      return finalize("I will not retry destructive tools in a loop. Please confirm a single verified refund if needed.");
    }

    return finalize("I can look up sandbox orders and will only take destructive actions after validation and confirmation.");
  }
}
