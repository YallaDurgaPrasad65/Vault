const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 } // Default 50MB
});

// Protect all files routes
router.use(authenticateToken);

// GET /api/files - List user's files
router.get('/', (req, res) => {
    try {
        const files = db.prepare('SELECT id, original_name, mime_type, size, uploaded_at FROM files WHERE user_id = ? ORDER BY uploaded_at DESC').all(req.user.id);
        res.json(files);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/files/upload - Upload a file
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const stmt = db.prepare(`
            INSERT INTO files (user_id, original_name, stored_name, mime_type, size)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        const info = stmt.run(
            req.user.id,
            req.file.originalname,
            req.file.filename,
            req.file.mimetype,
            req.file.size
        );

        res.status(201).json({ 
            message: 'File uploaded successfully',
            file: {
                id: info.lastInsertRowid,
                original_name: req.file.originalname,
                mime_type: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during upload' });
    }
});

// GET /api/files/:id - Get file metadata
router.get('/:id', (req, res) => {
    try {
        const file = db.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
        if (!file) return res.status(404).json({ error: 'File not found' });
        res.json({ id: file.id, original_name: file.original_name, mime_type: file.mime_type, size: file.size, uploaded_at: file.uploaded_at });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/files/:id/download - Download file
router.get('/:id/download', (req, res) => {
    try {
        const file = db.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        const filePath = path.join(__dirname, '..', 'uploads', file.stored_name);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File missing on server' });
        }

        res.download(filePath, file.original_name);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/files/:id/preview - Preview file
router.get('/:id/preview', (req, res) => {
    try {
        const file = db.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        const filePath = path.join(__dirname, '..', 'uploads', file.stored_name);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File missing on server' });
        }

        res.sendFile(filePath);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/files/:id - Delete file
router.delete('/:id', (req, res) => {
    try {
        const file = db.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        // Delete from DB
        db.prepare('DELETE FROM files WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);

        // Delete from disk
        const filePath = path.join(__dirname, '..', 'uploads', file.stored_name);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
