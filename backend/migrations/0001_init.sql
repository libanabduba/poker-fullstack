-- Initial database schema for poker hands
CREATE TABLE IF NOT EXISTS hands (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  bb_size INT NOT NULL,
  seats_json JSONB NOT NULL,
  hole_cards_json JSONB NOT NULL,
  board_json JSONB NOT NULL,
  actions_json JSONB NOT NULL,
  short_line TEXT NOT NULL,
  result_json JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_hands_created_at ON hands(created_at DESC);

