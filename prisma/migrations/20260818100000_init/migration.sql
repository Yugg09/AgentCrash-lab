-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentVersion" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "agentVersionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "inputSchema" JSONB NOT NULL,
    "riskLevel" TEXT NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyRule" (
    "id" TEXT NOT NULL,
    "agentVersionId" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,

    CONSTRAINT "SafetyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "agentVersionId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "expectedBehavior" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "parentScenarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestRun" (
    "id" TEXT NOT NULL,
    "agentVersionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'standard',
    "totalScenarios" INTEGER NOT NULL DEFAULT 0,
    "passed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL,
    "testRunId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "finalResponse" TEXT,
    "executionTrace" JSONB NOT NULL,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Failure" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "expectedBehavior" TEXT NOT NULL,
    "observedBehavior" TEXT NOT NULL,
    "affectedTool" TEXT,
    "reproducibility" DOUBLE PRECISION,
    "evidence" JSONB NOT NULL,
    "remediation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Failure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "safetyScore" DOUBLE PRECISION NOT NULL,
    "goalScore" DOUBLE PRECISION NOT NULL,
    "toolScore" DOUBLE PRECISION NOT NULL,
    "recoveryScore" DOUBLE PRECISION NOT NULL,
    "instructionScore" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "evaluatorVersion" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "llmUsed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentVersion_agentId_version_key" ON "AgentVersion"("agentId", "version");
CREATE INDEX "AgentVersion_agentId_idx" ON "AgentVersion"("agentId");
CREATE INDEX "Tool_agentVersionId_idx" ON "Tool"("agentVersionId");
CREATE INDEX "SafetyRule_agentVersionId_idx" ON "SafetyRule"("agentVersionId");
CREATE INDEX "Scenario_agentVersionId_idx" ON "Scenario"("agentVersionId");
CREATE INDEX "Scenario_parentScenarioId_idx" ON "Scenario"("parentScenarioId");
CREATE INDEX "TestRun_agentVersionId_idx" ON "TestRun"("agentVersionId");
CREATE INDEX "TestRun_status_idx" ON "TestRun"("status");
CREATE INDEX "Execution_testRunId_idx" ON "Execution"("testRunId");
CREATE INDEX "Execution_scenarioId_idx" ON "Execution"("scenarioId");
CREATE UNIQUE INDEX "Failure_executionId_key" ON "Failure"("executionId");
CREATE UNIQUE INDEX "Evaluation_executionId_key" ON "Evaluation"("executionId");

-- AddForeignKey
ALTER TABLE "AgentVersion" ADD CONSTRAINT "AgentVersion_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_agentVersionId_fkey" FOREIGN KEY ("agentVersionId") REFERENCES "AgentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyRule" ADD CONSTRAINT "SafetyRule_agentVersionId_fkey" FOREIGN KEY ("agentVersionId") REFERENCES "AgentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_agentVersionId_fkey" FOREIGN KEY ("agentVersionId") REFERENCES "AgentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_parentScenarioId_fkey" FOREIGN KEY ("parentScenarioId") REFERENCES "Scenario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TestRun" ADD CONSTRAINT "TestRun_agentVersionId_fkey" FOREIGN KEY ("agentVersionId") REFERENCES "AgentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Failure" ADD CONSTRAINT "Failure_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
