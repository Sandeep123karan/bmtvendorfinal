
require("dotenv").config();

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

const connectDB = require("./config/db");

const app = express();

/* ==============================
   🛡️ MIDDLEWARES
============================== */
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    optionsSuccessStatus: 200,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  })
);
app.use(compression());
app.use(morgan("dev"));

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
   🧩 SAFE ROUTE LOADER
   - file missing ho ya router export na ho to server crash nahi hoga
   - console me exact file ka naam dikhega
============================== */
function loadRouter(file, exportName) {
  let mod;
  try {
    mod = require(file);
  } catch (err) {
    console.error(`❌ Cannot load ${file}: ${err.message}`);
    return null;
  }

  const candidates = [
    exportName && mod && mod[exportName],
    mod,
    mod && mod.default,
    mod && mod.router,
  ].filter(Boolean);

  const router = candidates.find((c) => typeof c === "function");

  if (!router) {
    console.error(
      `❌ ${file} does not export a valid router` +
        (exportName ? ` (looking for "${exportName}")` : "") +
        `. Found exports: [${Object.keys(mod || {}).join(", ")}]`
    );
    return null;
  }
  return router;
}

/* ==============================
   🚀 ROUTES TABLE
   [ path, file, (optional) named export ]
   Order matters: upar wale pehle mount hote hain
============================== */
const routes = [
  // AUTH
  ["/api/vendor/auth", "./routes/auth.routes"],
  ["/api/user/auth", "./routes/userAuth.routes"],
  ["/api/bmt-partner/auth", "./routes/bmtPartnerAuth.routes"],

  // UPLOAD
["/api/upload", "./routes/Upload.routes"],

  // TOURS
  ["/api/vendor/tours", "./routes/tour.routes"],
  ["/api/vendor/tour-bookings", "./routes/tourBooking.routes"],
  ["/api/customer/tour-bookings", "./routes/tourBooking.routes"],
  ["/api/customer/tour-queries", "./routes/tourQuery.routes", "customerTourQueryRoutes"],
  ["/api/vendor/tour-queries", "./routes/tourQuery.routes", "vendorTourQueryRoutes"],
  ["/api/vendor/tour-schedules", "./routes/tourSchedule.routes"],
  ["/api/tour-reviews", "./routes/tourReview.routes"],

  // ACTIVITIES
  ["/api/vendor/activities", "./routes/activity.routes"],
  ["/api/vendor/activity-schedules", "./routes/activitySchedule.routes"],
  ["/api/activity-bookings", "./routes/activityBooking.routes"],

  // HOTELS
  ["/api/vendor/hotels", "./routes/hotel.routes"],
  ["/api/hotel-rooms", "./routes/HotelRoom.routes"],
  ["/api/hotel-booking", "./routes/hotelBooking.routes"],
  ["/api/hotel-inventory", "./routes/HotelInventory.routes"],

  // NIGHTCLUBS
  ["/api/vendor/nightclubs", "./routes/nightclub.routes"],
  ["/api/nightclubs", "./routes/nightclub.routes"], // alias
  ["/api/nightclub-events", "./routes/nightClubEvent.routes"],
  ["/api/nightclub-event-tickets", "./routes/nightclubEventTicket.routes"],
  ["/api/nightclub-event-bookings", "./routes/nightclubEventBooking.routes"],
  ["/api/vendor/nightclub-tables", "./routes/nightClubTable.routes"],
  ["/api/nightclub-table-pricing", "./routes/nightClubTablePricing.routes"],

  // DARSHAN
  ["/api/vendor/darshans", "./routes/darshan.routes"],
  ["/api/vendor/darshan-types", "./routes/darshanType.routes"],
  ["/api/vendor/darshan-slots", "./routes/darshanSlot.routes"],
  ["/api/vendor/darshan-slot-availability", "./routes/darshanSlotAvailability.routes"],
  ["/api/darshan-bookings", "./routes/darshanBooking.routes"],
  ["/api/vendor/darshans", "./routes/vendorDarshanRoutes"], // legacy

  // CABS
  ["/api/vendor/cabs", "./routes/cab.routes"],
  ["/api/cabs", "./routes/cabBooking.routes"],

  // BUS
  ["/api/buses", "./routes/bus.routes"],
  ["/api/bus-types", "./routes/busType.routes"],
  ["/api/bus-seat-layouts", "./routes/busSeatLayout.routes"],
  ["/api/bus-trips", "./routes/busTrip.routes"],
  ["/api/bus-bookings", "./routes/busBooking.routes"],

  // FLIGHT
  ["/api/flights", "./routes/flight.routes"],
  ["/api/flight-bookings", "./routes/flightBooking.routes"],

  // HOMESTAY
  ["/api/vendor/homestay", "./routes/homestay.routes"],
  ["/api/homestay-units", "./routes/homestayUnit.routes"],
  ["/api/homestay-inventory", "./routes/homestayInventory.routes"],
  ["/api/homestay-bookings", "./routes/homestayBooking.routes"],
  ["/api/homestay-reviews", "./routes/homestayReview.routes"],

  // HOLIDAY / BNB
  ["/api/vendor/holidays", "./routes/holiday.routes"],
  ["/api/vendor/bnb", "./routes/bnbRoutes"],
  ["/api/holiday-bookings", "./routes/holidayBooking.routes"],

  // APARTMENT
  ["/api/vendor/apartment", "./routes/Apartment.routes"],
  ["/api/apartment-inventory", "./routes/apartmentInventory.routes"],
  ["/api/apartment-rate-plans", "./routes/apartmentRatePlan.routes"],
  ["/api/apartment-dynamic-pricing", "./routes/apartmentDynamicPricing.routes"],
  ["/api/apartment-bookings", "./routes/apartmentBooking.routes"],

  // VACATION HOUSE / PALACE / MOTEL
  ["/api/vacation-house", "./routes/vacationHouseRoutes"],
  ["/api/palaces", "./routes/palaceRoutes"],
  ["/api/palace-room-categories", "./routes/palaceRoomCategoryRoutes"],
  ["/api/palace-room-units", "./routes/palaceRoomUnitRoutes"],
  ["/api/palace-rate-plans", "./routes/palaceRatePlanRoutes"],
  ["/api/palace-inventory", "./routes/palaceInventoryRoutes"],
  ["/api/motel-vendors", "./routes/motelVendorRoutes"],

  // RESORT
  ["/api/resorts", "./routes/resort.routes"],
  ["/api/resort-rooms", "./routes/resortRoom.routes"],
  ["/api/resort-room-units", "./routes/resortRoomUnit.routes"],
  ["/api/resort-inventory", "./routes/resortInventory.routes"],
  ["/api/resort-rate-plans", "./routes/resortRatePlan.routes"],
  ["/api/resort-pricing", "./routes/resortPricing.routes"],
  ["/api/resort-bookings", "./routes/resortBooking.routes"],
  ["/api/resort-reviews", "./routes/resortReview.routes"],

  // CAMPSITE
  ["/api/vendor/campsite", "./routes/vendorCampsite.routes"],

  // CRUISE
  ["/api/vendor/cruise/ships", "./routes/cruiseShip.routes"],
  ["/api/cruise-cabins", "./routes/cruiseCabin.routes"],
  ["/api/cruise-itineraries", "./routes/cruiseItinerary.routes"],
  ["/api/cruise-sailings", "./routes/cruiseSailing.routes"],
  ["/api/cruise-pricings", "./routes/cruisePricing.routes"],
  ["/api/cruise-availabilities", "./routes/cruiseAvailability.routes"],
  ["/api/customer/cruise-bookings", "./routes/cruiseBooking.routes"],
];

const failedRoutes = [];

routes.forEach(([path, file, exportName]) => {
  const router = loadRouter(file, exportName);
  if (router) {
    app.use(path, router);
  } else {
    failedRoutes.push(`${path}  ->  ${file}${exportName ? " [" + exportName + "]" : ""}`);
  }
});

if (failedRoutes.length) {
  console.error("\n⚠️  These routes were SKIPPED (fix the route files):");
  failedRoutes.forEach((r) => console.error("   - " + r));
  console.error("");
}

/* ==============================
   ❤️ HEALTH CHECK
============================== */
app.get("/", (req, res) => {
  res.send("🚀 Vendor Backend Running Successfully");
});

/* ==============================
   ❌ 404 HANDLERS (always AFTER routes)
============================== */
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

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