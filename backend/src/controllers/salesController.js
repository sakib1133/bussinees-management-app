const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create a new sale
const createSale = async (req, res) => {
try {
const { contractorName, amount, count, saleDate, description } = req.body;

const userId = req.user.userId;


// Validation
if (!contractorName || !amount || !count || !saleDate) {
  return res.status(400).json({
    success: false,
    message: 'Contractor name, amount, count, and sale date are required.'
  });
}



if (contractorName.trim().length > 100) {
  return res.status(400).json({
    success: false,
    message: 'Contractor name is too long.'
  });
}

if (amount <= 0) {
  return res.status(400).json({
    success: false,
    message: 'Amount must be greater than 0.'
  });
}

if (amount > 1000000000) {
  return res.status(400).json({
    success: false,
    message: 'Amount is too large.'
  });
}

if (count <= 0) {
  return res.status(400).json({
    success: false,
    message: 'Count must be greater than 0.'
  });
}

if (count > 1000000000) {
  return res.status(400).json({
    success: false,
    message: 'Count is too large.'
  });
}

const parsedDate = new Date(saleDate);


if (isNaN(parsedDate.getTime())) {
  return res.status(400).json({
    success: false,
    message: 'Invalid sale date.'
  });
}

const sale = await prisma.sale.create({
  data: {
    userId,
    contractorName: contractorName.trim(),
    amount: parseFloat(amount),
    count: parseInt(count, 10),
    saleDate: parsedDate,
    description: description?.trim() || null
  }
});


res.status(201).json({
  success: true,
  message: 'Sale created successfully.',
  data: sale
});

} catch (error) {
console.error('Create sale error:', error);
res.status(500).json({
success: false,
message: 'Internal server error.'
});
}
};

// Get all sales
const getAllSales = async (req, res) => {
try {
const userId = req.user.userId;


const sales = await prisma.sale.findMany({
  where: { userId },
  orderBy: { saleDate: 'desc' },
  select: {
    id: true,
    contractorName: true,
    amount: true,
    count: true,
    saleDate: true,
    description: true,

    createdAt: true,
    updatedAt: true
  }
});

res.status(200).json({
  success: true,
  data: sales
});


} catch (error) {
console.error('Get all sales error:', error);
res.status(500).json({
success: false,
message: 'Internal server error.'
});
}
};

// Get sale by ID
const getSaleById = async (req, res) => {
try {
const { id } = req.params;
const userId = req.user.userId;


if (isNaN(parseInt(id))) {
  return res.status(400).json({
    success: false,
    message: 'Invalid sale ID.'
  });
}

const sale = await prisma.sale.findUnique({
  where: { id: parseInt(id) }
});

if (!sale || sale.userId !== userId) {
  return res.status(404).json({
    success: false,
    message: 'Sale not found.'
  });
}

res.status(200).json({
  success: true,
  data: sale
});


} catch (error) {
console.error('Get sale by id error:', error);
res.status(500).json({
success: false,
message: 'Internal server error.'
});
}
};

// Update sale
const updateSale = async (req, res) => {
try {
const { id } = req.params;
const { contractorName, amount, count, saleDate, description } = req.body;

const userId = req.user.userId;


if (isNaN(parseInt(id))) {
  return res.status(400).json({
    success: false,
    message: 'Invalid sale ID.'
  });
}

const sale = await prisma.sale.findUnique({
  where: { id: parseInt(id) }
});

if (!sale || sale.userId !== userId) {
  return res.status(403).json({
    success: false,
    message: 'Unauthorized: You cannot edit this sale.'
  });
}

if (contractorName && contractorName.trim().length > 100) {
  return res.status(400).json({
    success: false,
    message: 'Contractor name is too long.'
  });
}

if (amount !== undefined) {
  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be greater than 0.'
    });
  }

  if (amount > 1000000000) {
    return res.status(400).json({
      success: false,
      message: 'Amount is too large.'
    });
  }
}

if (count !== undefined) {
  if (count <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Count must be greater than 0.'
    });
  }

  if (count > 1000000000) {
    return res.status(400).json({
      success: false,
      message: 'Count is too large.'
    });
  }
}

let parsedDate = sale.saleDate;


if (saleDate) {
  parsedDate = new Date(saleDate);

  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid sale date.'
    });
  }
}

const updatedSale = await prisma.sale.update({
  where: { id: parseInt(id) },
  data: {
    contractorName: contractorName
      ? contractorName.trim()
      : sale.contractorName,
    amount:
      amount !== undefined
        ? parseFloat(amount)
        : sale.amount,
    count:
      count !== undefined
        ? parseInt(count, 10)
        : sale.count,
    saleDate: parsedDate,
    description:
      description !== undefined
        ? description
        : sale.description
  }
});


res.status(200).json({
  success: true,
  message: 'Sale updated successfully.',
  data: updatedSale
});


} catch (error) {
console.error('Update sale error:', error);
res.status(500).json({
success: false,
message: 'Internal server error.'
});
}
};

// Delete sale
const deleteSale = async (req, res) => {
try {
const { id } = req.params;
const userId = req.user.userId;

if (isNaN(parseInt(id))) {
  return res.status(400).json({
    success: false,
    message: 'Invalid sale ID.'
  });
}

const sale = await prisma.sale.findUnique({
  where: { id: parseInt(id) }
});

if (!sale || sale.userId !== userId) {
  return res.status(403).json({
    success: false,
    message: 'Unauthorized: You cannot delete this sale.'
  });
}

await prisma.sale.delete({
  where: { id: parseInt(id) }
});

res.status(200).json({
  success: true,
  message: 'Sale deleted successfully.'
});

} catch (error) {
console.error('Delete sale error:', error);
res.status(500).json({
success: false,
message: 'Internal server error.'
});
}
};

module.exports = {
createSale,
getAllSales,
getSaleById,
updateSale,
deleteSale
};
