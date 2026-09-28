import { Router } from 'express';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} from '../controllers/blogController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAllBlogPosts);
router.get('/:slug', getBlogPostBySlug);
router.post('/', requireAdmin, createBlogPost);
router.put('/:id', requireAdmin, updateBlogPost);
router.delete('/:id', requireAdmin, deleteBlogPost);

export default router;
