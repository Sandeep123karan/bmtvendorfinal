const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createResort,
  getMyResorts,
  getSingleResort,
  updateResort,
  deleteResort,
} = require("../controllers/resort.controller");


/* ==========================================
   ALL RESORT APIs REQUIRE VENDOR LOGIN
========================================== */

router.use(protect);


/* ==========================================
   CREATE RESORT
========================================== */

router.post("/", createResort);


/* ==========================================
   GET LOGGED-IN VENDOR RESORTS
========================================== */

router.get("/my-resorts", getMyResorts);


/* ==========================================
   GET SINGLE RESORT
========================================== */

router.get("/:id", getSingleResort);


/* ==========================================
   UPDATE RESORT
========================================== */

router.put("/:id", updateResort);


/* ==========================================
   DELETE RESORT
========================================== */

router.delete("/:id", deleteResort);


module.exports = router;