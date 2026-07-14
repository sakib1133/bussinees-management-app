const { PrismaClient } = require("@prisma/client");
const rateLimit = require("express-rate-limit");
const prisma = new PrismaClient();

// Helper: validate positive integer IDs
const isValidId = (id) => {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0;
};

// Rate limiter for salary routes
exports.salaryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Create a new salary record
exports.createSalaryRecord = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      labourId,
      salaryAmount,
      periodFromDate,
      periodToDate,
      paymentDate,
      paidAmount,
      notes,
    } = req.body;

    // Validation
    if (!labourId || !isValidId(labourId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid labour ID",
      });
    }

    const salary = Number(salaryAmount);
    if (isNaN(salary) || salary <= 0) {
      return res.status(400).json({
        success: false,
        message: "Salary amount must be greater than 0",
      });
    }

    if (salary > 1000000000) {
      return res.status(400).json({
        success: false,
        message: "Salary amount too large",
      });
    }

    const paid = Number(paidAmount);
    if (isNaN(paid) || paid < 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot be negative",
      });
    }

    if (paid > salary) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot exceed salary amount",
      });
    }

    if (notes && notes.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Notes cannot exceed 1000 characters",
      });
    }

    const fromDate = new Date(periodFromDate);
    const toDate = new Date(periodToDate);
    const payDate = new Date(paymentDate);

    if (
      isNaN(fromDate.getTime()) ||
      isNaN(toDate.getTime()) ||
      isNaN(payDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (fromDate >= toDate) {
      return res.status(400).json({
        success: false,
        message: "From date must be before to date",
      });
    }

    // Check if labour exists
    const labour = await prisma.labour.findUnique({
      where: { id: parseInt(labourId) },
    });

    if (!labour || labour.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Labour not found",
      });
    }

    const salaryRecord = await prisma.$transaction(async (tx) => {
      return tx.salaryRecord.create({
        data: {
          labourId: parseInt(labourId),
          salaryAmount: salary,
          periodFromDate: fromDate,
          periodToDate: toDate,
          paymentDate: payDate,
          paidAmount: paid,
          notes: notes?.trim() || null,
        },
      });
    });

    res.status(201).json({
      success: true,
      message: "Salary record created successfully",
      data: salaryRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating salary record",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
  }
};

// Get all salary records for a labour
exports.getSalaryRecordsByLabour = async (req, res) => {
  try {
    const { labourId } = req.params;
    const userId = req.user.userId;

    if (!isValidId(labourId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid labour ID",
      });
    }

    // Verify labour belongs to user
    const labour = await prisma.labour.findUnique({
      where: { id: parseInt(labourId) },
    });

    if (!labour || labour.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Labour not found",
      });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const salaryRecords = await prisma.salaryRecord.findMany({
      where: { labourId: parseInt(labourId) },
      include: {
        labour: {
          select: {
            id: true,
            name: true,
            mobile: true,
            userId: true,
          },
        },
      },
      orderBy: {
        periodFromDate: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      success: true,
      data: salaryRecords,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching salary records",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
  }
};

// Get all salary records (with optional filters)
exports.getAllSalaryRecords = async (req, res) => {
  try {
    const { labourId, fromDate, toDate } = req.query;
    const userId = req.user.userId;

    let whereClause = {};

    if (labourId) {
      if (!isValidId(labourId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid labour ID",
        });
      }

      // Verify labour belongs to user
      const labour = await prisma.labour.findUnique({
        where: { id: parseInt(labourId) },
      });

      if (!labour || labour.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: Labour not found",
        });
      }

      whereClause.labourId = parseInt(labourId);
    } else {
      // Get all labours for this user, then get their salary records
      const labours = await prisma.labour.findMany({
        where: { userId },
        select: { id: true },
      });
      const labourIds = labours.map((l) => l.id);
      if (labourIds.length > 0) {
        whereClause.labourId = { in: labourIds };
      } else {
        // No labours for this user
        return res.json({
          success: true,
          data: [],
        });
      }
    }

    if (fromDate || toDate) {
      const parsedFromDate = fromDate ? new Date(fromDate) : null;
      const parsedToDate = toDate ? new Date(toDate) : null;

      if (
        (parsedFromDate && isNaN(parsedFromDate.getTime())) ||
        (parsedToDate && isNaN(parsedToDate.getTime()))
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        });
      }

      whereClause.periodFromDate = {};
      if (parsedFromDate) {
        whereClause.periodFromDate.gte = parsedFromDate;
      }
      if (parsedToDate) {
        whereClause.periodFromDate.lte = parsedToDate;
      }
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const salaryRecords = await prisma.salaryRecord.findMany({
      where: whereClause,
      include: {
        labour: {
          select: {
            id: true,
            name: true,
            mobile: true,
            userId: true,
          },
        },
      },
      orderBy: {
        periodFromDate: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      success: true,
      data: salaryRecords,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching salary records",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
  }
};

// Get salary record by ID
exports.getSalaryRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid salary record ID",
      });
    }

    const salaryRecord = await prisma.salaryRecord.findUnique({
      where: { id: parseInt(id) },
      include: {
        labour: {
          select: {
            id: true,
            name: true,
            mobile: true,
            userId: true,
          },
        },
      },
    });

    if (!salaryRecord || salaryRecord.labour.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }

    res.json({
      success: true,
      data: salaryRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching salary record",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
  }
};

// Update salary record
exports.updateSalaryRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      salaryAmount,
      periodFromDate,
      periodToDate,
      paymentDate,
      paidAmount,
      notes,
    } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid salary record ID",
      });
    }

    // Get salary record with labour to verify ownership
    const salaryRecord = await prisma.salaryRecord.findUnique({
      where: { id: parseInt(id) },
      include: { labour: true },
    });

    if (!salaryRecord || salaryRecord.labour.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You cannot edit this salary record",
      });
    }

    const updateData = {};

    // Validation
    if (salaryAmount !== undefined) {
      const salary = Number(salaryAmount);

      if (isNaN(salary) || salary <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid salary amount",
        });
      }

      if (salary > 1000000000) {
        return res.status(400).json({
          success: false,
          message: "Salary amount too large",
        });
      }

      updateData.salaryAmount = salary;
    }

    if (paidAmount !== undefined) {
      const paid = Number(paidAmount);
      if (isNaN(paid) || paid < 0) {
        return res.status(400).json({
          success: false,
          message: "Paid amount cannot be negative",
        });
      }
      updateData.paidAmount = paid;
    }

    // Paid amount cannot exceed salary (use updated value if provided, else existing)
    const effectiveSalary =
      updateData.salaryAmount !== undefined
        ? updateData.salaryAmount
        : salaryRecord.salaryAmount;
    const effectivePaid =
      updateData.paidAmount !== undefined
        ? updateData.paidAmount
        : salaryRecord.paidAmount;

    if (effectivePaid > effectiveSalary) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot exceed salary amount",
      });
    }

    if (notes !== undefined) {
      if (notes && notes.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Notes cannot exceed 1000 characters",
        });
      }
      updateData.notes = notes?.trim() || null;
    }

    if (periodFromDate !== undefined) {
      const parsed = new Date(periodFromDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        });
      }
      updateData.periodFromDate = parsed;
    }

    if (periodToDate !== undefined) {
      const parsed = new Date(periodToDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        });
      }
      updateData.periodToDate = parsed;
    }

    if (paymentDate !== undefined) {
      const parsed = new Date(paymentDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        });
      }
      updateData.paymentDate = parsed;
    }

    // Ensure fromDate < toDate using effective values
    const newFromDate = updateData.periodFromDate || salaryRecord.periodFromDate;
    const newToDate = updateData.periodToDate || salaryRecord.periodToDate;

    if (newFromDate >= newToDate) {
      return res.status(400).json({
        success: false,
        message: "From date must be before to date",
      });
    }

    const updatedRecord = await prisma.$transaction(async (tx) => {
      return tx.salaryRecord.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          labour: {
            select: {
              id: true,
              name: true,
              mobile: true,
              userId: true,
            },
          },
        },
      });
    });

    res.json({
      success: true,
      message: "Salary record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating salary record",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
  }
};

// Delete salary record
exports.deleteSalaryRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid salary record ID",
      });
    }

    // Get salary record with labour to verify ownership
    const salaryRecord = await prisma.salaryRecord.findUnique({
      where: { id: parseInt(id) },
      include: { labour: true },
    });

    if (!salaryRecord || salaryRecord.labour.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You cannot delete this salary record",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.salaryRecord.delete({
        where: { id: parseInt(id) },
      });
    });

    res.json({
      success: true,
      message: "Salary record deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error deleting salary record",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
  }
};