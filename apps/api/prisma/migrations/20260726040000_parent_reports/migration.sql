-- CreateTable
CREATE TABLE "report_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "layout_json" JSONB NOT NULL,
    "required_sections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by_id" UUID,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_policies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "template_id" UUID NOT NULL,
    "period_days" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "require_approval" BOOLEAN NOT NULL DEFAULT true,
    "delivery_channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "max_delivery_attempts" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by_id" UUID,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "policy_id" UUID NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "snapshot_json" JSONB NOT NULL,
    "missing_sections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by_id" UUID,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "pdf_data" BYTEA,
    "pdf_sha256" TEXT,
    "pdf_generated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "report_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "channel" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "destination_masked" TEXT,
    "provider_message_id" TEXT,
    "last_error" TEXT,
    "next_attempt_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_templates_status_created_at_idx" ON "report_templates"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "report_templates_code_version_key" ON "report_templates"("code", "version");

-- CreateIndex
CREATE INDEX "report_policies_status_created_at_idx" ON "report_policies"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "report_policies_code_version_key" ON "report_policies"("code", "version");

-- CreateIndex
CREATE INDEX "learning_reports_student_id_period_end_idx" ON "learning_reports"("student_id", "period_end");

-- CreateIndex
CREATE INDEX "learning_reports_status_created_at_idx" ON "learning_reports"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "learning_reports_student_id_policy_id_period_start_period_e_key" ON "learning_reports"("student_id", "policy_id", "period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "report_deliveries_idempotency_key_key" ON "report_deliveries"("idempotency_key");

-- CreateIndex
CREATE INDEX "report_deliveries_status_next_attempt_at_created_at_idx" ON "report_deliveries"("status", "next_attempt_at", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "report_deliveries_report_id_recipient_id_channel_key" ON "report_deliveries"("report_id", "recipient_id", "channel");

-- AddForeignKey
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_policies" ADD CONSTRAINT "report_policies_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "report_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_policies" ADD CONSTRAINT "report_policies_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_reports" ADD CONSTRAINT "learning_reports_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_reports" ADD CONSTRAINT "learning_reports_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "report_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_reports" ADD CONSTRAINT "learning_reports_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "report_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_reports" ADD CONSTRAINT "learning_reports_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_reports" ADD CONSTRAINT "learning_reports_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_deliveries" ADD CONSTRAINT "report_deliveries_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "learning_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_deliveries" ADD CONSTRAINT "report_deliveries_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "report_templates"
  ALTER COLUMN "required_sections" SET NOT NULL,
  ADD CONSTRAINT "report_templates_version_check" CHECK ("version" > 0),
  ADD CONSTRAINT "report_templates_status_check" CHECK ("status" IN ('draft', 'published', 'archived'));
ALTER TABLE "report_policies"
  ALTER COLUMN "delivery_channels" SET NOT NULL,
  ADD CONSTRAINT "report_policies_version_check" CHECK ("version" > 0),
  ADD CONSTRAINT "report_policies_period_check" CHECK ("period_days" BETWEEN 1 AND 366),
  ADD CONSTRAINT "report_policies_attempts_check" CHECK ("max_delivery_attempts" BETWEEN 1 AND 100),
  ADD CONSTRAINT "report_policies_status_check" CHECK ("status" IN ('draft', 'published', 'archived'));
ALTER TABLE "learning_reports"
  ALTER COLUMN "missing_sections" SET NOT NULL,
  ADD CONSTRAINT "learning_reports_period_check" CHECK ("period_end" > "period_start"),
  ADD CONSTRAINT "learning_reports_version_check" CHECK ("version" > 0),
  ADD CONSTRAINT "learning_reports_status_check" CHECK ("status" IN ('draft', 'review', 'approved', 'published', 'cancelled'));
ALTER TABLE "report_deliveries"
  ADD CONSTRAINT "report_deliveries_channel_check" CHECK ("channel" IN ('in_app', 'push', 'email', 'zalo')),
  ADD CONSTRAINT "report_deliveries_status_check" CHECK ("status" IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  ADD CONSTRAINT "report_deliveries_attempts_check" CHECK ("attempts" >= 0);
