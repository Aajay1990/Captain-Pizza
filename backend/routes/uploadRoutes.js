import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        // Sanitize filename and add timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = file.originalname || 'upload.png';
        const ext = path.extname(originalName) || '.png';
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});

// File filter – allow only images
function checkFileType(req, file, cb) {
    try {
        fs.appendFileSync(path.join(__dirname, '../backend_errors.log'), `${new Date().toISOString()} - checkFileType received file metadata: ${JSON.stringify(file)} | keys: ${file ? Object.keys(file).join(', ') : 'none'}\n`);
    } catch {}

    if (!file) {
        return cb(new Error('No file provided!'));
    }

    const filetypes = /jpg|jpeg|png|webp/;
    const originalName = file.originalname || '';
    const fileMime = file.mimetype || '';

    const ext = path.extname(originalName).toLowerCase();
    const isExtValid = ext ? filetypes.test(ext) : true; // Fallback to true if no extension, relying on mime type
    const isMimeValid = fileMime ? filetypes.test(fileMime) : false;

    if (isExtValid && isMimeValid) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'));
    }
}

// Multer upload configuration with limits (optional)
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: checkFileType,
});

// Upload endpoint
router.post('/', (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            try {
                fs.appendFileSync(path.join(__dirname, '../backend_errors.log'), `${new Date().toISOString()} - UPLOAD ROUTE ERROR: ${err.stack || err.message || err}\n`);
            } catch {}
            // Handle multer errors
            if (err instanceof multer.MulterError) {
                // A Multer error occurred (e.g., file too large)
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            } else if (err) {
                // A custom error (e.g., from fileFilter)
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }
        }

        // If no file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        // Success response
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            image: `/uploads/${req.file.filename}`, // URL path for frontend
        });
    });
});

export default router;
