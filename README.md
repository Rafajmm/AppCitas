# AppCitas - Sistema de Reservas y Gestión de Citas

Una aplicación completa para la gestión de reservas y citas diseñada para negocios de servicios. Permite a los clientes reservar servicios online y a los administradores gestionar su agenda, personalizar su negocio y confirmar citas a través de correo electrónico. La aplicación está administrada por un superadmin que puede crear y gestionar múltiples negocios.

## Características Principales

### Gestión de Negocios
- **Panel de Superadministrador**: Creación y gestión de múltiples negocios
- **Panel de Administración**: Gestión completa del negocio
- **Personalización de Marca**: Logo, colores y descripción personalizable
- **Configuración de Contacto**: WhatsApp, sitio web y datos de contacto
- **Gestión de Disponibilidad**: Control de horarios y bloqueos

### Sistema de Reservas
- **Calendario Interactivo**: Visualización de disponibilidad en tiempo real
- **Selección de Servicios**: Múltiples servicios por cita
- **Asignación de Empleados**: Selección de profesional específico
- **Confirmación por Email**: Sistema de confirmación automática con botones HTML
- **Recordatorios Automáticos**: Envío de recordatorios 24 horas antes de la cita

### Gestión de Personal
- **Empleados**: Alta, baja y gestión de profesionales
- **Asignación de Servicios**: Configuración de servicios por empleado
- **Horarios Personalizados**: Horarios individuales por empleado
- **Gestión de Citas por Empleado**: Vista y gestión de reservas asignadas

### Personalización Avanzada
- **Upload de Logo**: Subida de archivos de imagen (JPEG, PNG, GIF, WebP)
- **Colores de Marca**: Selector de colores primario, secundario y acento
- **Descripción del Negocio**: Campo de texto completo para descripción
- **Configuración de Antelación**: Tiempo mínimo de reserva y confirmación
- **Vista Previa**: Preview en tiempo real de cambios

## Stack Tecnológico

### Backend
- **NestJS**: Framework Node.js para el backend (CommonJS)
- **PostgreSQL**: Base de datos relacional
- **JWT**: Autenticación y autorización
- **Nodemailer**: Envío de emails con Ethereal Email (para pruebas de desarrollo)
- **Multer**: Gestión de subida de archivos para los logos de los negocios
- **Joi**: Validación de datos de entrada

### Frontend
- **React**: Biblioteca JavaScript para UI
- **React Router**: Navegación y routing
- **Bootstrap**: Framework CSS para diseño responsive
- **React Bootstrap**: Componentes Bootstrap para React
- **React Bootstrap Icons**: Iconos para la interfaz

### Base de Datos
- **PostgreSQL**: Sistema de gestión de bases de datos
- **UUID**: Identificadores únicos para entidades
- **Timestamps**: Control de creación y actualización
- **Soft Delete**: Eliminación lógica con `deleted_at`

## Funcionalidades Detalladas

### Sistema de Autenticación
- Login de administradores con JWT
- Roles de usuario (superadmin, admin)
- Rutas protegidas en el panel de administración
- Manejo de sesiones y tokens
- Guards de autorización por rol

### Gestión de Servicios
- CRUD completo de servicios
- Configuración de precios y duración
- Activación/Desactivación de servicios
- Asignación a empleados específicos
- Validación de disponibilidad por servicio

### Gestión de Horarios
- Configuración de horarios por negocio
- Horarios individuales por empleado
- Días laborables y horarios de apertura/cierre
- Validación de disponibilidad
- Sistema de slots de tiempo configurable

### Sistema de Bloqueos
- Bloqueos por día completo
- Bloqueos por rangos horarios
- Bloqueos por empleado específico
- Gestión de unavailable times
- Bloqueos recurrentes

### Sistema de Email
- **Emails de Confirmación**: Con botones HTML para confirmar/cancelar
- **Emails de Recordatorio**: Envío automático 24h antes (±5 minutos)
- **Formato Multipart**: Versión texto + HTML para máxima compatibilidad
- **Fecha en Español**: Formato localizado (ej: "miércoles, 8 de abril de 2026")
- **Tokens Únicos**: Confirmación y cancelación seguras
- **Logging Completo**: Registro de todos los envíos en `email_logs`
- **Integración SMTP**: Configurable con Ethereal Email para desarrollo

### Sistema de Upload
- Subida de logos de negocio
- Validación de tipo y tamaño de archivo
- Almacenamiento local con URLs únicas
- Serving de archivos estáticos
- Preview en tiempo real

### Panel de Administración
- **Dashboard**: Estadísticas y métricas
- **Gestión de Citas**: Vista completa de reservas
- **Calendario Interactivo**: Visualización de disponibilidad
- **Configuración del Negocio**: Personalización completa
- **Gestión de Empleados**: CRUD y asignación de servicios
- **Configuración de Horarios**: Por negocio y por empleado
- **Gestión de Bloqueos**: Bloqueos de disponibilidad
- **Configuración de Servicios**: Catálogo de servicios

### Panel de Superadministración
- **Gestión de Administradores**: CRUD de usuarios admin
- **Gestión de Negocios**: Creación y configuración de múltiples negocios
- **Dashboard Global**: Estadísticas de todo el sistema
- **Asignación de Negocios**: Asignar admins a negocios específicos

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL 13+
- npm o yarn

### Configuración del Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run start:dev
```

### Configuración del Frontend
```bash
cd frontend
npm install
npm start
```

### Configuración de la Base de Datos
```bash
# Crear base de datos
createdb AppCitas

# Ejecutar script de creación
psql -d AppCitas -f scriptBD.sql

# Ejecutar seed de datos (opcional)
psql -d AppCitas -f seed.sql
```

## Estructura del Proyecto

```
AppCitas/
|-- backend/
|   |-- src/
|   |   |-- modules/
|   |   |   |-- admin/          # Panel de administración
|   |   |   |-- public/         # Endpoints públicos
|   |   |   |-- superadmin/     # Panel de superadmin
|   |   |   |-- email/          # Sistema de emails
|   |   |   |-- availability/   # Lógica de disponibilidad
|   |   |   |-- file-upload/    # Upload de logos
|   |   |   |-- reminders/      # Recordatorios automáticos
|   |   |   |-- db/             # Conexión a BD
|   |   |   |-- app/            # Módulo principal
|   |   |-- main.js
|   |-- uploads/
|   |   |-- logos/
|   |-- .env
|   |-- seed.sql
|-- frontend/
|   |-- src/
|   |   |-- pages/
|   |   |   |-- admin/          # Panel admin
|   |   |   |-- public/         # Páginas públicas
|   |   |   |-- superadmin/     # Panel superadmin
|   |   |-- services/
|   |   |-- contexts/
|   |   |-- components/
|   |-- package.json
|-- scriptBD.sql
|-- README.md
```

## Variables de Entorno

### Backend (.env)
```
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=AppCitas
DB_USER=postgres
DB_PASSWORD=tu_password_db

# JWT
JWT_SECRET=your-secret-key

# Servidor
HOST=0.0.0.0
PORT=3001

# Email (Ethereal Email)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=tu_correo_ethereal
SMTP_PASS=tu_password_ethereal
SMTP_SECURE=tls
SMTP_FROM=noreply@appcitas.local

# URL de la aplicación
APP_BASE_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001
```

## API Endpoints

### Rutas Públicas
- `GET /public/negocios` - Listar negocios
- `GET /public/:slug` - Detalles de negocio
- `GET /public/:slug/servicios` - Servicios de negocio
- `GET /public/:slug/availability` - Disponibilidad
- `POST /public/:slug/bookings` - Crear reserva
- `POST /public/confirm/:token` - Confirmar reserva
- `POST /public/cancel/:token` - Cancelar reserva

### Rutas de Administración
- `POST /admin/auth/login` - Login admin
- `GET /admin/negocios` - Listar negocios del admin
- `PATCH /admin/negocios/:id` - Actualizar negocio
- `POST /admin/negocios/:id/upload-logo` - Subir logo
- `GET /admin/servicios` - Listar servicios
- `POST /admin/servicios` - Crear servicio
- `PUT /admin/servicios/:id` - Actualizar servicio
- `DELETE /admin/servicios/:id` - Eliminar servicio
- `GET /admin/empleados` - Listar empleados
- `POST /admin/empleados` - Crear empleado
- `PUT /admin/empleados/:id` - Actualizar empleado
- `DELETE /admin/empleados/:id` - Eliminar empleado
- `GET /admin/horarios/negocio/:id` - Horarios del negocio
- `PUT /admin/horarios/negocio/:id` - Actualizar horarios
- `GET /admin/horarios/empleado/:id` - Horarios del empleado
- `PUT /admin/horarios/empleado/:id` - Actualizar horarios del empleado
- `GET /admin/bloqueos` - Listar bloqueos
- `POST /admin/bloqueos` - Crear bloqueo
- `DELETE /admin/bloqueos/:id` - Eliminar bloqueo
- `GET /admin/citas` - Listar citas
- `PATCH /admin/citas/:id` - Actualizar cita

### Rutas de Superadministración
- `POST /superadmin/auth/login` - Login superadmin
- `GET /superadmin/administradores` - Listar administradores
- `POST /superadmin/administradores` - Crear administrador
- `PUT /superadmin/administradores/:id` - Actualizar administrador
- `DELETE /superadmin/administradores/:id` - Eliminar administrador
- `GET /superadmin/negocios` - Listar todos los negocios
- `POST /superadmin/negocios` - Crear negocio
- `PUT /superadmin/negocios/:id` - Actualizar negocio
- `DELETE /superadmin/negocios/:id` - Eliminar negocio

## Flujo de Usuario

### Cliente
1. **Explorar Negocios**: Lista de negocios disponibles
2. **Ver Detalles**: Información completa del negocio y servicios
3. **Seleccionar Servicios**: Elección de uno o múltiples servicios
4. **Elegir Fecha/Hora**: Selección de disponibilidad en calendario
5. **Completar Reserva**: Datos de contacto y confirmación
6. **Recibir Email**: Email con botones de confirmación/cancelación
7. **Confirmar Cita**: Clic en botón para confirmar reserva
8. **Recibir Recordatorio**: Email automático 24h antes

### Administrador
1. **Login**: Acceso al panel de administración
2. **Dashboard**: Vista general de estadísticas
3. **Gestión de Servicios**: CRUD de servicios y precios
4. **Gestión de Empleados**: Alta y configuración de personal
5. **Configuración de Horarios**: Definir disponibilidad
6. **Gestión de Bloqueos**: Bloquear días/horas no disponibles
7. **Personalización**: Logo, colores y descripción del negocio
8. **Gestión de Citas**: Ver y gestionar reservas confirmadas

### Superadministrador
1. **Login**: Acceso al panel de superadministración
2. **Dashboard Global**: Estadísticas de todo el sistema
3. **Gestión de Administradores**: Crear y gestionar usuarios admin
4. **Gestión de Negocios**: Crear y configurar múltiples negocios
5. **Asignación**: Asignar administradores a negocios

## Seguridad

- **JWT Tokens**: Autenticación segura con tokens expirables
- **Validación de Inputs**: Sanitización y validación con Joi
- **Protección de Rutas**: Middleware de autenticación y autorización
- **CORS**: Configuración de orígenes permitidos
- **File Upload Validation**: Validación de tipo y tamaño de archivos
- **Soft Delete**: Eliminación lógica para mantener integridad
- **UUID Tokens**: Tokens únicos para confirmación/cancelación

## Sistema de Email

### Configuración
- **Ethereal Email**: Sandbox para desarrollo y testing
- **Nodemailer**: Librería para envío de emails
- **Plantillas HTML**: Emails multipart con botones estilizados
- **Logging**: Registro completo de envíos en base de datos

### Tipos de Email
- **Confirmación de Reserva**: Email con botones HTML para confirmar/cancelar
- **Recordatorios**: Email automático 24h antes con botón de cancelación
- **Formato Localizado**: Fechas en formato español

### Características Técnicas
- **Multipart**: Versión texto + HTML
- **CSS Inline**: Máxima compatibilidad con clientes de email
- **Tablas HTML**: Compatibilidad con Outlook
- **Tokens Seguros**: URLs únicas para confirmación/cancelación
- **Logging**: Registro de estado y errores en `email_logs`

## Personalización del Negocio

### Campos Configurables
- **Logo**: Upload de archivo de imagen
- **Colores**: Primario, secundario y acento
- **Descripción**: Texto completo del negocio
- **Contacto**: WhatsApp y sitio web
- **Configuración**: Antelación mínima y tiempo de confirmación

### Proceso de Upload
1. **Selección de Archivo**: Input file con validación
2. **Preview**: Vista previa en tiempo real
3. **Upload**: Subida al servidor con validación
4. **Storage**: Guardado local con URL única
5. **Actualización**: Actualización en base de datos

## Estados de las Citas

- **pendiente**: Cita creada pero no confirmada
- **confirmada**: Cita confirmada por el cliente
- **completada**: Cita realizada con éxito
- **cancelada**: Cita cancelada
- **no_show**: Cliente no asistió

## Sistema de Recordatorios

- **Automático**: Envío 24 horas antes de la cita
- **Margen**: ±5 minutos para asegurar entrega
- **HTML**: Botones de cancelación en el email
- **Logging**: Registro de envíos y errores
- **Configurable**: Activable/desactivable por entorno

## Despliegue

### Desarrollo
```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm start
```

### Producción
```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build
```

## Contribución

1. Fork del repositorio
2. Crear feature branch
3. Commit de cambios
4. Push al branch
5. Pull Request
