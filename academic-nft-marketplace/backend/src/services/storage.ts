import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const s3 = new AWS.S3();

// File type validation
const allowedFileTypes = {
  documents: ['.pdf', '.doc', '.docx', '.txt'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  all: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

const fileFilter = (allowedTypes: string[]) => {
  return (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  };
};

// S3 upload configuration
const createS3Upload = (folder: string, allowedTypes: string[]) => {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET || 'academic-nft-uploads',
      key: (req, file, cb) => {
        const uniqueName = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: (req, file, cb) => {
        cb(null, {
          fieldName: file.fieldname,
          originalName: file.originalname,
          uploadedBy: req.user?.id || 'anonymous',
          uploadedAt: new Date().toISOString(),
        });
      },
    }),
    fileFilter: fileFilter(allowedTypes),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });
};

// Local storage fallback (for development)
const createLocalUpload = (folder: string, allowedTypes: string[]) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, `uploads/${folder}`);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: fileFilter(allowedTypes),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });
};

// Export upload middleware
export const uploadAchievementProof = process.env.AWS_S3_BUCKET
  ? createS3Upload('achievements', allowedFileTypes.all)
  : createLocalUpload('achievements', allowedFileTypes.all);

export const uploadProfileImage = process.env.AWS_S3_BUCKET
  ? createS3Upload('profiles', allowedFileTypes.images)
  : createLocalUpload('profiles', allowedFileTypes.images);

export const uploadCompanyLogo = process.env.AWS_S3_BUCKET
  ? createS3Upload('companies', allowedFileTypes.images)
  : createLocalUpload('companies', allowedFileTypes.images);

// File deletion service
export const deleteFile = async (fileUrl: string): Promise<boolean> => {
  try {
    if (process.env.AWS_S3_BUCKET && fileUrl.includes('amazonaws.com')) {
      // Extract key from S3 URL
      const key = fileUrl.split('/').slice(-2).join('/');
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      }).promise();
      return true;
    } else {
      // Local file deletion
      const fs = require('fs').promises;
      const localPath = fileUrl.replace(process.env.BACKEND_URL || 'http://localhost:3001', '.');
      await fs.unlink(localPath);
      return true;
    }
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
};

// Generate signed URLs for private files
export const generateSignedUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  if (!process.env.AWS_S3_BUCKET) {
    return `${process.env.BACKEND_URL}/uploads/${key}`;
  }

  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn,
    });
    return url;
  } catch (error) {
    console.error('Signed URL generation error:', error);
    throw new Error('Failed to generate file access URL');
  }
};