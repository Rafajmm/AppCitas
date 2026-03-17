---
name: nestjs-expert
description: Creates and configures NestJS modules, controllers, services, DTOs, guards, and interceptors for AppCitas multi-tenant booking system. Use when building NestJS REST APIs for booking management, implementing dependency injection, scaffolding modular architecture, adding JWT/Passport authentication, integrating PostgreSQL with custom repositories, or working with .module.js, .controller.js, and .service.js files in CommonJS format. Invoke for guards, interceptors, pipes, validation, email services, and unit/E2E testing in AppCitas NestJS projects.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.2.0-appcitas"
  domain: backend
  triggers: NestJS, Nest, Node.js backend, TypeScript backend, dependency injection, controller, service, module, guard, interceptor
  role: specialist
  scope: implementation
  output-format: code
  related-skills: fullstack-guardian, test-master, devops-engineer
---

# NestJS Expert for AppCitas

Senior NestJS specialist with deep expertise in AppCitas multi-tenant booking system, PostgreSQL integration, and CommonJS module structure.

## Core Workflow for AppCitas

1. **Analyze requirements** — Identify modules, endpoints, entities, and relationships for booking system
2. **Design structure** — Plan module organization with DbModule dependencies and multi-tenant architecture
3. **Implement** — Create modules, services, and controllers with proper DI wiring using CommonJS
4. **Secure** — Add guards, validation pipes, and JWT authentication for role-based access
5. **Verify** — Confirm module registration and DI dependencies
6. **Test** — Write unit tests for services and integration tests for booking flows

## AppCitas-Specific Patterns

### Module Structure (CommonJS)
```javascript
// module-name.module.js
const { Module } = require('@nestjs/common');
const { DbModule } = require('../db/db.module');
const { ControllerName } = require('./controller-name.controller');
const { ServiceName } = require('./service-name.service');
const { RepositoryName } = require('./repository-name.repository');

class ModuleName {}

Module({
  imports: [DbModule], // Always import DbModule for database access
  controllers: [ControllerName],
  providers: [ServiceName, RepositoryName],
})(ModuleName);

module.exports = { ModuleName };
```

### Repository Pattern with DB_POOL
```javascript
// repository-name.repository.js
const { Inject, Injectable } = require('@nestjs/common');
const { DB_POOL } = require('../db/db.providers');

class RepositoryName {
  constructor(pool) {
    this.pool = pool;
  }

  async findById(id) {
    const { rows } = await this.pool.query(
      'SELECT * FROM table_name WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { rows } = await this.pool.query(
      'INSERT INTO table_name (field1, field2, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [data.field1, data.field2]
    );
    return rows[0];
  }
}

Injectable()(RepositoryName);
Inject(DB_POOL)(RepositoryName, undefined, 0);

module.exports = { RepositoryName };
```

### Service with Repository Injection
```javascript
// service-name.service.js
const { Injectable, NotFoundException, ConflictException } = require('@nestjs/common');
const { RepositoryName } = require('./repository-name.repository');

class ServiceName {
  constructor(repository) {
    this.repository = repository;
  }

  async create(createDto) {
    const existing = await this.repository.findByEmail(createDto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    
    const result = await this.repository.create(createDto);
    return result;
  }

  async findOne(id) {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }
}

Injectable()(ServiceName);
Inject(RepositoryName)(ServiceName, undefined, 0);

module.exports = { ServiceName };
```

### Controller with Express-style Routing
```javascript
// controller-name.controller.js
const { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } = require('@nestjs/common');
const { ServiceName } = require('./service-name.service');

class ControllerName {
  constructor(service) {
    this.service = service;
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto) {
    return this.service.create(createDto);
  }

  @Get(':id')
  async findOne(@Param('id') id) {
    return this.service.findOne(id);
  }
}

Inject(ServiceName)(ControllerName, undefined, 0);

module.exports = { ControllerName };
```

## AppCitas Database Patterns

### Multi-tenant Queries
```javascript
// Always include negocio_id in queries for multi-tenant isolation
async findByNegocio(negocioId) {
  const { rows } = await this.pool.query(
    'SELECT * FROM citas WHERE negocio_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC',
    [negocioId]
  );
  return rows;
}
```

### Time Handling for Bookings
```javascript
// Handle timezone consistently for booking times
async findBookingsByDate(negocioId, date) {
  const { rows } = await this.pool.query(
    `SELECT * FROM citas 
     WHERE negocio_id = $1 
       AND fecha = $2::date 
       AND deleted_at IS NULL
     ORDER BY hora_inicio`,
    [negocioId, date]
  );
  return rows;
}
```

### Soft Delete Pattern
```javascript
async softDelete(id) {
  const { rows } = await this.pool.query(
    'UPDATE table_name SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
    [id]
  );
  return rows[0] || null;
}
```

## AppCitas-Specific Constraints

### MUST DO for AppCitas
- Use CommonJS `require()` syntax instead of ES6 imports
- Always import `DbModule` for database access in modules
- Use `DB_POOL` injection for repositories, not TypeORM
- Include `deleted_at IS NULL` in all queries for soft deletes
- Include `negocio_id` in all queries for multi-tenant isolation
- Handle timezone consistently for booking dates and times
- Use UUID primary keys with `uuid_generate_v4()`
- Implement soft deletes with `deleted_at` timestamps
- Validate email formats and business slug uniqueness
- Use proper HTTP status codes (201 for creation, 404 for not found)

### MUST NOT DO for AppCitas
- Don't use TypeScript decorators with @ symbols (use CommonJS syntax)
- Don't import TypeORM repositories (use custom DB_POOL pattern)
- Don't hardcode business logic in controllers (delegate to services)
- Don't skip timezone handling for booking times
- Don't forget to include `negocio_id` in multi-tenant queries
- Don't use permanent DELETE queries (always use soft deletes)
- Don't expose internal database errors to clients

## AppCitas Module Examples

### Public Booking Module
```javascript
const { Module } = require('@nestjs/common');
const { DbModule } = require('../db/db.module');
const { EmailModule } = require('../email/email.module');
const { PublicController } = require('./public.controller');
const { PublicService } = require('./public.service');
const { PublicRepository } = require('./public.repository');

class PublicModule {}

Module({
  imports: [DbModule, EmailModule], // Import EmailModule for booking confirmations
  controllers: [PublicController],
  providers: [PublicService, PublicRepository],
})(PublicModule);

module.exports = { PublicModule };
```

### Admin Module Structure
```javascript
const { Module } = require('@nestjs/common');
const { DbModule } = require('../db/db.module');
const { AdminAuthController } = require('./auth/admin-auth.controller');
const { AdminAuthService } = require('./auth/admin-auth.service');
const { JwtAuthGuard } = require('./auth/jwt-auth.guard');

class AdminModule {}

Module({
  imports: [DbModule],
  controllers: [AdminAuthController, /* other controllers */],
  providers: [
    AdminAuthService,
    JwtAuthGuard,
    /* other services and repositories */
  ],
})(AdminModule);

module.exports = { AdminModule };
```

## Email Integration Pattern

### Service with Email Dependency
```javascript
const { Injectable } = require('@nestjs/common');
const { EmailService } = require('../email/email.service');

class BookingService {
  constructor(repository, emailService) {
    this.repository = repository;
    this.emailService = emailService;
  }

  async createBooking(bookingData) {
    const booking = await this.repository.create(bookingData);
    
    // Send confirmation email
    await this.emailService.sendBookingConfirmationEmail({
      negocio: bookingData.negocio,
      cita: booking,
      toEmail: bookingData.client.email
    });
    
    return booking;
  }
}

Injectable()(BookingService);
module.exports = { BookingService };
```

## Testing Pattern for AppCitas

### Unit Test with Mock Repository
```javascript
// service-name.service.spec.js
const { Test } = require('@nestjs/testing');
const { ServiceName } = require('./service-name.service');

describe('ServiceName', () => {
  let service;
  let mockRepository;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ServiceName,
        {
          provide: 'RepositoryName',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(ServiceName);
  });

  it('should create entity successfully', async () => {
    const createDto = { name: 'Test', email: 'test@example.com' };
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({ id: 'uuid', ...createDto });

    const result = await service.create(createDto);
    expect(result).toHaveProperty('id');
    expect(result.name).toBe(createDto.name);
  });
});
```

## Output Templates for AppCitas

When implementing a NestJS feature for AppCitas, provide in this order:
1. Module definition with DbModule import (`.module.js`)
2. Repository with DB_POOL injection (`.repository.js`)
3. Service with repository injection (`.service.js`)
4. Controller with service injection (`.controller.js`)
5. Validation schemas if needed (`.schemas.js`)
6. Guards if authentication needed (`.guard.js`)
7. Unit tests for service methods (`.service.spec.js`)

## Knowledge Reference

NestJS (CommonJS), PostgreSQL, UUIDs, Multi-tenant architecture, JWT authentication, Email services, Soft deletes, Timezone handling, Booking systems, CommonJS modules, Dependency injection, Repository pattern, Express-style routing
