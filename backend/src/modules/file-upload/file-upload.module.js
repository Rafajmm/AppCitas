const { Module } = require('@nestjs/common');
const { MulterModule } = require('@nestjs/platform-express');
const { FileUploadService } = require('./file-upload.service');

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        cb(null, allowedTypes.includes(file.mimetype));
      },
    }),
  ],
  providers: [FileUploadService],
  exports: [MulterModule],
})
module.exports = { FileUploadModule };
