"""init schema
Revision ID: d2257568b8e4
Revises: 
Create Date: 2025-10-16 01:00:41.664222
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'd2257568b8e4'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'games',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('white_player', sa.String(), nullable=False),
        sa.Column('black_player', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('current_fen', sa.Text(), nullable=False),
    )
    op.create_table(
        'moves',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('game_id', sa.Integer(), sa.ForeignKey('games.id'), nullable=False),
        sa.Column('ply_number', sa.Integer(), nullable=False),
        sa.Column('san', sa.String(), nullable=False),
        sa.Column('from_square', sa.String(), nullable=False),
        sa.Column('to_square', sa.String(), nullable=False),
        sa.Column('promotion', sa.String(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('hidden_for', sa.JSON(), nullable=True),
        sa.Column('resulting_fen', sa.Text(), nullable=False),
    )

def downgrade():
    op.drop_table('moves')
    op.drop_table('games')