"""Add inclusions and exclusions

Revision ID: dd5ee40c486e
Revises: 3f85c9c6e12d
Create Date: 2025-09-22 04:37:57.454760

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'dd5ee40c486e'
down_revision = '3f85c9c6e12d'
branch_labels = None
depends_on = None


def upgrade():
    # Create inclusions table
    op.create_table('inclusions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_inclusions_id'), 'inclusions', ['id'], unique=False)
    
    # Create exclusions table
    op.create_table('exclusions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_exclusions_id'), 'exclusions', ['id'], unique=False)
    
    # Create package_inclusions association table
    op.create_table('package_inclusions',
        sa.Column('package_id', sa.Integer(), nullable=False),
        sa.Column('inclusion_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['inclusion_id'], ['inclusions.id'], ),
        sa.ForeignKeyConstraint(['package_id'], ['packages.id'], ),
        sa.PrimaryKeyConstraint('package_id', 'inclusion_id')
    )
    
    # Create package_exclusions association table
    op.create_table('package_exclusions',
        sa.Column('package_id', sa.Integer(), nullable=False),
        sa.Column('exclusion_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['exclusion_id'], ['exclusions.id'], ),
        sa.ForeignKeyConstraint(['package_id'], ['packages.id'], ),
        sa.PrimaryKeyConstraint('package_id', 'exclusion_id')
    )
    
    # Create group_trip_inclusions association table
    op.create_table('group_trip_inclusions',
        sa.Column('group_trip_id', sa.Integer(), nullable=False),
        sa.Column('inclusion_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['group_trip_id'], ['group_trips.id'], ),
        sa.ForeignKeyConstraint(['inclusion_id'], ['inclusions.id'], ),
        sa.PrimaryKeyConstraint('group_trip_id', 'inclusion_id')
    )
    
    # Create group_trip_exclusions association table
    op.create_table('group_trip_exclusions',
        sa.Column('group_trip_id', sa.Integer(), nullable=False),
        sa.Column('exclusion_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['exclusion_id'], ['exclusions.id'], ),
        sa.ForeignKeyConstraint(['group_trip_id'], ['group_trips.id'], ),
        sa.PrimaryKeyConstraint('group_trip_id', 'exclusion_id')
    )


def downgrade():
    # Drop association tables first
    op.drop_table('group_trip_exclusions')
    op.drop_table('group_trip_inclusions')
    op.drop_table('package_exclusions')
    op.drop_table('package_inclusions')
    
    # Drop main tables
    op.drop_index(op.f('ix_exclusions_id'), table_name='exclusions')
    op.drop_table('exclusions')
    op.drop_index(op.f('ix_inclusions_id'), table_name='inclusions')
    op.drop_table('inclusions')
