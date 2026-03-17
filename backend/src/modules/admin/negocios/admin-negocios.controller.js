const { Controller, Get, Patch, Post, UseInterceptors, UploadedFile, Req, Inject, UseGuards, BadRequestException } = require('@nestjs/common');
const { FileInterceptor } = require('@nestjs/platform-express');
const { JwtAuthGuard } = require('../auth/jwt-auth.guard');
const { AdminNegociosService } = require('./admin-negocios.service');
const { patchNegocioSchema, uuidV4 } = require('./admin-negocios.schemas');
const path = require('path');
const fs = require('fs').promises;

class AdminNegociosController {
  constructor(service) {
    this.service = service;
  }

  async list(req) {
    return await this.service.listMyNegocios(req.user.adminId);
  }

  async patch(req) {
    const negocioId = req.params.negocioId;
    const { error: idErr } = uuidV4.required().validate(negocioId);
    if (idErr) throw new BadRequestException(['Invalid negocioId']);

    const { value, error } = patchNegocioSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.updateMyNegocio(req.user.adminId, negocioId, value);
  }

  async uploadLogo(req) {
    const file = req.file;
    const negocioId = req.params.negocioId;
    
    if (!file) {
      throw new BadRequestException(['No file uploaded']);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(['Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed']);
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new BadRequestException(['File too large. Maximum size is 2MB']);
    }

    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../../../uploads/logos');
      await fs.mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `logo-${negocioId}-${uniqueSuffix}${fileExtension}`;
      const filePath = path.join(uploadsDir, filename);

      // Save file
      await fs.writeFile(filePath, file.buffer);

      // Generate URL (in production, this should be your domain)
      const backendUrl = process.env.APP_BASE_URL || 'http://localhost:3001';
      const logoUrl = `${backendUrl}/uploads/logos/${filename}`;

      // Update negocio with new logo URL
      const { value } = patchNegocioSchema.validate({ logo_url: logoUrl }, { stripUnknown: true });
      const updated = await this.service.updateMyNegocio(req.user.adminId, negocioId, value);

      return { logoUrl, negocio: updated };
    } catch (error) {
      throw new BadRequestException(['Error uploading file: ' + error.message]);
    }
  }
}

Controller('admin/negocios')(AdminNegociosController);
UseGuards(JwtAuthGuard)(AdminNegociosController);
Inject(AdminNegociosService)(AdminNegociosController, undefined, 0);

Get('')(AdminNegociosController.prototype, 'list', Object.getOwnPropertyDescriptor(AdminNegociosController.prototype, 'list'));
Req()(AdminNegociosController.prototype, 'list', 0);

Patch(':negocioId')(AdminNegociosController.prototype, 'patch', Object.getOwnPropertyDescriptor(AdminNegociosController.prototype, 'patch'));
Req()(AdminNegociosController.prototype, 'patch', 0);

Post(':negocioId/upload-logo')(AdminNegociosController.prototype, 'uploadLogo', Object.getOwnPropertyDescriptor(AdminNegociosController.prototype, 'uploadLogo'));
UseInterceptors(FileInterceptor('logo'))(AdminNegociosController.prototype, 'uploadLogo', Object.getOwnPropertyDescriptor(AdminNegociosController.prototype, 'uploadLogo'));
Req()(AdminNegociosController.prototype, 'uploadLogo', 0);

module.exports = { AdminNegociosController };
