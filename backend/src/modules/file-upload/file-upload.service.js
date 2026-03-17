const { Inject, Injectable } = require('@nestjs/common');
const { MulterModule } = require('@nestjs/platform-express');
const path = require('path');
const fs = require('fs').promises;

@Injectable()
class FileUploadService {
  async createUploadsDir() {
    const uploadsDir = path.join(__dirname, '../../../uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }
  }
}

module.exports = { FileUploadService };
