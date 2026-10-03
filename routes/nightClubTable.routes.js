const express = require("express");

const router = express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const {
  createNightClubTable,
  getMyNightClubTables,
  updateNightClubTable,
  deleteNightClubTable,
} = require(
  "../controllers/nightClubTable.controller"
);

// ==========================================
// CREATE TABLE
// ==========================================

router.post(
  "/",
  protect,
  createNightClubTable
);

// ==========================================
// GET MY TABLES
// ==========================================

router.get(
  "/my-tables",
  protect,
  getMyNightClubTables
);

// ==========================================
// UPDATE TABLE
// ==========================================

router.put(
  "/:id",
  protect,
  updateNightClubTable
);

// ==========================================
// DISABLE TABLE
// ==========================================

router.delete(
  "/:id",
  protect,
  deleteNightClubTable
);

module.exports = router;