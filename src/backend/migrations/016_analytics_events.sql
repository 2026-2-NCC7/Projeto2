CREATE TABLE IF NOT EXISTS analytics_event (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id UUID NOT NULL,
    filial_id UUID REFERENCES filial(id) ON DELETE SET NULL,
    event_type VARCHAR(40) NOT NULL CHECK (event_type IN ('session_started', 'product_search', 'route_calculated', 'route_completed', 'product_not_found')),
    payload JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_store_date ON analytics_event(filial_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type_date ON analytics_event(event_type, created_at DESC);
