CREATE EXTENSION IF NOT EXISTS "pgcrypto";





DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS cita_servicio CASCADE;
DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS bloqueos_agenda CASCADE;
DROP TABLE IF EXISTS horarios_empleado CASCADE;
DROP TABLE IF EXISTS horarios_negocio CASCADE;
DROP TABLE IF EXISTS empleado_servicio CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS empleados CASCADE;
DROP TABLE IF EXISTS negocio_administrador CASCADE;
DROP TABLE IF EXISTS negocios CASCADE;
DROP TABLE IF EXISTS administradores CASCADE;
DROP TYPE IF EXISTS rol_usuario CASCADE;





CREATE TYPE rol_usuario AS ENUM ('superadmin','admin');





CREATE TABLE administradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol rol_usuario NOT NULL DEFAULT 'admin',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);





CREATE TABLE negocios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_admin UUID NOT NULL REFERENCES administradores(id),
    nombre VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    descripcion TEXT,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    logo_url VARCHAR(500),
    color_primario VARCHAR(7) DEFAULT '#3B82F6',
    color_secundario VARCHAR(7) DEFAULT '#10B981',
    color_acento VARCHAR(7) DEFAULT '#c0cc11',
    whatsapp VARCHAR(20),
    web_url VARCHAR(500),
    reservas_habilitadas BOOLEAN NOT NULL DEFAULT true,
    antelacion_minima_horas INTEGER NOT NULL DEFAULT 2,
    tiempo_confirmacion_minutos INTEGER NOT NULL DEFAULT 30,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE negocio_administrador (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    administrador_id UUID NOT NULL REFERENCES administradores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (negocio_id, administrador_id)
);





CREATE TABLE empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(20),
    especialidad VARCHAR(200),
    bio TEXT,
    foto_url VARCHAR(500),
    color_calendario VARCHAR(7) DEFAULT '#3B82F6',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    duracion_minutos INTEGER NOT NULL CHECK (duracion_minutos > 0 AND duracion_minutos % 15 = 0),
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    precio_especial DECIMAL(10,2) CHECK (precio_especial IS NULL OR precio_especial >= 0),
    requiere_deposito BOOLEAN NOT NULL DEFAULT false,
    monto_deposito DECIMAL(10,2) CHECK (monto_deposito IS NULL OR monto_deposito >= 0),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE empleado_servicio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (empleado_id, servicio_id)
);





CREATE TABLE horarios_negocio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (hora_cierre > hora_apertura)
);

CREATE TABLE horarios_empleado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (hora_cierre > hora_apertura)
);

CREATE TABLE bloqueos_agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    empleado_id UUID REFERENCES empleados(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    tipo VARCHAR(20) NOT NULL DEFAULT 'bloqueo',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (fecha_fin >= fecha_inicio),
    CHECK (
        (hora_inicio IS NULL AND hora_fin IS NULL)
        OR
        (hora_inicio IS NOT NULL AND hora_fin IS NOT NULL AND hora_fin > hora_inicio)
    )
);





CREATE TABLE citas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    empleado_id UUID REFERENCES empleados(id) ON DELETE SET NULL,
    nombre_cliente VARCHAR(100) NOT NULL,
    email_cliente VARCHAR(255),
    telefono_cliente VARCHAR(20),
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    confirmado BOOLEAN NOT NULL DEFAULT false,
    confirmado_en TIMESTAMP WITH TIME ZONE,
    token_confirmacion UUID DEFAULT gen_random_uuid(),
    notas_cliente TEXT,
    notas_negocio TEXT,
    precio_total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (precio_total >= 0),
    deposito_pagado DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (deposito_pagado >= 0),
    origen VARCHAR(20) NOT NULL DEFAULT 'web',
    recordatorio_enviado BOOLEAN NOT NULL DEFAULT false,
    cancelado_por UUID REFERENCES administradores(id),
    cancelado_en TIMESTAMP WITH TIME ZONE,
    motivo_cancelacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CHECK (hora_fin > hora_inicio),
    CHECK (
        EXTRACT(MINUTE FROM hora_inicio) IN (0, 15, 30, 45)
        AND EXTRACT(SECOND FROM hora_inicio) = 0
    ),
    CHECK (
        EXTRACT(MINUTE FROM hora_fin) IN (0, 15, 30, 45)
        AND EXTRACT(SECOND FROM hora_fin) = 0
    ),
    CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada', 'no_show')),
    CHECK (origen IN ('web', 'telefono', 'presencial'))
);

CREATE TABLE cita_servicio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
    servicio_id UUID NOT NULL REFERENCES servicios(id),
    empleado_id UUID REFERENCES empleados(id) ON DELETE SET NULL,
    nombre_servicio VARCHAR(200) NOT NULL,
    precio_servicio DECIMAL(10,2) NOT NULL CHECK (precio_servicio >= 0),
    duracion_minutos INTEGER NOT NULL CHECK (duracion_minutos > 0 AND duracion_minutos % 15 = 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cita_id, servicio_id)
);





CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,
    destinatario VARCHAR(255) NOT NULL,
    asunto VARCHAR(500) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'enviado',
    error_mensaje TEXT,
    enviado_en TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (estado IN ('enviado', 'fallido', 'pendiente'))
);