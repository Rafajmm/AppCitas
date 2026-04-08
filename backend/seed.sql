-- Minimal seed data for availability endpoint testing

INSERT INTO administradores (id, nombre, email, password_hash, rol, activo)
VALUES 
  (gen_random_uuid(), 'Admin Demo', 'admin@demo.com', '$2b$10$S0I60SaFpilj.2Qg3xLDyuqK8MihM.3WyUvHQaAlWYBTosYW.KO7O', 'admin', true),
  (gen_random_uuid(), 'Superadmin Demo', 'superadmin@demo.com', '$2b$10$S0I60SaFpilj.2Qg3xLDyuqK8MihM.3WyUvHQaAlWYBTosYW.KO7O', 'superadmin', true)
ON CONFLICT (email) DO NOTHING;

WITH a AS (
  SELECT id FROM administradores WHERE email = 'admin@demo.com' LIMIT 1
), n AS (
  INSERT INTO negocios (id_admin, nombre, slug, reservas_habilitadas, antelacion_minima_horas, activo, whatsapp)
  SELECT a.id, 'Peluquería Rafa', 'peluqueria-rafa', true, 2, true, '34600123456'
  FROM a
  ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre, whatsapp = EXCLUDED.whatsapp
  RETURNING id
)
SELECT 1;

-- Ensure business schedules Mon-Sun 09:00-18:00
INSERT INTO horarios_negocio (negocio_id, dia_semana, hora_apertura, hora_cierre, activo)
SELECT n.id, d.dia_semana, '09:00', '18:00', true
FROM negocios n
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS d(dia_semana)
WHERE n.slug = 'peluqueria-rafa'
ON CONFLICT DO NOTHING;

-- One employee
WITH n AS (SELECT id AS negocio_id FROM negocios WHERE slug = 'peluqueria-rafa')
INSERT INTO empleados (negocio_id, nombre, activo)
SELECT n.negocio_id, 'Empleado 1', true
FROM n
ON CONFLICT DO NOTHING;

-- Employee schedules Mon-Sun 09:00-18:00
INSERT INTO horarios_empleado (empleado_id, dia_semana, hora_apertura, hora_cierre, activo)
SELECT e.id, d.dia_semana, '09:00', '18:00', true
FROM empleados e
JOIN negocios n ON n.id = e.negocio_id
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS d(dia_semana)
WHERE n.slug = 'peluqueria-rafa'
ON CONFLICT DO NOTHING;

-- Two services (30 and 45)
WITH n AS (SELECT id AS negocio_id FROM negocios WHERE slug = 'peluqueria-rafa')
INSERT INTO servicios (negocio_id, nombre, duracion_minutos, precio, activo)
SELECT n.negocio_id, 'Corte', 30, 15, true FROM n
ON CONFLICT DO NOTHING;

WITH n AS (SELECT id AS negocio_id FROM negocios WHERE slug = 'peluqueria-rafa')
INSERT INTO servicios (negocio_id, nombre, duracion_minutos, precio, activo)
SELECT n.negocio_id, 'Tinte', 45, 30, true FROM n
ON CONFLICT DO NOTHING;
