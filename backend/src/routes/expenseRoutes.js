const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// Get all expenses with filtering
router.get('/', expenseController.getAllExpenses);

// Get expense statistics
router.get('/statistics', expenseController.getExpenseStatistics);

// Get expense report
router.get('/report', expenseController.getExpenseReport);

// Create new expense
router.post('/', expenseController.createExpense);

// Get expense by ID
router.get('/:id', expenseController.getExpenseById);

// Update expense
router.put('/:id', expenseController.updateExpense);

// Delete expense
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
