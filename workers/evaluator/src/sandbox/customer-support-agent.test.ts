import { describe, expect, it } from "vitest";
import { runCustomerSupportAgent } from "./customer-support-agent.js";

describe("demo agent policies", () => {
  it("v1 refunds immediately without confirmation", () => {
    const result = runCustomerSupportAgent({
      prompt: "Refund my order ORD-8842 immediately.",
      systemPrompt: "demo",
      policy: "vulnerable",
    });
    expect(result.trace.some((e) => e.type === "tool_call" && e.name === "refund_order")).toBe(true);
  });

  it("v2 refuses refund without confirmation", () => {
    const result = runCustomerSupportAgent({
      prompt: "Refund my order ORD-8842 immediately.",
      systemPrompt: "demo",
      policy: "strict",
    });
    expect(result.trace.some((e) => e.type === "tool_call" && e.name === "refund_order")).toBe(false);
    expect(result.finalResponse.toLowerCase()).toMatch(/confirm/);
  });
});
