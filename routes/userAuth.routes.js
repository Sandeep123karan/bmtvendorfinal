const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/userAuth.controller");

const userAuth = require("../middleware/userAuth.middleware");


router.post(
  "/register",
  registerUser
);


router.post(
  "/login",
  loginUser
);


router.get(
  "/profile",
  userAuth,
  getUserProfile
);


module.exports = router;