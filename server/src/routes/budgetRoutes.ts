import { Router } from 'express';
import { getBudgets, updateBudget } from '../controllers/budgetController';

const router = Router();

router.get('/', getBudgets);
router.put('/', updateBudget);

export default router;
