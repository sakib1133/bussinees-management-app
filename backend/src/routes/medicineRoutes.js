const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getMedicineSummary
} = require('../controllers/medicineController');

router.post('/', auth, createMedicine);
router.get('/', auth, getAllMedicines);
router.get('/summary', auth, getMedicineSummary);
router.get('/:id', auth, getMedicineById);
router.put('/:id', auth, updateMedicine);
router.delete('/:id', auth, deleteMedicine);

module.exports = router;
