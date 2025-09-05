import { Router } from 'express';
import laptopsData from '../resources/laptops.mjs';

const router = Router();

// Get all laptops
router.get('/', (req, res) => {
  res.render('laptops/index', { 
    title: 'Laptops Catalog',
    laptops: laptopsData 
  });
});

// Get laptop by ID
router.get('/:id', (req, res) => {
  const laptop = laptopsData.find(item => item.id === parseInt(req.params.id));
  if (!laptop) {
    return res.status(404).render('error', { 
      message: 'Laptop not found' 
    });
  }
  res.render('laptops/detail', { 
    title: laptop.brand,
    laptop 
  });
});

// Get available laptops only
router.get('/available', (req, res) => {
  const availableLaptops = laptopsData.filter(laptop => laptop.isAvailable);
  res.render('laptops/available', {
    title: 'Available Laptops',
    laptops: availableLaptops
  });
});

export default router;
