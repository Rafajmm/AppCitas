# AppCitas - Sistema de Reservas y Gestion de Citas

Una aplicacion completa para la gestion de reservas y citas disenada para negocios de servicios. Permite a los clientes reservar servicios online y a los administradores gestionar su agenda, personalizar su negocio y confirmar citas a traves de correo de confirmacion. La aplicacion esta administrada por un superadmin que puede crear y gestionar multiples negocios.

## Caracteristicas Principales

### Gestion de Negocios
- **Panel de Superadministrador**: Creacion y gestion de multiples negocios
- **Panel de Administracion**: Gestion completa del negocio
- **Personalizacion de Marca**: Logo, colores y descripcion personalizable
- **Configuracion de Contacto**: WhatsApp, sitio web y datos de contacto
- **Gestion de Disponibilidad**: Control de horarios y bloqueos

### Sistema de Reservas
- **Calendario Interactivo**: Visualizacion de disponibilidad en tiempo real
- **Seleccion de Servicios**: Multiples servicios por cita
- **Asignacion de Empleados**: Seleccion de profesional especifico
- **Confirmacion por Email**: Sistema de confirmacion automatica

### Gestion de Personal
- **Empleados**: Alta, baja y gestion de profesionales
- **Asignacion de Servicios**: Configuracion de servicios por empleado
- **Horarios Personalizados**: Horarios individuales por empleado

### Personalizacion Avanzada
- **Upload de Logo**: Subida de archivos de imagen (JPEG, PNG, GIF, WebP)
- **Colores de Marca**: Selector de colores primario, secundario y acento
- **Descripcion del Negocio**: Campo de texto completo para descripcion
- **Vista Previa**: Preview en tiempo real de cambios

## Stack Tecnologico

### Backend
- **NestJS**: Framework Node.js para el backend
- **PostgreSQL**: Base de datos relacional
- **JWT**: Autenticacion y autorizacion
- **Nodemailer**: Envio de emails con Ethereal Email (para las pruebas de desarrollo)
- **Multer**: Gestion de subida de archivos para los logos de los negocios

### Frontend
- **React**: Biblioteca JavaScript para UI
- **React Router**: Navegacion y routing
- **Bootstrap**: Framework CSS para diseno responsive
- **React Bootstrap**: Componentes Bootstrap para React

### Base de Datos
- **PostgreSQL**: Sistema de gestion de bases de datos
- **UUID**: Identificadores unicos para entidades
- **Timestamps**: Control de creacion y actualizacion

## Funcionalidades Detalladas

### Sistema de Autenticacion
- Login de administradores con JWT
- Roles de usuario (superadmin, admin)
- Rutas protegidas en el panel de administracion
- Manejo de sesiones y tokens

### Gestion de Servicios
- CRUD completo de servicios
- Configuracion de precios y duracion
- Activacion/Desactivacion de servicios
- Asignacion a empleados especificos

### Gestion de Horarios
- Configuracion de horarios por negocio
- Horarios individuales por empleado
- Dias laborables y horarios de apertura/cierre
- Validacion de disponibilidad

### Sistema de Bloqueos
- Bloqueos por dia completo
- Bloqueos por rangos horarios
- Bloqueos por empleado especifico
- Gestion de unavailable times

### Sistema de Email
- Envio de emails de confirmacion
- Tokens unicos de confirmacion
- Plantillas de email personalizables
- Integracion con Ethereal Email para desarrollo

### Sistema de Upload
- Subida de logos de negocio
- Validacion de tipo y tamano de archivo
- Almacenamiento local con URLs unicas
- Serving de archivos estaticos

### Panel de Administracion
- Dashboard con estadisticas
- Gestion de citas y reservas
- Vista de calendario y disponibilidad
- Configuracion del negocio

## Instalacion y Configuracion

### Prerrequisitos
- Node.js 18+
- PostgreSQL 13+
- npm o yarn

### Configuracion del Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run start:dev
```

### Configuracion del Frontend
```bash
cd frontend
npm install
npm start
```

### Configuracion de la Base de Datos
```bash
# Crear base de datos
createdb AppCitas

# Ejecutar script de creacion
psql -d AppCitas -f scriptBD.sql

# Ejecutar seed de datos (opcional)
psql -d AppCitas -f seed.sql
```

## Estructura del Proyecto

```
AppCitas/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── admin/
│   │   │   ├── public/
│   │   │   ├── email/
│   │   │   └── db/
│   │   └── main.js
│   ├── uploads/
│   │   └── logos/
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── public/
│   │   ├── services/
│   │   ├── contexts/
│   │   └── components/
│   └── package.json
├── scriptBD.sql
└── README.md
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
JWT_EXPIRES_IN=24h

# Servidor
PORT=3001

# Email (Ethereal Email)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=tu_correo_ethereal
SMTP_PASS=tu_password_ethereal
SMTP_SECURE=tls
SMTP_FROM=noreply@appcitas.local

# URL de la aplicacion
APP_BASE_URL=http://localhost:3001
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001
```

## API Endpoints

### Rutas Publicas
- `GET /public/negocios` - Listar negocios
- `GET /public/:slug` - Detalles de negocio
- `GET /public/:slug/servicios` - Servicios de negocio
- `GET /public/:slug/availability` - Disponibilidad
- `POST /public/:slug/bookings` - Crear reserva
- `POST /public/confirm/:token` - Confirmar reserva

### Rutas de Administracion
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
- `GET /admin/bloqueos` - Listar bloqueos
- `POST /admin/bloqueos` - Crear bloqueo
- `DELETE /admin/bloqueos/:id` - Eliminar bloqueo
- `GET /admin/citas` - Listar citas
- `PATCH /admin/citas/:id` - Actualizar cita

## Flujo de Usuario

### Cliente
1. **Explorar Negocios**: Lista de negocios disponibles
2. **Ver Detalles**: Informacion completa del negocio y servicios
3. **Seleccionar Servicios**: Eleccion de uno o multiples servicios
4. **Elegir Fecha/Hora**: Seleccion de disponibilidad en calendario
5. **Completar Reserva**: Datos de contacto y confirmacion
6. **Recibir Email**: Email con enlace de confirmacion
7. **Confirmar Cita**: Clic en enlace para confirmar reserva

### Administrador
1. **Login**: Acceso al panel de administracion
2. **Dashboard**: Vista general de estadisticas
3. **Gestion de Servicios**: CRUD de servicios y precios
4. **Gestion de Empleados**: Alta y configuracion de personal
5. **Configuracion de Horarios**: Definir disponibilidad
6. **Gestion de Bloqueos**: Bloquear dias/horas no disponibles
7. **Personalizacion**: Logo, colores y descripcion del negocio
8. **Gestion de Citas**: Ver y gestionar reservas confirmadas

## Seguridad

- **JWT Tokens**: Autenticacion segura con tokens expirables
- **Validacion de Inputs**: Sanitizacion y validacion con Joi
- **Proteccion de Rutas**: Middleware de autenticacion
- **CORS**: Configuracion de origenes permitidos
- **File Upload Validation**: Validacion de tipo y tamano de archivos

## Sistema de Email

### Configuracion
- **Mailtrap**: Sandbox para desarrollo y testing
- **Nodemailer**: Libreria para envio de emails
- **Templates**: Plantillas HTML para emails

### Tipos de Email
- **Confirmacion de Reserva**: Email con token de confirmacion
- **Recordatorios**: (Futuro) Emails de recordatorio de cita

## Personalizacion del Negocio

### Campos Configurables
- **Logo**: Upload de archivo de imagen
- **Colores**: Primario, secundario y acento
- **Descripcion**: Texto completo del negocio
- **Contacto**: WhatsApp y sitio web
- **Configuracion**: Antelacion minima y tiempo de confirmacion

### Proceso de Upload
1. **Seleccion de Archivo**: Input file con validacion
2. **Preview**: Vista previa en tiempo real
3. **Upload**: Subida al servidor con validacion
4. **Storage**: Guardado local con URL unica
5. **Actualizacion**: Actualizacion en base de datos

## Estados de las Citas

- **pendiente**: Cita creada pero no confirmada
- **confirmada**: Cita confirmada por el cliente
- **completada**: Cita realizada con exito
- **cancelada**: Cita cancelada
- **no_show**: Cliente no asistio

## Despliegue

### Desarrollo
```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm start
```

### Produccion
```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build
```

## Contribucion

1. Fork del repositorio
2. Crear feature branch
3. Commit de cambios
4. Push al branch
5. Pull Request

## Licencia

MIT License - Ver archivo LICENSE para detalles

## Soporte

Para reportar issues o solicitar ayuda:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**AppCitas** - Simplificando la gestion de reservas para tu negocio
