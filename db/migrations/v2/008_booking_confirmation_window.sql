-- Migration 008: Add booking confirmation window columns to op_bookings
-- Rule: booking is NEVER confirmed at payment. Admin reviews first (12-24h).
-- Status flow: ENQUIRY → PENDING_REVIEW → CONFIRMED → DEPOSIT_PAID → ACTIVE → COMPLETED
--              PENDING_REVIEW → REJECTED | CANCELLED
--
-- All columns are nullable with no defaults so existing rows are unaffected.
-- Table has 0 rows at time of writing — safe ALTER.

ALTER TABLE op_bookings
  ADD COLUMN IF NOT EXISTS submitted_at            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_deadline         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_at             TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by             UUID,
  ADD COLUMN IF NOT EXISTS confirmation_sent_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason        TEXT,
  ADD COLUMN IF NOT EXISTS payment_link_sent_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_link_expires_at TIMESTAMPTZ;

-- New bookings submitted by clients start as pending_review.
-- Bookings created by admin directly start as enquiry (admin's choice).
-- No change to existing status column type — TEXT is flexible enough.

-- Index for the admin review inbox query (pending_review ordered by deadline)
CREATE INDEX IF NOT EXISTS idx_op_bookings_review_deadline
  ON op_bookings(review_deadline)
  WHERE status = 'pending_review';

-- Index for overdue payment link check
CREATE INDEX IF NOT EXISTS idx_op_bookings_payment_link_expires
  ON op_bookings(payment_link_expires_at)
  WHERE status = 'confirmed';
