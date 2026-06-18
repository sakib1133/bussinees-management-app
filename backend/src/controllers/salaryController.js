const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new salary record
exports.createSalaryRecord = async (req, res) => {
  try {
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
    if (!labourId) {
      return res.status(400).json({
        success: false,
        message: "Labour ID is required",
      });
    }

    if (!salaryAmount || salaryAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Salary amount must be greater than 0",
      });
    }

    if (paidAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot be negative",
      });
    }

    const fromDate = new Date(periodFromDate);
    const toDate = new Date(periodToDate);

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

    if (!labour) {
      return res.status(404).json({
        success: false,
        message: "Labour not found",
      });
    }

    const salaryRecord = await prisma.salaryRecord.create({
      data: {
        labourId: parseInt(labourId),
        salaryAmount: parseFloat(salaryAmount),
        periodFromDate: fromDate,
        periodToDate: toDate,
        paymentDate: new Date(paymentDate),
        paidAmount: parseFloat(paidAmount),
        notes: notes?.trim() || null,
      },
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
      error: error.message,
    });
  }
};

// Get all salary records for a labour
exports.getSalaryRecordsByLabour = async (req, res) => {
  try {
    const { labourId } = req.params;
    const userId = req.user.userId;

    // Verify labour belongs to user
    const labour = await prisma.labour.findUnique({
      where: { id: parseInt(labourId) }
    });

    if (!labour || labour.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Labour not found",
      });
    }

    const salaryRecords = await prisma.salaryRecord.findMany({
      where: { labourId: parseInt(labourId) },
      include: {
        labour: true,
      },
      orderBy: {
        periodFromDate: "desc",
      },
    });

    res.json({
      success: true,
      data: salaryRecords,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching salary records",
      error: error.message,
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
      // Verify labour belongs to user
      const labour = await prisma.labour.findUnique({
        where: { id: parseInt(labourId) }
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
        select: { id: true }
      });
      const labourIds = labours.map(l => l.id);
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
      whereClause.periodFromDate = {};
      if (fromDate) {
        whereClause.periodFromDate.gte = new Date(fromDate);
      }
      if (toDate) {
        whereClause.periodFromDate.lte = new Date(toDate);
      }
    }

    const salaryRecords = await prisma.salaryRecord.findMany({
      where: whereClause,
      include: {
        labour: true,
      },
      orderBy: {
        periodFromDate: "desc",
      },
    });

    res.json({
      success: true,
      data: salaryRecords,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching salary records",
      error: error.message,
    });
  }
};

// Get salary record by ID
exports.getSalaryRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const salaryRecord = await prisma.salaryRecord.findUnique({
      where: { id: parseInt(id) },
      include: {
        labour: true,
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
      error: error.message,
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

    // Get salary record with labour to verify ownership
    const salaryRecord = await prisma.salaryRecord.findUnique({
      where: { id: parseInt(id) },
      include: { labour: true }
    });

    if (!salaryRecord || salaryRecord.labour.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You cannot edit this salary record",
      });
    }

    // Validation
    if (salaryAmount && salaryAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Salary amount must be greater than 0",
      });
    }

    if (paidAmount !== undefined && paidAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot be negative",
      });
    }

    const updateData = {};
    if (salaryAmount) updateData.salaryAmount = parseFloat(salaryAmount);
    if (periodFromDate) updateData.periodFromDate = new Date(periodFromDate);
    if (periodToDate) updateData.periodToDate = new Date(periodToDate);
    if (paymentDate) updateData.paymentDate = new Date(paymentDate);
    if (paidAmount !== undefined) updateData.paidAmount = parseFloat(paidAmount);
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const updatedRecord = await prisma.salaryRecord.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        labour: true,
      },
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
      error: error.message,
    });
  }
};

// Delete salary record
exports.deleteSalaryRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Get salary record with labour to verify ownership
    const salaryRecord = await prisma.salaryRecord.findUnique({
      where: { id: parseInt(id) },
      include: { labour: true }
    });

    if (!salaryRecord || salaryRecord.labour.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You cannot delete this salary record",
      });
    }

    await prisma.salaryRecord.delete({
      where: { id: parseInt(id) },
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
      error: error.message,
    });
  }
};
