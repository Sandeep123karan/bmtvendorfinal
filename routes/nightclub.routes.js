const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createNightclub,
  getAllNightclubs,
  getMyNightclubs,
  getNightclubById,
  updateNightclub,
  deleteNightclub,
  approveNightclub,
  rejectNightclub,
} = require("../controllers/nightclub.controller");

/* ==========================================
   PUBLIC / LIST
========================================== */

router.get("/", getAllNightclubs);

/* ==========================================
   VENDOR NIGHTCLUB
========================================== */

router.get("/my", protect, getMyNightclubs);

router.post("/", protect, createNightclub);

/* ==========================================
   ADMIN ACTIONS
========================================== */

router.put("/:id/approve", approveNightclub);

router.put("/:id/reject", rejectNightclub);

/* ==========================================
   SINGLE NIGHTCLUB
========================================== */

router.get("/:id", getNightclubById);

router.put("/:id", protect, updateNightclub);

router.delete("/:id", protect, deleteNightclub);

module.exports = router;