const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const validateMedicineInput = ({ medicineName, amount, purchaseDate, purchasedBy }) => {
  if (!medicineName || String(medicineName).trim().length < 2) {
    return 'Medicine name is required and must be at least 2 characters long.';
  }

  if (amount === undefined || amount === null || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return 'Amount is required and must be greater than 0.';
  }

  if (!purchaseDate || !parseDate(purchaseDate)) {
    return 'Purchase date is required and must be a valid date.';
  }

  if (!purchasedBy || String(purchasedBy).trim().length === 0) {
    return 'Purchased by is required.';
  }

  return null;
};

const createMedicine = async (req, res) => {
  try {
    const { medicineName, amount, purchaseDate, purchasedBy, quantity, notes } = req.body;
    const validationError = validateMedicineInput({ medicineName, amount, purchaseDate, purchasedBy });

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const medicine = await prisma.medicine.create({
      data: {
        medicineName: String(medicineName).trim(),
        amount: Number(amount),
        purchaseDate: parseDate(purchaseDate),
        purchasedBy: String(purchasedBy).trim(),
        quantity: quantity ? String(quantity).trim() : null,
        notes: notes ? String(notes).trim() : null
      }
    });

    return res.status(201).json({ success: true, message: 'Medicine saved successfully', data: medicine });
  } catch (error) {
    console.error('Create medicine error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllMedicines = async (req, res) => {
  try {
    const { search, startDate, endDate, sort, quickFilter } = req.query;
    const filters = [];

    if (search) {
      filters.push({
        OR: [
          { medicineName: { contains: search, mode: 'insensitive' } },
          { purchasedBy: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    const dateRange = getDateRange({ quickFilter, startDate, endDate });
    if (dateRange) {
      filters.push({ purchaseDate: { gte: dateRange.start, lte: dateRange.end } });
    }

    const where = filters.length > 0 ? { AND: filters } : {};

    let orderBy = { purchaseDate: 'desc' };
    switch (sort) {
      case 'oldest':
        orderBy = { purchaseDate: 'asc' };
        break;
      case 'highest':
        orderBy = { amount: 'desc' };
        break;
      case 'lowest':
        orderBy = { amount: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { purchaseDate: 'desc' };
    }

    const medicines = await prisma.medicine.findMany({
      where,
      orderBy,
      select: {
        id: true,
        medicineName: true,
        amount: true,
        purchaseDate: true,
        purchasedBy: true,
        quantity: true,
        notes: true,
        createdAt: true
      }
    });

    return res.status(200).json({ success: true, data: medicines });
  } catch (error) {
    console.error('Get all medicines error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getMedicineById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid medicine ID.' });
    }

    const medicine = await prisma.medicine.findUnique({ where: { id } });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine record not found.' });
    }

    return res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    console.error('Get medicine by id error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid medicine ID.' });
    }

    const existing = await prisma.medicine.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Medicine record not found.' });
    }

    const { medicineName, amount, purchaseDate, purchasedBy, quantity, notes } = req.body;
    const validationError = validateMedicineInput({
      medicineName: medicineName ?? existing.medicineName,
      amount: amount ?? existing.amount,
      purchaseDate: purchaseDate ?? existing.purchaseDate,
      purchasedBy: purchasedBy ?? existing.purchasedBy
    });

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const updatedMedicine = await prisma.medicine.update({
      where: { id },
      data: {
        medicineName: String(medicineName ?? existing.medicineName).trim(),
        amount: Number(amount ?? existing.amount),
        purchaseDate: parseDate(purchaseDate ?? existing.purchaseDate),
        purchasedBy: String(purchasedBy ?? existing.purchasedBy).trim(),
        quantity: quantity !== undefined ? (quantity ? String(quantity).trim() : null) : existing.quantity,
        notes: notes !== undefined ? (notes ? String(notes).trim() : null) : existing.notes
      }
    });

    return res.status(200).json({ success: true, message: 'Medicine updated successfully', data: updatedMedicine });
  } catch (error) {
    console.error('Update medicine error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid medicine ID.' });
    }

    const existing = await prisma.medicine.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Medicine record not found.' });
    }

    await prisma.medicine.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getDateRange = ({ quickFilter, startDate, endDate }) => {
  if (startDate && endDate) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) return null;
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  switch (quickFilter) {
    case 'today':
      return { start: todayStart, end: todayEnd };
    case 'yesterday': {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 1);
      const end = new Date(todayEnd);
      end.setDate(end.getDate() - 1);
      return { start, end };
    }
    case 'last7': {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 6);
      return { start, end: todayEnd };
    }
    case 'last30': {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 29);
      return { start, end: todayEnd };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: todayEnd };
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    default:
      return null;
  }
};

const getMedicineSummary = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const thisMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    const totalSummary = await prisma.medicine.aggregate({
      _sum: { amount: true },
      _count: { id: true }
    });

    const todaySummary = await prisma.medicine.aggregate({
      _sum: { amount: true },
      where: { purchaseDate: { gte: todayStart, lte: todayEnd } }
    });

    const thisMonthSummary = await prisma.medicine.aggregate({
      _sum: { amount: true },
      where: { purchaseDate: { gte: thisMonthStart, lte: todayEnd } }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalMedicineExpense: totalSummary._sum.amount ? Number(totalSummary._sum.amount) : 0,
        totalPurchases: totalSummary._count.id || 0,
        todaysExpense: todaySummary._sum.amount ? Number(todaySummary._sum.amount) : 0,
        thisMonthExpense: thisMonthSummary._sum.amount ? Number(thisMonthSummary._sum.amount) : 0
      }
    });
  } catch (error) {
    console.error('Get medicine summary error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getMedicineSummary
};
