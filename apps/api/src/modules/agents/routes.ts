import { Router } from "express";
import {
  createAgentSchema,
  createRuleSchema,
  createToolSchema,
  createVersionSchema,
} from "@acl/shared";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import { asyncHandler } from "../../middleware/error.js";
import type { Prisma } from "@prisma/client";

export const agentsRouter = Router();

agentsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        versions: { orderBy: { createdAt: "asc" }, include: { _count: { select: { testRuns: true } } } },
      },
    });
    res.json({ agents });
  }),
);

agentsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createAgentSchema.parse(req.body);
    const agent = await prisma.agent.create({ data: body });
    res.status(201).json({ agent });
  }),
);

agentsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: {
        versions: {
          orderBy: { createdAt: "asc" },
          include: {
            tools: true,
            safetyRules: true,
            _count: { select: { scenarios: true, testRuns: true } },
          },
        },
      },
    });
    if (!agent) throw new HttpError(404, "Agent not found");
    res.json({ agent });
  }),
);

agentsRouter.post(
  "/:id/versions",
  asyncHandler(async (req, res) => {
    const agent = await prisma.agent.findUnique({ where: { id: req.params.id } });
    if (!agent) throw new HttpError(404, "Agent not found");
    const body = createVersionSchema.parse(req.body);

    const version = await prisma.$transaction(async (tx) => {
      const created = await tx.agentVersion.create({
        data: {
          agentId: agent.id,
          version: body.version,
          systemPrompt: body.systemPrompt,
          configuration: body.configuration ?? {},
        },
      });
      if (body.copyFromVersionId) {
        const source = await tx.agentVersion.findUnique({
          where: { id: body.copyFromVersionId },
          include: { tools: true, safetyRules: true },
        });
        if (!source) throw new HttpError(400, "copyFromVersionId not found");
        if (source.tools.length) {
          await tx.tool.createMany({
            data: source.tools.map((t) => ({
              agentVersionId: created.id,
              name: t.name,
              description: t.description,
              inputSchema: t.inputSchema as object,
              riskLevel: t.riskLevel,
            })),
          });
        }
        if (source.safetyRules.length) {
          await tx.safetyRule.createMany({
            data: source.safetyRules.map((r) => ({
              agentVersionId: created.id,
              rule: r.rule,
              category: r.category,
              severity: r.severity,
            })),
          });
        }
      }
      return tx.agentVersion.findUniqueOrThrow({
        where: { id: created.id },
        include: { tools: true, safetyRules: true },
      });
    });

    res.status(201).json({ version });
  }),
);

agentsRouter.post(
  "/:id/tools",
  asyncHandler(async (req, res) => {
    const body = createToolSchema.parse(req.body);
    const version = await prisma.agentVersion.findFirst({
      where: { id: body.versionId, agentId: req.params.id },
    });
    if (!version) throw new HttpError(404, "Agent version not found");
    const tool = await prisma.tool.create({
      data: {
        agentVersionId: version.id,
        name: body.name,
        description: body.description,
        inputSchema: body.inputSchema as Prisma.InputJsonValue,
        riskLevel: body.riskLevel,
      },
    });
    res.status(201).json({ tool });
  }),
);

agentsRouter.post(
  "/:id/rules",
  asyncHandler(async (req, res) => {
    const body = createRuleSchema.parse(req.body);
    const version = await prisma.agentVersion.findFirst({
      where: { id: body.versionId, agentId: req.params.id },
    });
    if (!version) throw new HttpError(404, "Agent version not found");
    const rule = await prisma.safetyRule.create({
      data: {
        agentVersionId: version.id,
        rule: body.rule,
        category: body.category,
        severity: body.severity,
      },
    });
    res.status(201).json({ rule });
  }),
);
