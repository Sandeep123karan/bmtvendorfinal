const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createQuery,
  getVendorQueries,
  getQueryById,
  updateQueryStatus,
  updateVendorNote,
  deleteQuery,
} = require("../controllers/tourQuery.controller");


/* =========================================================
   TOUR QUERY ROUTES
========================================================= */

/*
  Create Query
  POST /api/vendor/tour-queries
*/
router.post(
  "/",
  protect,
  createQuery
);


/*
  Get Vendor Queries
  GET /api/vendor/tour-queries
*/
router.get(
  "/",
  protect,
  getVendorQueries
);


/*
  Get Single Query
  GET /api/vendor/tour-queries/:id
*/
router.get(
  "/:id",
  protect,
  getQueryById
);


/*
  Update Status
  PATCH /api/vendor/tour-queries/:id/status
*/
router.patch(
  "/:id/status",
  protect,
  updateQueryStatus
);


/*
  Update Vendor Note
  PATCH /api/vendor/tour-queries/:id/note
*/
router.patch(
  "/:id/note",
  protect,
  updateVendorNote
);


/*
  Delete Query
  DELETE /api/vendor/tour-queries/:id
*/
router.delete(
  "/:id",
  protect,
  deleteQuery
);


module.exports = router;