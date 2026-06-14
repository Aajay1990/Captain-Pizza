import express from 'express';
import {
    getMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateCategoryName
} from '../controllers/menuController.js';

const router = express.Router();

router.get('/', getMenu);
router.put('/category-rename', updateCategoryName);
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;
