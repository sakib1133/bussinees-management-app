const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// Get complete financial report
router.get('/financial', reportController.getFinancialReport);

// Get sales trend
router.get('/sales-trend', reportController.getSalesTrend);

// Get expense trend
router.get('/expense-trend', reportController.getExpenseTrend);

// Get profit trend
router.get('/profit-trend', reportController.getProfitTrend);

// Get expense breakdown
router.get('/expense-breakdown', reportController.getExpenseBreakdown);

module.exports = router;
