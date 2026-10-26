CREATE TABLE password_reset_token (
    token_hash CHAR(64) PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES admin_user(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_token_admin ON password_reset_token (admin_id);
CREATE INDEX idx_password_reset_token_expiry ON password_reset_token (expires_at);
