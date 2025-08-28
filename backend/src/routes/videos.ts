import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../../frontend/public/videos');
const cprDir = path.join(uploadDir, 'cpr');
const heimlichDir = path.join(uploadDir, 'heimlich');

// 创建目录（如果不存在）
[uploadDir, cprDir, heimlichDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || req.params.category;
    let destPath = uploadDir;
    
    if (category === 'cpr') {
      destPath = cprDir;
    } else if (category === 'heimlich') {
      destPath = heimlichDir;
    }
    
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    // 使用原始文件名或从请求体中获取
    const filename = req.body.filename || file.originalname;
    cb(null, filename);
  }
});

// 文件过滤器
const fileFilter = (req: any, file: any, cb: any) => {
  // 只允许视频文件
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

// 配置multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB限制
  }
});

// 获取所有视频列表
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const videos: any = {
      cpr: [],
      heimlich: []
    };

    // 读取CPR视频
    if (fs.existsSync(cprDir)) {
      const cprFiles = fs.readdirSync(cprDir).filter(file => 
        file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.ogg')
      );
      videos.cpr = cprFiles.map(file => ({
        filename: file,
        path: `/videos/cpr/${file}`,
        size: fs.statSync(path.join(cprDir, file)).size,
        lastModified: fs.statSync(path.join(cprDir, file)).mtime
      }));
    }

    // 读取海姆立克视频
    if (fs.existsSync(heimlichDir)) {
      const heimlichFiles = fs.readdirSync(heimlichDir).filter(file => 
        file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.ogg')
      );
      videos.heimlich = heimlichFiles.map(file => ({
        filename: file,
        path: `/videos/heimlich/${file}`,
        size: fs.statSync(path.join(heimlichDir, file)).size,
        lastModified: fs.statSync(path.join(heimlichDir, file)).mtime
      }));
    }

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos'
    });
  }
});

// 上传视频
router.post('/upload/:category', authenticateToken, requireAdmin, upload.single('video'), (req, res) => {
  try {
    const { category } = req.params;
    const { filename: customFilename } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    if (!['cpr', 'heimlich'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be "cpr" or "heimlich"'
      });
    }

    // 如果提供了自定义文件名，重命名文件
    if (customFilename && customFilename !== req.file.filename) {
      const oldPath = req.file.path;
      const newPath = path.join(path.dirname(oldPath), customFilename);
      
      fs.renameSync(oldPath, newPath);
      
      res.json({
        success: true,
        message: 'Video uploaded successfully',
        data: {
          filename: customFilename,
          path: `/videos/${category}/${customFilename}`,
          size: req.file.size
        }
      });
    } else {
      res.json({
        success: true,
        message: 'Video uploaded successfully',
        data: {
          filename: req.file.filename,
          path: `/videos/${category}/${req.file.filename}`,
          size: req.file.size
        }
      });
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video'
    });
  }
});

// 删除视频
router.delete('/:category/:filename', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { category, filename } = req.params;

    if (!['cpr', 'heimlich'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const filePath = path.join(uploadDir, category, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video'
    });
  }
});

// 重命名视频
router.put('/:category/:filename', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { category, filename } = req.params;
    const { newFilename } = req.body;

    if (!['cpr', 'heimlich'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    if (!newFilename) {
      return res.status(400).json({
        success: false,
        message: 'New filename is required'
      });
    }

    const oldPath = path.join(uploadDir, category, filename);
    const newPath = path.join(uploadDir, category, newFilename);

    if (!fs.existsSync(oldPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    if (fs.existsSync(newPath)) {
      return res.status(400).json({
        success: false,
        message: 'A file with the new name already exists'
      });
    }

    fs.renameSync(oldPath, newPath);

    res.json({
      success: true,
      message: 'Video renamed successfully',
      data: {
        oldFilename: filename,
        newFilename,
        newPath: `/videos/${category}/${newFilename}`
      }
    });
  } catch (error) {
    console.error('Error renaming video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rename video'
    });
  }
});

export default router;