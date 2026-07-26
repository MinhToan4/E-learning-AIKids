-- CreateTable
CREATE TABLE "competency_frameworks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "expected_domain_count" INTEGER NOT NULL DEFAULT 4,
    "source_reference" TEXT,
    "alignment_statement" TEXT,
    "disclaimer" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by_id" UUID,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competency_frameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_domains" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "framework_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "competency_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domain_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "learner_label" TEXT NOT NULL,
    "level_policy_json" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "competency_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_mapping_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "framework_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "calculation_policy_json" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by_id" UUID,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competency_mapping_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_mappings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mapping_version_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "evidence_type" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "competency_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_evidence" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fingerprint" TEXT NOT NULL,
    "student_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "mapping_id" UUID NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "source_version" INTEGER,
    "evidence_type" TEXT NOT NULL,
    "score_percent" DOUBLE PRECISION NOT NULL,
    "weight_snapshot" DOUBLE PRECISION NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "revoked_at" TIMESTAMP(3),
    "metadata_json" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competency_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "mapping_version_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "current" BOOLEAN NOT NULL DEFAULT true,
    "score_percent" DOUBLE PRECISION,
    "level" TEXT NOT NULL,
    "evidence_count" INTEGER NOT NULL,
    "calculation_json" JSONB NOT NULL,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competency_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_snapshot_evidence" (
    "snapshot_id" UUID NOT NULL,
    "evidence_id" UUID NOT NULL,

    CONSTRAINT "competency_snapshot_evidence_pkey" PRIMARY KEY ("snapshot_id","evidence_id")
);

-- CreateTable
CREATE TABLE "competency_recalculation_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mapping_version_id" UUID NOT NULL,
    "student_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT NOT NULL,
    "actor_id" UUID,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competency_recalculation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "layout_json" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by_id" UUID,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credential_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "course_id" TEXT NOT NULL,
    "template_id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "min_completion_percent" INTEGER NOT NULL DEFAULT 100,
    "require_passed_assessment" BOOLEAN NOT NULL DEFAULT true,
    "required_skill_levels_json" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by_id" UUID,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credential_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issued_credentials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "course_id" TEXT NOT NULL,
    "rule_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "verification_code" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'issued',
    "issued_by_id" UUID,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_by_id" UUID,
    "revoked_at" TIMESTAMP(3),
    "revoke_reason" TEXT,
    "supersedes_credential_id" UUID,

    CONSTRAINT "issued_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "competency_frameworks_status_created_at_idx" ON "competency_frameworks"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "competency_frameworks_code_version_key" ON "competency_frameworks"("code", "version");

-- CreateIndex
CREATE INDEX "competency_domains_framework_id_sort_order_idx" ON "competency_domains"("framework_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "competency_domains_framework_id_code_key" ON "competency_domains"("framework_id", "code");

-- CreateIndex
CREATE INDEX "competency_skills_domain_id_sort_order_idx" ON "competency_skills"("domain_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "competency_skills_domain_id_code_key" ON "competency_skills"("domain_id", "code");

-- CreateIndex
CREATE INDEX "competency_mapping_versions_framework_id_status_idx" ON "competency_mapping_versions"("framework_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "competency_mapping_versions_framework_id_version_key" ON "competency_mapping_versions"("framework_id", "version");

-- CreateIndex
CREATE INDEX "competency_mappings_source_type_source_id_active_idx" ON "competency_mappings"("source_type", "source_id", "active");

-- CreateIndex
CREATE INDEX "competency_mappings_skill_id_idx" ON "competency_mappings"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "competency_mappings_mapping_version_id_skill_id_source_type_key" ON "competency_mappings"("mapping_version_id", "skill_id", "source_type", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "competency_evidence_fingerprint_key" ON "competency_evidence"("fingerprint");

-- CreateIndex
CREATE INDEX "competency_evidence_student_id_skill_id_status_occurred_at_idx" ON "competency_evidence"("student_id", "skill_id", "status", "occurred_at");

-- CreateIndex
CREATE INDEX "competency_evidence_source_type_source_id_idx" ON "competency_evidence"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "competency_snapshots_student_id_current_computed_at_idx" ON "competency_snapshots"("student_id", "current", "computed_at");

-- CreateIndex
CREATE INDEX "competency_snapshots_mapping_version_id_current_idx" ON "competency_snapshots"("mapping_version_id", "current");

-- CreateIndex
CREATE UNIQUE INDEX "competency_snapshots_student_id_skill_id_mapping_version_id_key" ON "competency_snapshots"("student_id", "skill_id", "mapping_version_id", "version");

-- CreateIndex
CREATE INDEX "competency_snapshot_evidence_evidence_id_idx" ON "competency_snapshot_evidence"("evidence_id");

-- CreateIndex
CREATE INDEX "competency_recalculation_runs_status_created_at_idx" ON "competency_recalculation_runs"("status", "created_at");

-- CreateIndex
CREATE INDEX "competency_recalculation_runs_student_id_created_at_idx" ON "competency_recalculation_runs"("student_id", "created_at");

-- CreateIndex
CREATE INDEX "credential_templates_kind_status_idx" ON "credential_templates"("kind", "status");

-- CreateIndex
CREATE UNIQUE INDEX "credential_templates_code_version_key" ON "credential_templates"("code", "version");

-- CreateIndex
CREATE INDEX "credential_rules_course_id_status_idx" ON "credential_rules"("course_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "credential_rules_course_id_kind_version_key" ON "credential_rules"("course_id", "kind", "version");

-- CreateIndex
CREATE UNIQUE INDEX "issued_credentials_verification_code_key" ON "issued_credentials"("verification_code");

-- CreateIndex
CREATE INDEX "issued_credentials_student_id_issued_at_idx" ON "issued_credentials"("student_id", "issued_at");

-- CreateIndex
CREATE INDEX "issued_credentials_course_id_status_idx" ON "issued_credentials"("course_id", "status");

-- CreateIndex
CREATE INDEX "issued_credentials_student_id_rule_id_status_idx" ON "issued_credentials"("student_id", "rule_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "issued_credentials_supersedes_credential_id_key" ON "issued_credentials"("supersedes_credential_id");

-- At most one currently valid credential per learner/rule; revoked rows remain
-- immutable history and may be superseded by a new issuance.
CREATE UNIQUE INDEX "issued_credentials_one_active_key"
  ON "issued_credentials"("student_id", "rule_id")
  WHERE "status" = 'issued';

-- AddForeignKey
ALTER TABLE "competency_frameworks" ADD CONSTRAINT "competency_frameworks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_domains" ADD CONSTRAINT "competency_domains_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "competency_frameworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_skills" ADD CONSTRAINT "competency_skills_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "competency_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_mapping_versions" ADD CONSTRAINT "competency_mapping_versions_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "competency_frameworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_mapping_versions" ADD CONSTRAINT "competency_mapping_versions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_mappings" ADD CONSTRAINT "competency_mappings_mapping_version_id_fkey" FOREIGN KEY ("mapping_version_id") REFERENCES "competency_mapping_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_mappings" ADD CONSTRAINT "competency_mappings_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "competency_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_evidence" ADD CONSTRAINT "competency_evidence_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_evidence" ADD CONSTRAINT "competency_evidence_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "competency_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_evidence" ADD CONSTRAINT "competency_evidence_mapping_id_fkey" FOREIGN KEY ("mapping_id") REFERENCES "competency_mappings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_snapshots" ADD CONSTRAINT "competency_snapshots_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_snapshots" ADD CONSTRAINT "competency_snapshots_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "competency_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_snapshots" ADD CONSTRAINT "competency_snapshots_mapping_version_id_fkey" FOREIGN KEY ("mapping_version_id") REFERENCES "competency_mapping_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_snapshot_evidence" ADD CONSTRAINT "competency_snapshot_evidence_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "competency_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_snapshot_evidence" ADD CONSTRAINT "competency_snapshot_evidence_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "competency_evidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_recalculation_runs" ADD CONSTRAINT "competency_recalculation_runs_mapping_version_id_fkey" FOREIGN KEY ("mapping_version_id") REFERENCES "competency_mapping_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_recalculation_runs" ADD CONSTRAINT "competency_recalculation_runs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_templates" ADD CONSTRAINT "credential_templates_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_rules" ADD CONSTRAINT "credential_rules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_rules" ADD CONSTRAINT "credential_rules_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "credential_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_rules" ADD CONSTRAINT "credential_rules_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_credentials" ADD CONSTRAINT "issued_credentials_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_credentials" ADD CONSTRAINT "issued_credentials_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_credentials" ADD CONSTRAINT "issued_credentials_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "credential_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_credentials" ADD CONSTRAINT "issued_credentials_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "credential_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_credentials" ADD CONSTRAINT "issued_credentials_issued_by_id_fkey" FOREIGN KEY ("issued_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_credentials" ADD CONSTRAINT "issued_credentials_revoked_by_id_fkey" FOREIGN KEY ("revoked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_credentials" ADD CONSTRAINT "issued_credentials_supersedes_credential_id_fkey" FOREIGN KEY ("supersedes_credential_id") REFERENCES "issued_credentials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Database invariants complement API validation and fail closed for direct SQL.
ALTER TABLE "competency_frameworks"
  ADD CONSTRAINT "competency_frameworks_version_check" CHECK ("version" > 0),
  ADD CONSTRAINT "competency_frameworks_domain_count_check" CHECK ("expected_domain_count" = 4),
  ADD CONSTRAINT "competency_frameworks_status_check" CHECK ("status" IN ('draft', 'published', 'archived'));
ALTER TABLE "competency_mapping_versions"
  ADD CONSTRAINT "competency_mapping_versions_version_check" CHECK ("version" > 0),
  ADD CONSTRAINT "competency_mapping_versions_status_check" CHECK ("status" IN ('draft', 'published', 'archived'));
ALTER TABLE "competency_mappings"
  ADD CONSTRAINT "competency_mappings_weight_check" CHECK ("weight" > 0),
  ADD CONSTRAINT "competency_mappings_source_type_check"
    CHECK ("source_type" IN ('course', 'quest', 'question_version', 'assessment')),
  ADD CONSTRAINT "competency_mappings_evidence_type_check"
    CHECK ("evidence_type" IN ('lesson_completion', 'assessment_score', 'question_score', 'artifact_rubric', 'teacher_observation'));
ALTER TABLE "competency_evidence"
  ADD CONSTRAINT "competency_evidence_score_check" CHECK ("score_percent" BETWEEN 0 AND 100),
  ADD CONSTRAINT "competency_evidence_weight_check" CHECK ("weight_snapshot" > 0),
  ADD CONSTRAINT "competency_evidence_status_check" CHECK ("status" IN ('active', 'revoked'));
ALTER TABLE "competency_snapshots"
  ADD CONSTRAINT "competency_snapshots_version_check" CHECK ("version" > 0),
  ADD CONSTRAINT "competency_snapshots_score_check" CHECK ("score_percent" IS NULL OR "score_percent" BETWEEN 0 AND 100),
  ADD CONSTRAINT "competency_snapshots_level_check" CHECK ("level" IN ('no_data', 'not_met', 'developing', 'achieved')),
  ADD CONSTRAINT "competency_snapshots_evidence_count_check" CHECK ("evidence_count" >= 0);
CREATE UNIQUE INDEX "competency_snapshots_one_current_key"
  ON "competency_snapshots"("student_id", "skill_id", "mapping_version_id")
  WHERE "current" = true;
ALTER TABLE "competency_recalculation_runs"
  ADD CONSTRAINT "competency_recalculation_runs_status_check" CHECK ("status" IN ('pending', 'running', 'completed', 'failed'));
ALTER TABLE "credential_templates"
  ADD CONSTRAINT "credential_templates_version_check" CHECK ("version" > 0),
  ADD CONSTRAINT "credential_templates_kind_check" CHECK ("kind" IN ('certificate', 'badge')),
  ADD CONSTRAINT "credential_templates_status_check" CHECK ("status" IN ('draft', 'published', 'archived'));
ALTER TABLE "credential_rules"
  ADD CONSTRAINT "credential_rules_version_check" CHECK ("version" > 0),
  ADD CONSTRAINT "credential_rules_completion_check" CHECK ("min_completion_percent" BETWEEN 0 AND 100),
  ADD CONSTRAINT "credential_rules_kind_check" CHECK ("kind" IN ('certificate', 'badge')),
  ADD CONSTRAINT "credential_rules_status_check" CHECK ("status" IN ('draft', 'published', 'archived'));
ALTER TABLE "issued_credentials"
  ADD CONSTRAINT "issued_credentials_kind_check" CHECK ("kind" IN ('certificate', 'badge')),
  ADD CONSTRAINT "issued_credentials_status_check" CHECK ("status" IN ('issued', 'revoked'));
