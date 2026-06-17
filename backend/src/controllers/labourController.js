const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new labour record
exports.createLabour = async (req, res) => {
  try {
    const { name, address } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Labour name is required",
      });
    }

    // Check if labour already exists
    const existingLabour = await prisma.labour.findUnique({
      where: { name: name.trim() },
    });

    if (existingLabour) {
      return res.status(400).json({
        success: false,
        message: "Labour with this name already exists",
      });
    }

    const labour = await prisma.labour.create({
      data: {
        name: name.trim(),
        address: address?.trim() || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Labour created successfully",
      data: labour,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating labour",
      error: error.message,
    });
  }
};

// Get all labour with salary calculations
exports.getAllLabour = async (req, res) => {
  try {
    const labours = await prisma.labour.findMany({
      include: {
        salaryRecords: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    // Calculate totals for each labour
    const labourWithTotals = labours.map((labour) => {
      const totalSalary = labour.salaryRecords.reduce(
        (sum, record) => sum + record.salaryAmount,
        0
      );
      const totalPaid = labour.salaryRecords.reduce(
        (sum, record) => sum + record.paidAmount,
        0
      );

      return {
        ...labour,
        totalSalary,
        totalPaid,
        totalRemaining: totalSalary - totalPaid,
      };
    });

    res.json({
      success: true,
      data: labourWithTotals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching labour",
      error: error.message,
    });
  }
};

// Get labour by ID with salary history
exports.getLabourById = async (req, res) => {
  try {
    const { id } = req.params;

    const labour = await prisma.labour.findUnique({
      where: { id: parseInt(id) },
      include: {
        salaryRecords: {
          orderBy: {
            periodFromDate: "desc",
          },
        },
      },
    });

    if (!labour) {
      return res.status(404).json({
        success: false,
        message: "Labour not found",
      });
    }

    // Calculate totals
    const totalSalary = labour.salaryRecords.reduce(
      (sum, record) => sum + record.salaryAmount,
      0
    );
    const totalPaid = labour.salaryRecords.reduce(
      (sum, record) => sum + record.paidAmount,
      0
    );

    res.json({
      success: true,
      data: {
        ...labour,
        totalSalary,
        totalPaid,
        totalRemaining: totalSalary - totalPaid,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching labour",
      error: error.message,
    });
  }
};

// Update labour
exports.updateLabour = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Labour name is required",
      });
    }

    const labour = await prisma.labour.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        address: address?.trim() || null,
      },
    });

    res.json({
      success: true,
      message: "Labour updated successfully",
      data: labour,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Labour not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating labour",
      error: error.message,
    });
  }
};

// Delete labour
exports.deleteLabour = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.labour.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Labour deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Labour not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error deleting labour",
      error: error.message,
    });
  }
};

// Get labour summary (for dashboard)
exports.getLabourSummary = async (req, res) => {
  try {
    const result = await prisma.salaryRecord.aggregate({
      _sum: {
        paidAmount: true,
      },
    });

    const totalLabourExpense = result._sum.paidAmount || 0;

    res.json({
      success: true,
      data: {
        totalLabourExpense,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching labour summary",
      error: error.message,
    });
  }
};
