import { Router } from 'express';
import laptopRoutes from './laptopRoutes.mjs';

const router = Router();

// Home route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Electronics Store' 
  });
});

// Mount laptop routes
router.use('/laptops', laptopRoutes);

export default router;
