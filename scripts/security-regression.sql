-- ═══════════════════════════════════════════════════════════════════════════
-- SECURITY REGRESSION SUITE — Best Travel Morocco / Amed
--
-- Run this against the Supabase SQL editor (or via the Supabase MCP
-- execute_sql tool) before every production migration that touches RLS,
-- roles, or a new table. Every block is self-contained and wrapped in
-- BEGIN/ROLLBACK — nothing here writes real data.
--
-- Pattern used throughout: simulate a request as a given Postgres role with
-- a given JWT claim set, the same way PostgREST does per-request, using
--   SET LOCAL ROLE <role>;
--   SET LOCAL request.jwt.claims = '{"email":"...","role":"...","sub":"..."}';
-- then attempt the operation. A blocked write raises 42501 ("new row
-- violates row-level security policy") and the whole statement errors —
-- that error IS the pass signal for a "should be denied" test. A read test
-- reports a row count instead, since SELECT under RLS silently returns zero
-- rows rather than erroring.
--
-- Last verified: 2026-09-04, against migration
-- security_gate_close_self_elevation_and_public_write_holes.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── TEST 1 — self-elevation must be impossible ──────────────────────────────
-- Any authenticated account with NO admin_user_roles row must NOT be able to
-- insert itself (or anyone) into admin_user_roles.
-- EXPECTED: this whole block ERRORS with 42501. If it succeeds instead,
-- the self-elevation hole is back — stop and fix before deploying anything else.
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"email":"regression-test-nobody@example.com","role":"authenticated","sub":"00000000-0000-0000-0000-000000000000"}';
INSERT INTO admin_user_roles (email, role, full_name) VALUES ('regression-test-nobody@example.com','super_admin','regression test');
ROLLBACK;


-- ── TEST 2 — legitimate super_admin can still manage roles ──────────────────
-- Confirms the Team page keeps working for real admins after Test 1's fix.
-- EXPECTED: one row, result = 'PASS'.
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"email":"besttravelmorocco@gmail.com","role":"authenticated","sub":"8d2fdeff-00eb-4678-88a8-708c780cf573"}';
INSERT INTO admin_user_roles (email, role, full_name) VALUES ('regression-test-legit@example.com','sales_agent','regression test');
SELECT 'PASS: super_admin can still write roles' AS result
FROM admin_user_roles WHERE email='regression-test-legit@example.com';
ROLLBACK;


-- ── TEST 3 — the admin roster is not world-readable ──────────────────────────
-- EXPECTED: anon_visible_admin_rows = 0.
BEGIN;
SET LOCAL ROLE anon;
SELECT count(*) AS anon_visible_admin_rows FROM admin_user_roles;
ROLLBACK;


-- ── TEST 4 — anon cannot write blocked_emails ────────────────────────────────
-- EXPECTED: ERRORS with 42501.
BEGIN;
SET LOCAL ROLE anon;
INSERT INTO blocked_emails (email) VALUES ('regression-test@example.com');
ROLLBACK;


-- ── TEST 5 — anon cannot write homepage_popular_tours ────────────────────────
-- EXPECTED: ERRORS with 42501.
BEGIN;
SET LOCAL ROLE anon;
INSERT INTO homepage_popular_tours (tour_id) VALUES ('regression-test');
ROLLBACK;


-- ── TEST 6 — anon CAN still read homepage_popular_tours ──────────────────────
-- Public site depends on this (fetchPopularTourIds in dataSync.ts).
-- EXPECTED: no error.
BEGIN;
SET LOCAL ROLE anon;
SELECT count(*) AS ok FROM homepage_popular_tours;
ROLLBACK;


-- ── TEST 7 — anon cannot read core operational/financial tables ─────────────
-- EXPECTED: every row_count is 0.
BEGIN;
SET LOCAL ROLE anon;
SELECT
  (SELECT count(*) FROM op_bookings)               AS op_bookings,
  (SELECT count(*) FROM op_payments)                AS op_payments,
  (SELECT count(*) FROM clients)                     AS clients,
  (SELECT count(*) FROM staff)                       AS staff,
  (SELECT count(*) FROM op_booking_sensitive_notes)  AS sensitive_notes,
  (SELECT count(*) FROM import_ledger)               AS import_ledger,
  (SELECT count(*) FROM data_conflicts)              AS data_conflicts;
ROLLBACK;


-- ── TEST 8 — an ordinary authenticated (non-admin) account cannot read the
--    sensitive-notes table (isolated at a narrower grant than is_admin_user) ─
-- EXPECTED: sensitive_notes_visible = 0.
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"email":"regression-test-nobody@example.com","role":"authenticated","sub":"00000000-0000-0000-0000-000000000000"}';
SELECT count(*) AS sensitive_notes_visible FROM op_booking_sensitive_notes;
ROLLBACK;


-- ── TEST 9 — no other SECURITY DEFINER function is callable by anon ─────────
-- Run after any migration that adds a function. EXPECTED: zero rows.
-- (A function appearing here needs an explicit REVOKE, same fix pattern as
-- amed_phase1_lockdown_new_functions.)
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND has_function_privilege('anon', p.oid, 'EXECUTE');


-- ── TEST 10 — no table has RLS disabled outright ─────────────────────────────
-- EXPECTED: zero rows. (RLS *enabled with no policy* is fine — that's an
-- intentional service-role-only lock, not this.)
SELECT c.relname
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity;
