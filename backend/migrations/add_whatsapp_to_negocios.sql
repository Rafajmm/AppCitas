-- Add WhatsApp field to negocios table
ALTER TABLE negocios 
ADD COLUMN whatsapp VARCHAR(20) DEFAULT NULL,
ADD COLUMN whatsapp_habilitado BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN negocios.whatsapp IS 'Número de teléfono de WhatsApp (formato: 34XXXXXXXXX)';
COMMENT ON COLUMN negocios.whatsapp_habilitado IS 'Indica si el botón de WhatsApp está habilitado';
