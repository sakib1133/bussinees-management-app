const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all expenses with optional filtering
exports.getAllExpenses = async (req, res) => {
  try {
    const { type, startDate, endDate, search } = req.query;
    
    let where = {};
    
    if (type) {
      where.expenseType = type;
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }
    
    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: {
        date: 'desc'
      }
    });
    
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get expense statistics
exports.getExpenseStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(today.getDate() + 1);
    
    const monthStart = new Date(today);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    // Total expenses
    let totalWhere = {};
    if (startDate || endDate) {
      totalWhere.date = {};
      if (startDate) totalWhere.date.gte = new Date(startDate);
      if (endDate) totalWhere.date.lte = new Date(endDate);
    }
    
    const totalExpenses = await prisma.expense.aggregate({
      where: totalWhere,
      _sum: {
        amount: true
      }
    });
    
    // Today's expenses
    const todayExpenses = await prisma.expense.aggregate({
      where: {
        date: {
          gte: today,
          lt: tomorrowStart
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Month's expenses
    const monthExpenses = await prisma.expense.aggregate({
      where: {
        date: {
          gte: monthStart
        }
      },
      _sum: {
        amount: true
      }
    });
    
    res.json({
      totalExpenses: totalExpenses._sum.amount || 0,
      todayExpenses: todayExpenses._sum.amount || 0,
      monthExpenses: monthExpenses._sum.amount || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    const { expenseType, amount, description, date } = req.body;
    
    if (!expenseType || !amount || !date) {
      return res.status(400).json({ error: 'expenseType, amount, and date are required' });
    }
    
    const expense = await prisma.expense.create({
      data: {
        expenseType,
        amount: parseFloat(amount),
        description,
        date: new Date(date)
      }
    });
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await prisma.expense.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { expenseType, amount, description, date } = req.body;
    
    const expense = await prisma.expense.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(expenseType && { expenseType }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) })
      }
    });
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.expense.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get expenses for report (summary by type)
exports.getExpenseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let where = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    const expensesByType = await prisma.expense.groupBy({
      by: ['expenseType'],
      where,
      _sum: {
        amount: true
      }
    });
    
    const report = expensesByType.map(item => ({
      type: item.expenseType,
      total: item._sum.amount || 0
    }));
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
