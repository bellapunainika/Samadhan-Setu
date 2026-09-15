"""industry_workflow_correction

Revision ID: a9f3c1d82b47
Revises: 15b887d1d3ae
Create Date: 2026-09-14

Changes:
1. Add INDUSTRY_SUPPORT_REQUESTED to challengestatus enum
2. Recreate industryintereststatus enum with correct values:
   - Remove: FUNDING_INTEREST, PENDING_ADMIN_REVIEW, ACCEPTED
   - Add: INTEREST_EXPRESSED, WITHDRAWN
   - Preserve: PROPOSAL_INITIATED, PROPOSAL_UNDER_DISCUSSION,
               SUPPORT_CONFIRMED, FUNDING_CONFIRMED, PROJECT_FUNDED, DECLINED
3. Migrate existing data:
   - FUNDING_INTEREST / PENDING_ADMIN_REVIEW → INTEREST_EXPRESSED
   - ACCEPTED → SUPPORT_CONFIRMED
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a9f3c1d82b47'
down_revision = '15b887d1d3ae'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Step 1: Add INDUSTRY_SUPPORT_REQUESTED to challengestatus ──────────
    op.execute(
        "ALTER TYPE challengestatus ADD VALUE IF NOT EXISTS 'INDUSTRY_SUPPORT_REQUESTED'"
    )

    # ── Step 2: Safe Enum Creation / Migration ─────────────────────────────
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'industryintereststatus') THEN
                ALTER TYPE industryintereststatus RENAME TO industryintereststatus_old;

                CREATE TYPE industryintereststatus AS ENUM (
                    'INTEREST_EXPRESSED',
                    'PROPOSAL_INITIATED',
                    'PROPOSAL_UNDER_DISCUSSION',
                    'SUPPORT_CONFIRMED',
                    'FUNDING_CONFIRMED',
                    'PROJECT_FUNDED',
                    'DECLINED',
                    'WITHDRAWN'
                );

                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'industry_interests') THEN
                    ALTER TABLE industry_interests
                    ALTER COLUMN status TYPE industryintereststatus
                    USING (
                        CASE status::text
                            WHEN 'FUNDING_INTEREST'       THEN 'INTEREST_EXPRESSED'::industryintereststatus
                            WHEN 'PENDING_ADMIN_REVIEW'   THEN 'INTEREST_EXPRESSED'::industryintereststatus
                            WHEN 'ACCEPTED'               THEN 'SUPPORT_CONFIRMED'::industryintereststatus
                            WHEN 'INTEREST_EXPRESSED'     THEN 'INTEREST_EXPRESSED'::industryintereststatus
                            WHEN 'PROPOSAL_INITIATED'     THEN 'PROPOSAL_INITIATED'::industryintereststatus
                            WHEN 'PROPOSAL_UNDER_DISCUSSION' THEN 'PROPOSAL_UNDER_DISCUSSION'::industryintereststatus
                            WHEN 'SUPPORT_CONFIRMED'      THEN 'SUPPORT_CONFIRMED'::industryintereststatus
                            WHEN 'FUNDING_CONFIRMED'      THEN 'FUNDING_CONFIRMED'::industryintereststatus
                            WHEN 'PROJECT_FUNDED'         THEN 'PROJECT_FUNDED'::industryintereststatus
                            WHEN 'DECLINED'               THEN 'DECLINED'::industryintereststatus
                            WHEN 'WITHDRAWN'              THEN 'WITHDRAWN'::industryintereststatus
                            ELSE                               'INTEREST_EXPRESSED'::industryintereststatus
                        END
                    );
                    ALTER TABLE industry_interests
                    ALTER COLUMN status SET DEFAULT 'INTEREST_EXPRESSED'::industryintereststatus;
                END IF;

                DROP TYPE industryintereststatus_old;
            ELSE
                CREATE TYPE industryintereststatus AS ENUM (
                    'INTEREST_EXPRESSED',
                    'PROPOSAL_INITIATED',
                    'PROPOSAL_UNDER_DISCUSSION',
                    'SUPPORT_CONFIRMED',
                    'FUNDING_CONFIRMED',
                    'PROJECT_FUNDED',
                    'DECLINED',
                    'WITHDRAWN'
                );
            END IF;
        END $$;
    """)


def downgrade() -> None:
    # Recreate old enum
    op.execute("ALTER TYPE industryintereststatus RENAME TO industryintereststatus_new")
    op.execute("""
        CREATE TYPE industryintereststatus AS ENUM (
            'FUNDING_INTEREST',
            'PROPOSAL_INITIATED',
            'PROPOSAL_UNDER_DISCUSSION',
            'SUPPORT_CONFIRMED',
            'FUNDING_CONFIRMED',
            'PROJECT_FUNDED',
            'PENDING_ADMIN_REVIEW',
            'ACCEPTED',
            'DECLINED'
        )
    """)
    op.execute("""
        ALTER TABLE industry_interests
        ALTER COLUMN status TYPE industryintereststatus
        USING (
            CASE status::text
                WHEN 'INTEREST_EXPRESSED'        THEN 'FUNDING_INTEREST'::industryintereststatus
                WHEN 'PROPOSAL_INITIATED'        THEN 'PROPOSAL_INITIATED'::industryintereststatus
                WHEN 'PROPOSAL_UNDER_DISCUSSION' THEN 'PROPOSAL_UNDER_DISCUSSION'::industryintereststatus
                WHEN 'SUPPORT_CONFIRMED'         THEN 'SUPPORT_CONFIRMED'::industryintereststatus
                WHEN 'FUNDING_CONFIRMED'         THEN 'FUNDING_CONFIRMED'::industryintereststatus
                WHEN 'PROJECT_FUNDED'            THEN 'PROJECT_FUNDED'::industryintereststatus
                WHEN 'DECLINED'                  THEN 'DECLINED'::industryintereststatus
                WHEN 'WITHDRAWN'                 THEN 'DECLINED'::industryintereststatus
                ELSE                                  'FUNDING_INTEREST'::industryintereststatus
            END
        )
    """)
    op.execute("DROP TYPE industryintereststatus_new")
    # Note: Cannot remove INDUSTRY_SUPPORT_REQUESTED from challengestatus on downgrade
    # (Postgres does not support DROP VALUE from enum)
