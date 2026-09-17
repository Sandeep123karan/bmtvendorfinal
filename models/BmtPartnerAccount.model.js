const mongoose = require("mongoose");

const BmtPartnerAccountSchema =
  new mongoose.Schema(
    {
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      businessEmail: {
        type: String,
        lowercase: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      country: {
        type: String,
        default: "",
      },

      countryCode: {
        type: String,
        default: "",
      },

      password: {
        type: String,
        required: true,
        select: false,
      },

      role: {
        type: String,
        enum: [
          "owner",
          "admin",
          "staff",
        ],
        default: "owner",
      },

      selectedVertical: {
        type: String,

        enum: [
          "",
          "stay",
          "bus",
          "cab",
          "packages",
          "activities",
          "events",
          "darshan",
          "cruise",
        ],

        default: "",
      },

      vertical: {
        type: String,
        enum: [
          "",
          "stay",
          "bus",
          "cab",
          "packages",
          "activities",
          "events",
          "darshan",
          "cruise",
        ],
        default: "",
      },

      service: {
        type: String,
        enum: [
          "",
          "stay",
          "bus",
          "cab",
          "packages",
          "activities",
          "events",
          "darshan",
          "cruise",
        ],
        default: "",
      },

      accountStatus: {
        type: String,

        enum: [
          "active",
          "suspended",
          "blocked",
          "pending",
        ],

        default: "active",
      },

      emailVerified: {
        type: Boolean,
        default: false,
      },

      phoneVerified: {
        type: Boolean,
        default: false,
      },

      onboardingStatus: {
        type: String,

        enum: [
          "not_started",
          "in_progress",
          "submitted",
          "under_review",
          "verification_required",
          "approved",
          "rejected",
          "active",
        ],

        default: "not_started",
      },

      onboardingComplete: {
        type: Boolean,
        default: false,
      },

      lastLoginAt: {
        type: Date,
        default: null,
      },

      lastLoginIp: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "BmtPartnerAccount",
    BmtPartnerAccountSchema
  );