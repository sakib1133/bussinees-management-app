const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper: parse and validate the "days" query param
const parseDays = (days) => {
  const parsed = Number(days);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 365) {
    return null;
  }
  return parsed;
};

// Helper: build a stable local YYYY-MM-DD key from a Date
// (uses local time, not UTC, so dates near midnight don't shift
// across day boundaries for users in positive UTC offsets like IST)
const toDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Get complete financial report
exports.getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;

    if (
      (parsedStartDate && isNaN(parsedStartDate.getTime())) ||
      (parsedEndDate && isNaN(parsedEndDate.getTime()))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    // Extend endDate to the end of that calendar day so same-day
    // records aren't excluded by a midnight truncation, and so the
    // comparison below doesn't wrongly reject a startDate that falls
    // later the same day (e.g. startDate=...T12:00, endDate same day)
    if (parsedEndDate) {
      parsedEndDate.setHours(23, 59, 59, 999);
    }

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate must be before endDate',
      });
    }

    let dateFilter = {};
    if (parsedStartDate || parsedEndDate) {
      dateFilter.date = {};
      if (parsedStartDate) dateFilter.date.gte = parsedStartDate;
      if (parsedEndDate) dateFilter.date.lte = parsedEndDate;
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

    const totalSales = Number(salesData._sum.amount) || 0;
    const labourExpense = Number(labourData._sum.paidAmount) || 0;
    const medicineExpense = Number(medicineData._sum.amount) || 0;
    const otherExpenses = Number(expensesData._sum.amount) || 0;
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
    res.status(500).json({
      success: false,
      message: 'Error generating financial report',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

// Get sales trend data
exports.getSalesTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.userId;

    const parsedDays = parseDays(days);
    if (parsedDays === null) {
      return res.status(400).json({
        success: false,
        message: 'Invalid days value',
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parsedDays);
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
      const dateKey = toDateKey(sale.saleDate);
      if (!grouped[dateKey]) {
        grouped[dateKey] = 0;
      }
      grouped[dateKey] += Number(sale.amount);
    });

    const data = Object.entries(grouped).map(([date, amount]) => ({
      date,
      amount
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sales trend',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

// Get expense trend data
exports.getExpenseTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.userId;

    const parsedDays = parseDays(days);
    if (parsedDays === null) {
      return res.status(400).json({
        success: false,
        message: 'Invalid days value',
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parsedDays);
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
      const dateKey = toDateKey(payment.paymentDate);
      if (!grouped[dateKey]) {
        grouped[dateKey] = 0;
      }
      grouped[dateKey] += Number(payment.paidAmount);
    });

    medicines.forEach(medicine => {
      const dateKey = toDateKey(medicine.purchaseDate);
      if (!grouped[dateKey]) {
        grouped[dateKey] = 0;
      }
      grouped[dateKey] += Number(medicine.amount);
    });

    expenses.forEach(expense => {
      const dateKey = toDateKey(expense.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = 0;
      }
      grouped[dateKey] += Number(expense.amount);
    });

    const data = Object.entries(grouped).map(([date, amount]) => ({
      date,
      amount
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expense trend',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

// Get profit trend data
exports.getProfitTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.userId;

    const parsedDays = parseDays(days);
    if (parsedDays === null) {
      return res.status(400).json({
        success: false,
        message: 'Invalid days value',
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parsedDays);
    startDate.setHours(0, 0, 0, 0);

    // Get user's labour IDs
    const labours = await prisma.labour.findMany({
      where: { userId },
      select: { id: true }
    });

    const labourIds = labours.map(l => l.id);

    // Get sales
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

    // Get labour expenses
    let labourPayments = [];
    if (labourIds.length > 0) {
      labourPayments = await prisma.salaryRecord.findMany({
        where: {
          labourId: {
            in: labourIds
          },
          paymentDate: {
            gte: startDate
          }
        },
        orderBy: {
          paymentDate: 'asc'
        }
      });
    }

    // Get medicine expenses
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

    // Get other expenses
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

    // Calculate profit per day
    const salesByDate = {};
    const expensesByDate = {};

    sales.forEach(sale => {
      const dateKey = toDateKey(sale.saleDate);
      if (!salesByDate[dateKey]) salesByDate[dateKey] = 0;
      salesByDate[dateKey] += Number(sale.amount);
    });

    labourPayments.forEach(payment => {
      const dateKey = toDateKey(payment.paymentDate);
      if (!expensesByDate[dateKey]) expensesByDate[dateKey] = 0;
      expensesByDate[dateKey] += Number(payment.paidAmount);
    });

    medicines.forEach(medicine => {
      const dateKey = toDateKey(medicine.purchaseDate);
      if (!expensesByDate[dateKey]) expensesByDate[dateKey] = 0;
      expensesByDate[dateKey] += Number(medicine.amount);
    });

    expenses.forEach(expense => {
      const dateKey = toDateKey(expense.date);
      if (!expensesByDate[dateKey]) expensesByDate[dateKey] = 0;
      expensesByDate[dateKey] += Number(expense.amount);
    });

    const allDates = new Set([
      ...Object.keys(salesByDate),
      ...Object.keys(expensesByDate)
    ]);

    const data = Array.from(allDates)
      .sort()
      .map(date => ({
        date,
        profit: (salesByDate[date] || 0) - (expensesByDate[date] || 0)
      }));

    res.json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profit trend',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};