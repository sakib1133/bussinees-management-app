const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getSummary = async (req, res) => {
  try {
    // Calculate total sales from database
    const totalSalesResult = await prisma.sale.aggregate({
      _sum: {
        amount: true
      }
    });

    // Calculate labour expense from legacy LabourPayment table
    const totalLabourPaymentResult = await prisma.labourPayment.aggregate({
      _sum: {
        amount: true
      }
    });

    // Calculate labour expense from new SalaryRecord table
    const totalSalaryPaidResult = await prisma.salaryRecord.aggregate({
      _sum: {
        paidAmount: true
      }
    });

    const totalMedicineExpenseResult = await prisma.medicine.aggregate({
      _sum: {
        amount: true
      }
    });

    const totalOtherExpensesResult = await prisma.expense.aggregate({
      _sum: {
        amount: true
      }
    });

    const totalSales = totalSalesResult._sum.amount ? Number(totalSalesResult._sum.amount) : 0;
    const labourPaymentExpense = totalLabourPaymentResult._sum.amount ? Number(totalLabourPaymentResult._sum.amount) : 0;
    const salaryPaidExpense = totalSalaryPaidResult._sum.paidAmount ? Number(totalSalaryPaidResult._sum.paidAmount) : 0;
    const totalLabourExpense = labourPaymentExpense + salaryPaidExpense;
    const totalMedicineExpense = totalMedicineExpenseResult._sum.amount ? Number(totalMedicineExpenseResult._sum.amount) : 0;
    const totalOtherExpenses = totalOtherExpensesResult._sum.amount ? Number(totalOtherExpensesResult._sum.amount) : 0;

    const totalExpenses = totalLabourExpense + totalMedicineExpense + totalOtherExpenses;
    const netProfit = totalSales - totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        totalSales,
        totalLabourExpense,
        totalMedicineExpense,
        totalOtherExpenses,
        totalExpenses,
        netProfit
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

module.exports = {
  getSummary
};
