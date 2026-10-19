ALTER TABLE admin_user
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'admin';

ALTER TABLE admin_user
    ADD CONSTRAINT admin_user_role_check CHECK (role IN ('admin', 'manager'));
