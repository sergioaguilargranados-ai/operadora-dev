-- Insertar usuarios de prueba
-- Password para todos: Password123!
-- Hash bcrypt: $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky

INSERT INTO users (email, password_hash, full_name, role, is_verified, created_at) VALUES
('superadmin@asoperadora.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky', 'Super Admin', 'SUPER_ADMIN', true, NOW()),
('admin@asoperadora.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky', 'Admin', 'ADMIN', true, NOW()),
('manager@empresa.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky', 'Manager Principal', 'MANAGER', true, NOW()),
('maria.garcia@empresa.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky', 'Maria Garcia', 'MANAGER', true, NOW()),
('empleado@empresa.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky', 'Empleado Uno', 'EMPLOYEE', true, NOW()),
('juan.perez@empresa.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky', 'Juan Perez', 'EMPLOYEE', true, NOW())
ON CONFLICT (email) DO NOTHING;
