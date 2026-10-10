USE farmshare;

-- Merge any existing 'owner' accounts into 'farmer' (now the same role can
-- both list and rent equipment). Admin stays separate.
UPDATE users SET role = 'farmer' WHERE role = 'owner';

ALTER TABLE users MODIFY COLUMN role ENUM('farmer','admin') NOT NULL;

-- Verify:
DESCRIBE users;
SELECT id, name, email, role FROM users;
