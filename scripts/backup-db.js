#!/usr/bin/env node
/**
 * BTM Database Backup Script
 *
 * Exports all production tables via Supabase REST API.
 * Writes timestamped backup to ./backup-output/<timestamp>/
 * Generates manifest with record counts and checksums.
 * Exits 0 on success, 1 on failure.
 *
 * Requires env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createHash } from "crypto";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  process.exit(1);
}

// All known production tables — ordered from most to least critical.
// The script tolerates tables that don't exist (skips with a warning).
const TABLES = [
  "products",
  "tours",
  "blog_posts",
  "op_bookings",
  "op_payments",
  "inquiries",
  "clients",
  "btm_accommodations",
  "btm_pricing_rules",
  "btm_seasons",
  "departures",
  "destinations",
  "testimonials",
  "faqs",
  "tour_faqs",
  "seo_settings",
  "homepage_sections",
  "homepage_popular_tours",
  "nav_items",
  "nav_menus",
  "nav_dropdown_tours",
  "staff",
  "vehicles",
  "suppliers",
  "coupons",
  "custom_tour_requests",
  "experience_products",
  "email_templates",
  "admin_user_roles",
  "blocked_emails",
];

const PAGE_SIZE = 1000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function ts() {
  return new Date().toISOString().replace("T", " ").split(".")[0];
}

function makeTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
}

function sha256(data) {
  return createHash("sha256").update(JSON.stringify(data)).digest("hex").slice(0, 12);
}

async function fetchPage(table, offset) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=${PAGE_SIZE}&offset=${offset}`;
  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Accept: "application/json",
    },
  });

  if (res.status === 404 || res.status === 400) {
    const body = await res.text();
    if (body.includes("does not exist") || body.includes("relation") || res.status === 404) {
      return null; // table doesn't exist
    }
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} fetching ${table}: ${body}`);
  }

  const rows = await res.json();
  if (!Array.isArray(rows)) {
    throw new Error(`Unexpected response for ${table}: ${JSON.stringify(rows).slice(0, 200)}`);
  }
  return rows;
}

async function exportTable(table) {
  const rows = [];
  let offset = 0;

  while (true) {
    const page = await fetchPage(table, offset);
    if (page === null) return null; // table not found
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return rows;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const startedAt = new Date();
  const timestamp = makeTimestamp();
  const outDir = join(REPO_ROOT, "backup-output", timestamp);

  mkdirSync(outDir, { recursive: true });

  console.log(`[${ts()}] BTM Backup starting — ${timestamp}`);
  console.log(`[${ts()}] Output: ${outDir}`);
  console.log(`[${ts()}] Tables to export: ${TABLES.length}`);

  const manifest = {
    project:     "Best Travel Morocco",
    timestamp,
    started_at:  startedAt.toISOString(),
    completed_at: null,
    git_commit:  process.env.GITHUB_SHA ?? "local",
    run_id:      process.env.GITHUB_RUN_ID ?? "local",
    supabase_url: SUPABASE_URL,
    tables: {},
    skipped_tables: [],
    warnings: [],
    status: "IN_PROGRESS",
  };

  let totalRows = 0;
  let exportedTables = 0;
  let failedTables = [];

  for (const table of TABLES) {
    try {
      process.stdout.write(`  Exporting ${table}...`);
      const rows = await exportTable(table);

      if (rows === null) {
        console.log(` SKIP (table not found)`);
        manifest.skipped_tables.push(table);
        continue;
      }

      const checksum = sha256(rows);
      const filename = `${table}.json`;
      writeFileSync(join(outDir, filename), JSON.stringify(rows, null, 2), "utf8");

      manifest.tables[table] = { rows: rows.length, checksum, file: filename };
      totalRows += rows.length;
      exportedTables++;
      console.log(` ${rows.length} rows (sha256: ${checksum})`);
    } catch (err) {
      console.log(` ERROR: ${err.message}`);
      manifest.warnings.push(`${table}: ${err.message}`);
      failedTables.push(table);
    }
  }

  // ── Config snapshot (no secrets) ─────────────────────────────────────────
  const configSnapshot = {
    note: "Values present/absent only — no secret values stored",
    env_vars: {
      SUPABASE_URL:              SUPABASE_URL ? "PRESENT" : "MISSING",
      SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY  ? "PRESENT" : "MISSING",
      RESEND_API_KEY:            process.env.RESEND_API_KEY  ? "PRESENT" : "MISSING",
      DATABASE_URL:              process.env.DATABASE_URL    ? "PRESENT" : "MISSING",
    },
    supabase_project: SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] ?? "unknown",
    github_repo:      process.env.GITHUB_REPOSITORY ?? "local",
    github_ref:       process.env.GITHUB_REF ?? "local",
  };
  writeFileSync(join(outDir, "config-snapshot.json"), JSON.stringify(configSnapshot, null, 2));

  // ── Schema reference ──────────────────────────────────────────────────────
  // Copy db/schema.ts as a plain text reference (the authoritative schema definition)
  const schemaPath = join(REPO_ROOT, "db", "schema.ts");
  if (existsSync(schemaPath)) {
    const schemaContent = readFileSync(schemaPath, "utf8");
    writeFileSync(join(outDir, "db-schema-reference.ts"), schemaContent);
    manifest.schema_file = "db-schema-reference.ts";
  }

  // ── Verification ─────────────────────────────────────────────────────────
  console.log(`\n[${ts()}] Verification:`);
  let verificationPassed = true;

  // Check critical tables have rows
  const criticalTables = ["products", "tours", "blog_posts"];
  for (const t of criticalTables) {
    const info = manifest.tables[t];
    if (!info) {
      if (manifest.skipped_tables.includes(t)) {
        console.log(`  WARNING: critical table "${t}" was not found in database`);
        manifest.warnings.push(`Critical table "${t}" not found`);
      } else {
        console.log(`  FAIL: critical table "${t}" missing from backup`);
        verificationPassed = false;
      }
    } else if (info.rows === 0) {
      console.log(`  WARNING: critical table "${t}" has 0 rows`);
      manifest.warnings.push(`Critical table "${t}" has 0 rows`);
    } else {
      console.log(`  OK: "${t}" → ${info.rows} rows`);
    }
  }

  if (failedTables.length > 0) {
    console.log(`  FAIL: ${failedTables.length} table(s) had errors: ${failedTables.join(", ")}`);
    verificationPassed = false;
  }

  // ── Manifest ──────────────────────────────────────────────────────────────
  manifest.completed_at = new Date().toISOString();
  manifest.total_rows = totalRows;
  manifest.exported_tables = exportedTables;
  manifest.failed_tables = failedTables;
  manifest.status = verificationPassed && failedTables.length === 0 ? "SUCCESS" : "FAILED";

  writeFileSync(join(outDir, "backup-manifest.json"), JSON.stringify(manifest, null, 2));

  // Also write lightweight manifest to backups/manifests/ for git history
  const manifestsDir = join(REPO_ROOT, "backups", "manifests");
  mkdirSync(manifestsDir, { recursive: true });
  const lightManifest = {
    timestamp,
    status:          manifest.status,
    total_rows:      totalRows,
    exported_tables: exportedTables,
    skipped_tables:  manifest.skipped_tables,
    failed_tables:   failedTables,
    warnings:        manifest.warnings,
    git_commit:      manifest.git_commit,
    run_id:          manifest.run_id,
    completed_at:    manifest.completed_at,
  };
  writeFileSync(
    join(manifestsDir, `${timestamp}.json`),
    JSON.stringify(lightManifest, null, 2)
  );

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(60)}`);
  console.log(`Backup: ${timestamp}`);
  console.log(`Status: ${manifest.status}`);
  console.log(`Tables: ${exportedTables} exported, ${manifest.skipped_tables.length} skipped, ${failedTables.length} failed`);
  console.log(`Rows:   ${totalRows.toLocaleString()} total`);
  console.log(`Output: ${outDir}`);
  if (manifest.warnings.length > 0) {
    console.log(`Warnings:`);
    manifest.warnings.forEach(w => console.log(`  - ${w}`));
  }
  console.log(`${"─".repeat(60)}`);

  if (manifest.status !== "SUCCESS") {
    console.error("\nBackup completed with errors.");
    process.exit(1);
  }

  console.log("\nBackup completed successfully.");
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
