const express =
  require("express");

const router =
  express.Router();

const {
  register,
  login,
  me,
} = require(
  "../controllers/bmtPartnerAuth.controller"
);

const bmtPartnerAuth =
  require(
    "../middleware/bmtPartnerAuth.middleware"
  );

/* PUBLIC */

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

/* PRIVATE */

router.get(
  "/me",
  bmtPartnerAuth,
  me
);

module.exports =
  router;