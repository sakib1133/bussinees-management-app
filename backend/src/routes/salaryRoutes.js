const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");
const auth = require("../middlewares/auth");

// All routes protected with auth middleware
router.use(auth);

// Create a new salary record
router.post("/", salaryController.createSalaryRecord);

// Get all salary records (with optional filters)
router.get("/", salaryController.getAllSalaryRecords);

// Get salary records by labour ID
router.get("/labour/:labourId", salaryController.getSalaryRecordsByLabour);

// Get salary record by ID
router.get("/:id", salaryController.getSalaryRecordById);

// Update salary record
router.put("/:id", salaryController.updateSalaryRecord);

// Delete salary record
router.delete("/:id", salaryController.deleteSalaryRecord);

module.exports = router;
