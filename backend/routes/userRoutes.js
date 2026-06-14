import express from 'express';
import { getUserProfile, updateAddress, rechargeWallet } from '../controllers/userController.js';

const router = express.Router();

router.get('/:id/profile', getUserProfile);
router.put('/:id/address', updateAddress);
router.post('/:id/wallet', rechargeWallet);

export default router;
