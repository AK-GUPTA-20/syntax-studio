import { Router } from 'express';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} from '../controllers/blogController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import {
  validateBlogPostInput,
  validateBlogIdParam,
  validateBlogSlugParam
} from '../validators/blogValidator.js';

const router = Router();

router.get('/', getAllBlogPosts);
router.get('/:slug', validateBlogSlugParam, getBlogPostBySlug);

router.post('/', requireAdmin, validateBlogPostInput, createBlogPost);
router.put('/:id', requireAdmin, validateBlogIdParam, validateBlogPostInput, updateBlogPost);
router.delete('/:id', requireAdmin, validateBlogIdParam, deleteBlogPost);

export default router;
