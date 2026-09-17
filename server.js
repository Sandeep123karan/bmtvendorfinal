

require("dotenv").config();

// 🔥 MongoDB DNS FIX (SRV issue fix)
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

const connectDB = require("./config/db");

// custom routes
const palaceRoutes = require("./routes/palaceRoutes");

const vacationHouseRoutes = require("./routes/vacationHouseRoutes");
const motelVendorRoutes = require("./routes/motelVendorRoutes");
const hotelBookingRoutes = require("./routes/hotelBooking.routes");
const app = express();

/* ==============================
   🔐 SECURITY + PERFORMANCE
============================== */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());
app.use(morgan("dev"));

/* ==============================
   🌍 CORS
============================== */
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:7000",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

/* ==============================
   📦 BODY PARSER
============================== */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* ==============================
   🗄️ DATABASE CONNECTION
============================== */
connectDB();

/* ==============================
   🚀 ROUTES
============================== */

// AUTH + MAIN
app.use("/api/vendor/auth", require("./routes/auth.routes"));

// HOTELS
app.use("/api/vendor/hotels", require("./routes/hotel.routes"));
const hotelRoomRoutes = require("./routes/HotelRoom.routes");
app.use("/api/hotel-rooms", hotelRoomRoutes);
app.use("/api/hotel-booking", hotelBookingRoutes);
const hotelInventoryRoutes = require("./routes/HotelInventory.routes");

app.use("/api/hotel-inventory", hotelInventoryRoutes);

const nightclubRoutes = require("./routes/nightclub.routes");

app.use("/api/nightclubs", nightclubRoutes);
// CABS
app.use("/api/vendor/cabs", require("./routes/cab.routes"));
app.use("/api/cabs", require("./routes/cabBooking.routes"));
// app.use("/api/vendor/cabs-booking", require("./routes/vendorCabBooking.routes")); // ✅ FIX

// BUS
app.use("/api/buses", require("./routes/bus.routes"));
const busSeatLayoutRoutes = require(
  "./routes/busSeatLayout.routes"
);

app.use(
  "/api/bus-seat-layouts",
  busSeatLayoutRoutes
);
const busTripRoutes = require(
  "./routes/busTrip.routes"
);

app.use(
  "/api/bus-trips",
  busTripRoutes
);
app.use("/api/bus-bookings", require("./routes/busBooking.routes"));

// FLIGHT
app.use("/api/flights", require("./routes/flight.routes"));
app.use("/api/flight-bookings", require("./routes/flightBooking.routes"));

// HOMESTAY
app.use("/api/vendor/homestay", require("./routes/homestay.routes"));
app.use("/api/homestay-bookings", require("./routes/homestayBooking.routes"));

// HOLIDAY
app.use("/api/vendor/holidays", require("./routes/holiday.routes"));
app.use("/api/vendor/bnb", require("./routes/bnbRoutes"));
app.use("/api/holiday-bookings", require("./routes/holidayBooking.routes"));

// DARSHAN + APARTMENT
app.use("/api/vendor/darshans", require("./routes/vendorDarshanRoutes"));
app.use("/api/vendor/apartment", require("./routes/Apartment.routes"));

// CUSTOM
app.use("/api/vacation-house", vacationHouseRoutes);
app.use("/api/palaces", palaceRoutes);
const palaceRoomCategoryRoutes = require("./routes/palaceRoomCategoryRoutes");
app.use(
  "/api/palace-room-categories",
  palaceRoomCategoryRoutes
);
const palaceRoomUnitRoutes = require(
  "./routes/palaceRoomUnitRoutes"
);
app.use(
  "/api/bmt-partner/auth",
  require(
    "./routes/bmtPartnerAuth.routes"
  )
);

app.use(
  "/api/palace-room-units",
  palaceRoomUnitRoutes
);
const palaceRatePlanRoutes = require(
  "./routes/palaceRatePlanRoutes"
);

app.use(
  "/api/palace-rate-plans",
  palaceRatePlanRoutes
);
const palaceInventoryRoutes =
  require("./routes/palaceInventoryRoutes");

app.use(
  "/api/palace-inventory",
  palaceInventoryRoutes
);


app.use("/api/motel-vendors", motelVendorRoutes);
const homestayUnitRoutes = require("./routes/homestayUnit.routes");

app.use("/api/homestay-units", homestayUnitRoutes);
const homestayInventoryRoutes = require("./routes/homestayInventory.routes");

app.use(
  "/api/homestay-inventory",
  homestayInventoryRoutes
);
const homestayBookingRoutes = require("./routes/homestayBooking.routes");
app.use(
  "/api/homestay-bookings",
  homestayBookingRoutes
);
const homestayReviewRoutes = require("./routes/homestayReview.routes");
app.use("/api/homestay-reviews", homestayReviewRoutes);
const resortRoutes = require("./routes/resort.routes");
app.use("/api/resorts", resortRoutes);
const campsiteRoutes = require("./routes/vendorCampsite.routes");
const resortRoomRoutes = require("./routes/resortRoom.routes");
app.use("/api/resort-rooms", resortRoomRoutes);
const resortRoomUnitRoutes = require("./routes/resortRoomUnit.routes");

app.use(
  "/api/resort-room-units",
  resortRoomUnitRoutes
);
const resortInventoryRoutes = require(
  "./routes/resortInventory.routes"
);

app.use(
  "/api/resort-inventory",
  resortInventoryRoutes
);
const resortRatePlanRoutes = require(
  "./routes/resortRatePlan.routes"
);

const resortPricingRoutes = require(
  "./routes/resortPricing.routes"
);


app.use(
  "/api/resort-rate-plans",
  resortRatePlanRoutes
);

app.use(
  "/api/resort-pricing",
  resortPricingRoutes
);
const resortBookingRoutes = require(
  "./routes/resortBooking.routes"
);

app.use(
  "/api/resort-bookings",
  resortBookingRoutes
);
const resortReviewRoutes = require(
  "./routes/resortReview.routes"
);

app.use(
  "/api/resort-reviews",
  resortReviewRoutes
);
const apartmentInventoryRoutes = require(
  "./routes/apartmentInventory.routes"
);

app.use(
  "/api/apartment-inventory",
  apartmentInventoryRoutes
);
const apartmentRatePlanRoutes = require(
  "./routes/apartmentRatePlan.routes"
);

app.use(
  "/api/apartment-rate-plans",
  apartmentRatePlanRoutes
);
const apartmentDynamicPricingRoutes = require(
  "./routes/apartmentDynamicPricing.routes"
);

app.use(
  "/api/apartment-dynamic-pricing",
  apartmentDynamicPricingRoutes
);
const apartmentBookingRoutes = require(
  "./routes/apartmentBooking.routes"
);

app.use(
  "/api/apartment-bookings",
  apartmentBookingRoutes
);
app.use("/api/vendor/campsite", campsiteRoutes);
/* ==============================
   ❤️ HEALTH CHECK
============================== */
app.get("/", (req, res) => {
  res.send("🚀 Vendor Backend Running Successfully");
});

/* ==============================
   ❌ API 404 HANDLER (FIXED)
============================== */
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* ==============================
   ❌ GLOBAL 404
============================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ==============================
   🔥 ERROR HANDLER
============================== */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ==============================
   🟢 START SERVER
============================== */
const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});