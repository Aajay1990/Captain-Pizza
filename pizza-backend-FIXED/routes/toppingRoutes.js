import express from 'express';
import { getToppings, createTopping, updateTopping, deleteTopping } from '../controllers/toppingController.js';

const router = express.Router();

router.get('/', getToppings);
router.post('/', createTopping);
router.put('/:id', updateTopping);
router.delete('/:id', deleteTopping);

export default router;
