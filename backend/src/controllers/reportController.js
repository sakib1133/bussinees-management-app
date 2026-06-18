const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get complete financial report
exports.getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.gte = new Date(startDate);
      if (endDate) dateFilter.date.lte = new Date(endDate);
    }
    
    // Get total sales
    const salesData = await prisma.sale.aggregate({
      where: { 
        userId,
        ...(dateFilter.date ? { saleDate: dateFilter.date } : {})
      },
      _sum: { amount: true }
    });
    
    // Get labour for this user
    const labours = await prisma.labour.findMany({
      where: { userId },
      select: { id: true }
    });
    const labourIds = labours.map(l => l.id);

    // Get labour expenses
    let labourData = { _sum: { paidAmount: null } };
    if (labourIds.length > 0) {
      labourData = await prisma.salaryRecord.aggregate({
        where: {
          labourId: { in: labourIds },
          ...(dateFilter.date ? { paymentDate: dateFilter.date } : {})
        },
        _sum: { paidAmount: true }
      });
    }
    
    // Get medicine expenses
    const medicineData = await prisma.medicine.aggregate({
      where: {
        userId,
        ...(dateFilter.date ? { purchaseDate: dateFilter.date } : {})
      },
      _sum: { amount: true }
    });
    
    // Get other expenses
    const expensesData = await prisma.expense.aggregate({
      where: {
        userId,
        ...(dateFilter.date ? { date: dateFilter.date } : {})
      },
      _sum: { amount: true }
    });
    
    const totalSales = salesData._sum.amount || 0;
    const labourExpense = labourData._sum.paidAmount || 0;
    const medicineExpense = medicineData._sum.amount || 0;
    const otherExpenses = expensesData._sum.amount || 0;
    const totalExpenses = labourExpense + medicineExpense + otherExpenses;
    const netProfit = totalSales - totalExpenses;
    
    res.json({
      totalSales,
      labourExpense,
      medicineExpense,
      otherExpenses,
      totalExpenses,
      netProfit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get sales trend data
exports.getSalesTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.userId;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);
    
    const sales = await prisma.sale.findMany({
      where: {
        userId,
        saleDate: {
          gte: startDate
        }
      },
      orderBy: {
        saleDate: 'asc'
      }
    });
    
    // Group by date
    const grouped = {};
    sales.forEach(sale => {
      const dateKey = new Date(sale.saleDate).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = 0;
      }
      grouped[dateKey] += sale.amount;
    });
    
    const data = Object.entries(grouped).map(([date, amount]) => ({
      date,
      amount
    }));
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get expense trend data
exports.getExpenseTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.userId;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);
    
    // Get user's labour IDs for salary records
    const labours = await prisma.labour.findMany({
      where: { userId },
      select: { id: true }
    });
    const labourIds = labours.map(l => l.id);

    // Get all three types of expenses
    let labourPayments = [];
    if (labourIds.length > 0) {
      labourPayments = await prisma.salaryRecord.findMany({
        where: {
          labourId: { in: labourIds },
          paymentDate: {
            gte: startDate
          }
        },
        orderBy: {
          paymentDate: 'asc'
        }
      });
    }
    
    const medicines = await prisma.medicine.findMany({
      where: {
        userId,
        purchaseDate: {
          gte: startDate
        }
      },
      orderBy: {
        purchaseDate: 'asc'
      }
    });
    
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Combine and group by date
    const grouped = {};
    
    labourPayments.forEach(payment => {
      const dateKey = new Date(payment.paymentDate).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = 0;
      }
      grouped[dateKey] += payment.paidAmount;
    });
    
    medicines.forEach(medicine => {
      const dateKey = new Date(medicine.purchaseDate).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = 0;
      }
      grouped[dateKey] += medicine.amount;
    });
    
    expenses.forEach(expense => {
      const dateKey = new Date(expense.date).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = 0;
      }
      grouped[dateKey] += expense.amount;
    });
    
    const data = Object.entries(grouped).map(([date, amount]) => ({
      date,
      amount
    }));
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get profit trend data
exports.getProfitTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);
    
    // Get sales
    const sales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: startDate
        }
      },
      orderBy: {
        saleDate: 'asc'
      }
    });
    
    // Get all expenses
    const labourPayments = await prisma.salaryRecord.findMany({
      where: {
        paymentDate: {
          gte: startDate
        }
      },
      orderBy: {
        paymentDate: 'asc'
      }
    });
    
    const medicines = await prisma.medicine.findMany({
      where: {
        purchaseDate: {
          gte: startDate
        }
      },
      orderBy: {
        purchaseDate: 'asc'
      }
    });
    
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Calculate profit per day
    const salesByDate = {};
    const expensesByDate = {};
    
    sales.forEach(sale => {
      const dateKey = new Date(sale.saleDate).toISOString().split('T')[0];
      if (!salesByDate[dateKey]) salesByDate[dateKey] = 0;
      salesByDate[dateKey] += sale.amount;
    });
    
    labourPayments.forEach(payment => {
      const dateKey = new Date(payment.paymentDate).toISOString().split('T')[0];
      if (!expensesByDate[dateKey]) expensesByDate[dateKey] = 0;
      expensesByDate[dateKey] += payment.paidAmount;
    });
    
    medicines.forEach(medicine => {
      const dateKey = new Date(medicine.purchaseDate).toISOString().split('T')[0];
      if (!expensesByDate[dateKey]) expensesByDate[dateKey] = 0;
      expensesByDate[dateKey] += medicine.amount;
    });
    
    expenses.forEach(expense => {
      const dateKey = new Date(expense.date).toISOString().split('T')[0];
      if (!expensesByDate[dateKey]) expensesByDate[dateKey] = 0;
      expensesByDate[dateKey] += expense.amount;
    });
    
    const allDates = new Set([...Object.keys(salesByDate), ...Object.keys(expensesByDate)]);
    const data = Array.from(allDates)
      .sort()
      .map(date => ({
        date,
        profit: (salesByDate[date] || 0) - (expensesByDate[date] || 0)
      }));
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get expense breakdown
exports.getExpenseBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.gte = new Date(startDate);
      if (endDate) dateFilter.date.lte = new Date(endDate);
    }
    
    // Get expense report by type
    const expensesByType = await prisma.expense.groupBy({
      by: ['expenseType'],
      where: dateFilter.date ? { date: dateFilter.date } : {},
      _sum: { amount: true }
    });
    
    const breakdown = expensesByType.map(item => ({
      type: item.expenseType,
      amount: item._sum.amount || 0
    }));
    
    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
