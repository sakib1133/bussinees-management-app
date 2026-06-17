const express = require('express');
const router = express.Router();
const {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale
} = require('../controllers/salesController');
const auth = require('../middlewares/auth');

// All routes are protected with JWT
router.post('/', auth, createSale);
router.get('/', auth, getAllSales);
router.get('/:id', auth, getSaleById);
router.put('/:id', auth, updateSale);
router.delete('/:id', auth, deleteSale);

module.exports = router;
