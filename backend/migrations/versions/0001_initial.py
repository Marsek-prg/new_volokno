"""initial content and admin tables"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("site_content", sa.Column("id", sa.String(length=64), nullable=False), sa.Column("content", postgresql.JSONB(astext_type=sa.Text()), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.PrimaryKeyConstraint("id"))
    op.create_table("admins", sa.Column("id", sa.Integer(), nullable=False), sa.Column("username", sa.String(length=120), nullable=False), sa.Column("password_hash", sa.Text(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("username"))
    op.create_index("ix_admins_username", "admins", ["username"], unique=False)
    op.create_table("admin_sessions", sa.Column("id", sa.Integer(), nullable=False), sa.Column("admin_id", sa.Integer(), nullable=False), sa.Column("token_hash", sa.String(length=64), nullable=False), sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.ForeignKeyConstraint(["admin_id"], ["admins.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("token_hash"))
    op.create_index("ix_admin_sessions_token_hash", "admin_sessions", ["token_hash"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_admin_sessions_token_hash", table_name="admin_sessions")
    op.drop_table("admin_sessions")
    op.drop_index("ix_admins_username", table_name="admins")
    op.drop_table("admins")
    op.drop_table("site_content")
