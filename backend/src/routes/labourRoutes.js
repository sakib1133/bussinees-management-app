const express = require("express");
const router = express.Router();
const labourController = require("../controllers/labourController");
const auth = require("../middlewares/auth");

// All routes protected with auth middleware
router.use(auth);

// Create a new labour
router.post("/", labourController.createLabour);

// Get all labour with calculations
router.get("/", labourController.getAllLabour);

// Get labour summary (total expense)
router.get("/summary", labourController.getLabourSummary);

// Get labour by ID with salary history
router.get("/:id", labourController.getLabourById);

// Update labour
router.put("/:id", labourController.updateLabour);

// Delete labour
router.delete("/:id", labourController.deleteLabour);

module.exports = router;
