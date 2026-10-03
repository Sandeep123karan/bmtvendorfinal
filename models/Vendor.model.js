
// const mongoose = require("mongoose");

// const { Schema } = mongoose;

// /* =========================================================
//    SHORT FIELD HELPERS
// ========================================================= */

// const S = (o = {}) => ({ type: String, default: "", ...o });
// const N = (def = 0, o = {}) => ({ type: Number, default: def, ...o });
// const B = (def = false) => ({ type: Boolean, default: def });
// const SA = () => [{ type: String }];
// const A = () => ({ type: [String], default: [] });

// /* Sub-document with all defaults filled */
// const section = (fields) => ({
//   type: new Schema(fields, { _id: false }),
//   default: () => ({}),
// });

// /* =========================================================
//    CONSTANTS
// ========================================================= */

// const MAIN_VERTICALS = [
//   "",
//   "stay",
//   "bus",
//   "cab",
//   "packages",
//   "activities",
//   "events",
//   "darshan",
//   "cruise",
// ];

// const STAY_SUBTYPES = [
//   "",
//   "hotel",
//   "resort",
//   "homestay",
//   "villa",
//   "apartment",
//   "guesthouse",
//   "hostel",
//   "motel",
//   "vacation-home",
//   "palace",
//   "campsite",
//   "camp", // frontend "Camp" option
//   "farmhouse",
//   "bnb",
//   "lodge",
//   "inn",
//   "serviced-apartment",
//   "holiday-park",
//   "unique-stay",
//   "other",
// ];

// const VENDOR_ROLES = [
//   "owner",
//   "general_manager",
//   "operations_manager",
//   "booking_manager",
//   "reservation_executive",
//   "front_desk",
//   "property_manager",
//   "housekeeping",
//   "finance_manager",
//   "accountant",
//   "sales_manager",
//   "marketing_manager",
//   "bus_operations_manager",
//   "fleet_manager",
//   "transport_coordinator",
//   "tour_manager",
//   "activity_manager",
//   "event_manager",
//   "cruise_operations_manager",
//   "darshan_operations_manager",
//   "customer_support",
//   "read_only",
//   "custom",
// ];

// /* =========================================================
//    PERMISSION SCOPE
// ========================================================= */

// const permissionScopeSchema = new Schema(
//   {
//     scopeType: {
//       type: String,
//       enum: ["all", "vertical", "property", "branch", "assigned"],
//       default: "all",
//     },
//     verticals: [{ type: String, enum: MAIN_VERTICALS }],
//     properties: [{ type: Schema.Types.ObjectId }],
//     branches: [{ type: Schema.Types.ObjectId }],
//   },
//   { _id: false }
// );

// /* =========================================================
//    LOGIN SESSION HISTORY
// ========================================================= */

// const loginHistorySchema = new Schema(
//   {
//     loginAt: { type: Date, default: Date.now },
//     ip: S(),
//     userAgent: S(),
//     deviceId: S(),
//     successful: B(true),
//   },
//   { _id: true }
// );

// /* =========================================================
//    STAY CONTACT
// ========================================================= */

// const stayContactSchema = new Schema(
//   {
//     contactType: {
//       type: String,
//       enum: [
//         "primary",
//         "reservation",
//         "operations",
//         "finance",
//         "owner",
//         "manager",
//         "emergency",
//         "other",
//       ],
//       default: "primary",
//     },
//     name: S({ trim: true }),
//     designation: S({ trim: true }),
//     email: S({ lowercase: true, trim: true }),
//     countryCode: S({ trim: true }),
//     phone: S({ trim: true }),
//     whatsapp: S({ trim: true }),
//     preferredLanguage: S({ default: "en" }),
//   },
//   { _id: true }
// );

// /* =========================================================
//    NEARBY LANDMARK
// ========================================================= */

// const landmarkSchema = new Schema(
//   {
//     name: S({ trim: true }),
//     category: S({ trim: true }),
//     distance: N(null),
//     distanceUnit: { type: String, enum: ["m", "km", "mile"], default: "km" },
//   },
//   { _id: true }
// );

// /* =========================================================
//    EXTERNAL PROPERTY ID
// ========================================================= */

// const externalPropertySchema = new Schema(
//   {
//     provider: S({ trim: true }),
//     propertyId: S({ trim: true }),
//   },
//   { _id: true }
// );

// /* =========================================================
//    VERTICAL DETAILS: CRUISE / TOURS / ACTIVITIES / EVENTS /
//    DARSHAN

//    Frontend payload keys:
//      cruiseDetails   (flat + policies / contact / media / documents)
//      packageDetails  \
//      activityDetails  |  grouped: basic / classification /
//      eventDetails     |  inventory / amenities / policies /
//      darshanDetails  /   media / documents

//    Enums intentionally NOT used here so admin can add new
//    options later without a backend deploy. Required-field
//    rules live in the controller (prepareVerticalDetails).
// ========================================================= */

// const mediaFields = {
//   propertyImages: A(),
//   videos: A(),
//   logo: S(),
//   coverImage: S(),
// };

// /* ---------------------- CRUISE ---------------------- */

// const cruiseDetailsSchema = new Schema(
//   {
//     cruiseOperatorName: S({ trim: true }),
//     cruiseLineName: S({ trim: true }),
//     cruiseType: S({ trim: true }),
//     cruiseOperatorType: S({ trim: true }),
//     vesselType: S({ trim: true }),
//     cruiseCategory: S({ trim: true }),
//     cruiseExperience: S({ trim: true }),

//     shipName: S({ trim: true }),
//     imoNumber: S({ trim: true }),
//     shipRegistrationNumber: S({ trim: true }),
//     yearBuilt: N(null),
//     passengerCapacity: N(0, { min: 0 }),
//     crewCapacity: N(0, { min: 0 }),
//     numberOfDecks: N(0, { min: 0 }),
//     numberOfCabins: N(0, { min: 0 }),
//     cabinTypes: S({ trim: true }),

//     departurePort: S({ trim: true }),
//     destinationPort: S({ trim: true }),
//     cruiseDuration: S({ trim: true }),
//     embarkationTime: S({ trim: true }),

//     amenities: A(),

//     policies: section({
//       cancellation: S(),
//       refund: S(),
//       child: S(),
//       infant: S(),
//       passengerEligibility: S(),
//       baggage: S(),
//       passportVisa: S(),
//       checkIn: S(),
//       medical: S(),
//       specialRequirements: S(),
//     }),

//     contact: section({
//       contactPerson: S({ trim: true }),
//       businessEmail: S({ lowercase: true, trim: true }),
//       businessPhone: S({ trim: true }),
//     }),

//     media: section({
//       logo: S(),
//       coverImage: S(),
//       images: A(),
//       videos: A(),
//     }),

//     documents: section({
//       maritimeLicenseNumber: S(),
//       portAuthorityPermit: S(),
//       safetyManagementCertificate: S(),
//       insurancePolicyNumber: S(),
//     }),
//   },
//   { _id: false }
// );

// /* ------------------ TOURS / PACKAGES ------------------ */

// const packageDetailsSchema = new Schema(
//   {
//     basic: section({
//       tagline: S(),
//       yearsInBusiness: N(null),
//       teamSize: N(null),
//       languages: S(),
//       supportPhone: S(),
//       supportEmail: S({ lowercase: true, trim: true }),
//       description: S(),
//     }),

//     classification: section({
//       operatingRegion: S(),
//       packageCategories: A(),
//       tourStyles: A(),
//       destinationsCovered: S(),
//     }),

//     inventory: section({
//       activePackages: N(null),
//       departureCities: S(),
//       typicalDurations: S(),
//       startingPrice: N(null),
//       minGroupSize: N(null),
//       maxGroupSize: N(null),
//       hasOwnTransport: B(),
//       guidesAvailable: B(),
//     }),

//     amenities: section({ services: A() }),

//     policies: section({
//       cancellationPolicy: S(),
//       refundPolicy: S(),
//       paymentPolicy: S(),
//       childPolicy: S(),
//       exclusions: S(),
//       termsAndConditions: S(),
//     }),

//     media: section({ ...mediaFields, brochureUrl: S() }),

//     documents: section({
//       tourismLicenseNumber: S(),
//       iataNumber: S(),
//       insurancePolicyNumber: S(),
//       registrationLicenseNumber: S(),
//     }),
//   },
//   { _id: false }
// );

// /* -------------------- ACTIVITIES -------------------- */

// const activityDetailsSchema = new Schema(
//   {
//     basic: section({
//       tagline: S(),
//       yearsInBusiness: N(null),
//       languages: S(),
//       supportPhone: S(),
//       meetingPoint: S(),
//       description: S(),
//     }),

//     classification: section({
//       activityCategories: A(),
//       difficultyLevel: S(),
//       experienceType: S(),
//       setting: S(),
//     }),

//     inventory: section({
//       totalActivities: N(null),
//       maxParticipantsPerSlot: N(null),
//       slotsPerDay: N(null),
//       durationMinutes: N(null),
//       minAge: N(null),
//       maxAge: N(null),
//       startingPrice: N(null),
//       operatingMonths: S(),
//       openingTime: S(),
//       closingTime: S(),
//       pickupAvailable: B(),
//       privateBookingAvailable: B(),
//     }),

//     amenities: section({ facilities: A() }),

//     policies: section({
//       cancellationPolicy: S(),
//       refundPolicy: S(),
//       safetyRules: S(),
//       healthRestrictions: S(),
//       weatherPolicy: S(),
//       whatToBring: S(),
//     }),

//     media: section(mediaFields),

//     documents: section({
//       activityLicenseNumber: S(),
//       safetyCertificateNumber: S(),
//       insurancePolicyNumber: S(),
//       instructorCertification: S(),
//       forestPermitNumber: S(),
//     }),
//   },
//   { _id: false }
// );

// /* ---------------------- EVENTS ---------------------- */

// const eventDetailsSchema = new Schema(
//   {
//     basic: section({
//       tagline: S(),
//       yearsInBusiness: N(null),
//       eventsHosted: N(null),
//       supportPhone: S(),
//       instagram: S(),
//       description: S(),
//     }),

//     classification: section({
//       eventCategories: A(),
//       venueType: S(),
//       ageRestriction: S(),
//     }),

//     inventory: section({
//       venueName: S(),
//       venueCapacity: N(null),
//       seatingType: S(),
//       eventsPerMonth: N(null),
//       ticketPriceFrom: N(null),
//       parkingCapacity: N(null),
//       hasTicketTiers: B(),
//       hasTableBooking: B(),
//     }),

//     amenities: section({ facilities: A() }),

//     policies: section({
//       cancellationPolicy: S(),
//       refundPolicy: S(),
//       entryPolicy: S(),
//       reschedulePolicy: S(),
//       dressCode: S(),
//       prohibitedItems: S(),
//     }),

//     media: section(mediaFields),

//     documents: section({
//       eventPermitNumber: S(),
//       venueLicenseNumber: S(),
//       entertainmentLicenseNumber: S(),
//       fireNocNumber: S(),
//       liquorLicenseNumber: S(),
//     }),
//   },
//   { _id: false }
// );

// /* ---------------------- DARSHAN ---------------------- */

// const darshanDetailsSchema = new Schema(
//   {
//     basic: section({
//       mainDeity: S(),
//       tradition: S(),
//       establishedYear: N(null),
//       supportPhone: S(),
//       description: S(),
//     }),

//     classification: section({
//       placeType: S(),
//       serviceCategories: A(),
//       accessLevel: S(),
//     }),

//     inventory: section({
//       openingTime: S(),
//       closingTime: S(),
//       closedDays: S(),
//       dailyCapacity: N(null),
//       slotDurationMinutes: N(null),
//       startingPrice: N(null),
//       freeDarshanAvailable: B(),
//       vipDarshanAvailable: B(),
//       seniorCitizenSlots: B(),
//       wheelchairAssistance: B(),
//     }),

//     amenities: section({ facilities: A() }),

//     policies: section({
//       cancellationPolicy: S(),
//       refundPolicy: S(),
//       dressCode: S(),
//       cameraPolicy: S(),
//       idRequirement: S(),
//       entryRules: S(),
//       specialDaysNote: S(),
//     }),

//     media: section(mediaFields),

//     documents: section({
//       trustRegistrationNumber: S(),
//       templeAuthorityPermission: S(),
//       section80gNumber: S(),
//       fcraNumber: S(),
//     }),
//   },
//   { _id: false }
// );

// /* =========================================================
//    MAIN VENDOR SCHEMA
// ========================================================= */

// const vendorSchema = new Schema(
//   {
//     /* =====================================================
//        ACCOUNT
//     ===================================================== */

//     name: S({ trim: true }),
//     email: S({ lowercase: true, trim: true }),
//     phone: S({ trim: true }),
//     password: S({ select: false }),
//     profileImage: S(),

//     /* =====================================================
//        ROLE / STAFF / RBAC
//     ===================================================== */

//     role: { type: String, enum: VENDOR_ROLES, default: "owner", index: true },

//     isOwnerAccount: B(true),

//     ownerVendor: {
//       type: Schema.Types.ObjectId,
//       ref: "Vendor",
//       default: null,
//       index: true,
//     },

//     permissions: [{ type: String, trim: true }],

//     permissionScope: {
//       type: permissionScopeSchema,
//       default: () => ({
//         scopeType: "all",
//         verticals: [],
//         properties: [],
//         branches: [],
//       }),
//     },

//     canViewFinancialData: B(),
//     canManageStaff: B(),

//     approvalLimits: {
//       refundAmount: N(0, { min: 0 }),
//       discountPercent: N(0, { min: 0, max: 100 }),
//       payoutAmount: N(0, { min: 0 }),
//     },

//     /* =====================================================
//        BMT CONNECT MAIN VERTICAL
//     ===================================================== */

//     vertical: { type: String, enum: MAIN_VERTICALS, default: "", index: true },

//     selectedVertical: {
//       type: String,
//       enum: MAIN_VERTICALS,
//       default: "",
//       index: true,
//     },

//     /*
//       Stay parent vertical ke andar selected subtype.
//       Example: vertical "stay" + staySubtype "hotel"
//     */
//     staySubtype: {
//       type: String,
//       enum: STAY_SUBTYPES,
//       default: "",
//       index: true,
//     },

//     /* =====================================================
//        LEGACY / MULTIPLE SERVICES
//     ===================================================== */

//     services: [
//       {
//         type: String,
//         enum: [
//           // STAY
//           "hotel",
//           "homestay",
//           "resort",
//           "villa",
//           "apartment",
//           "guesthouse",
//           "hostel",
//           "camp",
//           "campsite",
//           "farmhouse",
//           "vacation-home",
//           "palace",
//           "motel",
//           "bnb",
//           "lodge",
//           "inn",
//           "serviced-apartment",

//           // TRANSPORT
//           "cab",
//           "car-rental",
//           "bike-rental",
//           "bus",

//           // TOURS
//           "holiday-package",
//           "packages",

//           // ACTIVITIES
//           "activities",

//           // EVENTS
//           "events",
//           "night-club",

//           // RELIGIOUS
//           "BMT Darshan",
//           "darshan",

//           // CRUISE
//           "cruise",

//           // OLD / LEGACY
//           "visa",
//           "travel-insurance",
//           "other",
//         ],
//       },
//     ],

//     service: S({ trim: true }),

//     /* =====================================================
//        COMPANY / BUSINESS
//     ===================================================== */

//     companyName: S({ trim: true }),
//     businessName: S({ trim: true }),
//     legalBusinessName: S({ trim: true }),

//     businessType: {
//       type: String,
//       enum: [
//         "",
//         "individual",
//         "individual-owner",
//         "sole-proprietorship",
//         "proprietorship",
//         "partnership",
//         "company",
//         "corporation",
//         "private-limited",
//         "public-limited",
//         "llp",
//         "agency",
//         "tour-operator",
//         "dmc",
//         "hotel-property-group",
//         "transport-operator",
//         "bus-operator",
//         "fleet-owner",
//         "activity-operator",
//         "event-organizer",
//         "cruise-operator",
//         "religious-darshan-operator",
//         "non-profit",
//         "government",
//         "other",
//       ],
//       default: "",
//     },

//     businessRegistrationNumber: S({ trim: true }),
//     businessLicenseNumber: S({ trim: true }),
//     businessDescription: S(),

//     /* =====================================================
//        BUSINESS CONTACT
//     ===================================================== */

//     businessEmail: S({ lowercase: true, trim: true }),
//     businessPhone: S({ trim: true }),
//     alternatePhone: S({ trim: true }),
//     whatsappNumber: S({ trim: true }),
//     communicationNumber: S({ trim: true }),
//     website: S({ trim: true }),
//     preferredLanguage: S({ default: "en" }),
//     preferredCurrency: S({ uppercase: true, trim: true }),
//     timezone: S({ trim: true }),

//     /* =====================================================
//        OWNER  (sent by frontend, previously dropped)
//     ===================================================== */

//     ownerName: S({ trim: true }),
//     ownerEmail: S({ lowercase: true, trim: true }),
//     ownerPhone: S({ trim: true }),
//     ownerDesignation: S({ trim: true }),
//     ownerGovernmentIdType: S(),
//     ownerGovernmentIdNumber: S(),

//     /* =====================================================
//        ADDRESS
//     ===================================================== */

//     address: S(),
//     addressLine1: S(),
//     addressLine2: S(),
//     landmark: S(),
//     locality: S(),
//     city: S(),
//     district: S(),
//     state: S(),
//     province: S(),
//     region: S(),
//     country: S(),
//     countryCode: S({ uppercase: true, trim: true }),
//     pincode: S(),
//     postalCode: S({ trim: true }),

//     /* =====================================================
//        TAX - GLOBAL READY
//     ===================================================== */

//     taxType: {
//       type: String,
//       enum: ["", "gst", "vat", "sales-tax", "service-tax", "other", "not-registered"],
//       default: "",
//     },

//     taxRegistrationNumber: S({ trim: true }),
//     taxCertificate: S(),
//     taxCountry: S(),
//     taxName: S(),
//     taxId: S(),
//     vatNumber: S({ trim: true }),

//     gstNumber: S({ uppercase: true, trim: true }),
//     gstRegistrationNumber: S({ uppercase: true, trim: true }),
//     gstCertificate: S(),

//     panNumber: S({ uppercase: true, trim: true }),
//     panCardNumber: S({ uppercase: true, trim: true }),
//     panCard: S(),

//     /* =====================================================
//        GOVERNMENT ID / AADHAAR LEGACY
//     ===================================================== */

//     governmentIdType: S(),
//     governmentIdNumber: S(),
//     governmentIdFront: S(),
//     governmentIdBack: S(),

//     aadharNumber: S({ trim: true }),
//     aadharFront: S(),
//     aadharBack: S(),

//     /* =====================================================
//        BANK / PAYOUT
//     ===================================================== */

//     bankCountry: S(),
//     bankCurrency: S({ uppercase: true }),
//     settlementCurrency: S({ uppercase: true }),
//     accountHolderName: S(),
//     bankName: S(),
//     branchName: S(),
//     accountNumber: S(),
//     confirmAccountNumber: S(),
//     iban: S(),
//     swiftCode: S({ uppercase: true }),
//     routingNumber: S(),
//     ifscCode: S({ uppercase: true, trim: true }),
//     upiId: S(),
//     cancelledCheque: S(),
//     passbookImage: S(),

//     // legacy aliases accepted by signup optionalFields
//     bankAccountName: S(),
//     bankAccountNumber: S(),
//     bankSwiftCode: S(),
//     bankIban: S(),
//     bankIfscCode: S(),

//     /* =====================================================
//        GENERIC MEDIA / CONTRACT  (signup optionalFields)
//     ===================================================== */

//     logo: S(),
//     businessLogo: S(),
//     documents: { type: Schema.Types.Mixed, default: undefined },
//     media: { type: Schema.Types.Mixed, default: undefined },

//     contractAccepted: B(),
//     contractAcceptedAt: { type: Date, default: null },
//     termsAccepted: B(),
//     privacyAccepted: B(),
//     applicationMeta: { type: Schema.Types.Mixed, default: {} },

//     /* =====================================================
//        CAB / CAR RENTAL
//     ===================================================== */

//     carRentalDetails: {
//       businessModel: S(),
//       totalVehicles: N(0, { min: 0 }),
//       vehicleTypes: SA(),
//       serviceCities: SA(),
//       airportPickupAvailable: B(),
//       outstationAvailable: B(),
//       localRentalAvailable: B(),
//       driverProvided: B(),
//       selfDriveAvailable: B(),
//       transportLicenseNumber: S(),
//       licenseDocument: S(),
//     },

//     cabDetails: {
//       // 1. Owner Details
//       profilePhoto: S(),
//       panNumber: S({ uppercase: true, trim: true }),
//       aadhaarNumber: S({ trim: true }),
//       gstNumber: S({ uppercase: true, trim: true }),
//       alternatePhone: S({ trim: true }),

//       // 2. Cab Details
//       vehicleNumber: S({ uppercase: true, trim: true }),
//       vehicleType: S({ default: "Sedan" }),
//       vehicleMake: S(),
//       vehicleModel: S(),
//       manufacturingYear: S(),
//       fuelType: S({ default: "Petrol" }),
//       seatingCapacity: N(4),
//       acType: S({ default: "AC" }),
//       vehicleColor: S(),
//       rcNumber: S({ uppercase: true, trim: true }),
//       rcDocument: S(),
//       insurancePolicyNumber: S(),
//       insuranceDocument: S(),
//       insuranceExpiryDate: S(),
//       permitNumber: S(),
//       permitExpiryDate: S(),
//       vehiclePhotos: SA(),

//       // 3. Driver Details
//       isOwnerDriver: B(),
//       driverName: S(),
//       driverPhone: S(),
//       driverDob: S(),
//       drivingLicenceNumber: S({ uppercase: true, trim: true }),
//       licenceExpiryDate: S(),
//       licenceDocument: S(),
//       driverPhoto: S(),
//       experienceYears: S(),
//       policeVerificationDocument: S(),

//       // 4. Service / Location Details
//       operatingCity: S(),
//       operatingState: S(),
//       pickupLocation: S(),
//       serviceAreas: S(),
//       airportTransfer: B(),
//       outstationService: B(true),
//       localRentalService: B(true),

//       // 5. Bank / Payment Details
//       accountHolderName: S(),
//       bankName: S(),
//       accountNumber: S(),
//       ifscCode: S({ uppercase: true, trim: true }),
//       upiId: S(),
//       cancelledCheque: S(),

//       // 6. Documents
//       documents: {
//         ownerIdProof: S(),
//         panCard: S(),
//         rc: S(),
//         insurance: S(),
//         permit: S(),
//         drivingLicence: S(),
//         otherDocuments: SA(),
//       },
//     },

//     /* =====================================================
//        BUS
//     ===================================================== */

//     busDetails: {
//       operatorName: S(),
//       totalBuses: N(0, { min: 0 }),
//       busTypes: SA(),
//       operatingCities: SA(),
//       routes: SA(),
//       transportPermitNumber: S(),
//       transportPermitDocument: S(),
//       operatorLicenseNumber: S(),
//       operatorLicenseDocument: S(),
//     },

//     /* =====================================================
//        COMPLETE STAY / PROPERTY REGISTRATION

//        NOTE: Rooms, rate plans, date inventory & bookings
//        separate collections/models me hi rahenge.
//     ===================================================== */

//     stayDetails: {
//       /* ---- PROPERTY IDENTITY ---- */
//       propertyName: S({ trim: true }),
//       legalPropertyName: S({ trim: true }),
//       displayName: S({ trim: true }),
//       propertyType: { type: String, enum: STAY_SUBTYPES, default: "" },
//       propertySubType: S(),
//       totalProperties: N(1, { min: 0 }),
//       propertyTypes: SA(),
//       chainType: {
//         type: String,
//         enum: ["", "independent", "chain", "group"],
//         default: "independent",
//       },
//       chainName: S(),
//       brandName: S(),
//       shortDescription: S(),
//       description: S(),
//       website: S(),

//       /* ---- CONTACTS ---- */
//       contacts: [stayContactSchema],

//       /* ---- LOCATION ---- */
//       addressLine1: S(),
//       addressLine2: S(),
//       locality: S(),
//       landmark: S(),
//       city: S(),
//       district: S(),
//       state: S(),
//       province: S(),
//       region: S(),
//       postalCode: S(),
//       country: S(),
//       countryCode: S({ uppercase: true }),
//       timezone: S(),
//       latitude: N(null),
//       longitude: N(null),
//       mapPlaceId: S(),
//       operatingCities: SA(),

//       /* ---- CLASSIFICATION ---- */
//       classification: {
//         type: String,
//         enum: [
//           "",
//           "unrated",
//           "budget",
//           "1-star",
//           "2-star",
//           "3-star",
//           "4-star",
//           "5-star",
//           "luxury",
//           "premium",
//           "boutique",
//         ],
//         default: "",
//       },
//       starRating: N(0, { min: 0, max: 5 }),
//       officialStarRating: N(null, { min: 0, max: 5 }),
//       ratingAuthority: S(),
//       classificationCertificate: S(),
//       classificationCertificateNumber: S(),
//       classificationCertificateExpiry: { type: Date, default: null },

//       /* ---- PROPERTY SIZE ---- */
//       totalRooms: N(0, { min: 0 }),
//       totalUnits: N(0, { min: 0 }),
//       totalBeds: N(0, { min: 0 }),
//       totalFloors: N(0, { min: 0 }),
//       totalBuildings: N(1, { min: 0 }),
//       maximumGuests: N(0, { min: 0 }),
//       yearBuilt: N(null),
//       lastRenovatedYear: N(null),
//       propertyArea: N(null),
//       propertyAreaUnit: {
//         type: String,
//         enum: ["", "sq-ft", "sq-m", "acre", "hectare"],
//         default: "",
//       },

//       /* ---- CHECK-IN / CHECK-OUT ---- */
//       checkInFrom: S({ default: "14:00" }),
//       checkInUntil: S(),
//       checkOutFrom: S(),
//       checkOutUntil: S({ default: "11:00" }),
//       frontDesk24Hours: B(),
//       selfCheckIn: B(),
//       earlyCheckInAvailable: B(),
//       lateCheckOutAvailable: B(),
//       earlyCheckInFee: N(0, { min: 0 }),
//       lateCheckOutFee: N(0, { min: 0 }),
//       checkInInstructions: S(),
//       arrivalInstructions: S(),

//       /* ---- AMENITIES ---- */
//       amenities: SA(),
//       customAmenities: SA(),
//       wifiAvailable: B(),
//       freeWifi: B(),
//       wifiAreas: SA(),
//       parkingAvailable: B(),
//       parkingType: {
//         type: String,
//         enum: ["", "private", "public", "street", "valet"],
//         default: "",
//       },
//       parkingFree: B(),
//       parkingReservationRequired: B(),
//       parkingPrice: N(0),
//       restaurantAvailable: B(),
//       roomServiceAvailable: B(),
//       swimmingPoolAvailable: B(),
//       gymAvailable: B(),
//       spaAvailable: B(),
//       airportTransferAvailable: B(),
//       shuttleAvailable: B(),
//       elevatorAvailable: B(),
//       wheelchairAccessible: B(),
//       accessibleParking: B(),
//       accessibleRooms: B(),

//       /* ---- MEALS ---- */
//       breakfastAvailable: B(),
//       breakfastIncluded: B(),
//       breakfastTypes: SA(),
//       breakfastPriceAdult: N(0),
//       breakfastPriceChild: N(0),
//       lunchAvailable: B(),
//       dinnerAvailable: B(),
//       mealPlans: [
//         {
//           type: String,
//           enum: ["room-only", "breakfast", "half-board", "full-board", "all-inclusive"],
//         },
//       ],

//       /* ---- CHILDREN / BEDS ---- */
//       childrenAllowed: B(true),
//       childrenStayFree: B(),
//       freeChildStayMaxAge: N(null),
//       childMaxAge: N(17),
//       cribAvailable: B(),
//       cribPrice: N(0),
//       extraBedAvailable: B(),
//       extraBedAdultPrice: N(0),
//       extraBedChildPrice: N(0),

//       /* ---- PET ---- */
//       petsAllowed: B(),
//       petsOnRequest: B(),
//       petFeeType: {
//         type: String,
//         enum: ["", "free", "per-pet", "per-night", "per-stay"],
//         default: "",
//       },
//       petFee: N(0),
//       petPolicy: S(),

//       /* ---- HOUSE RULES ---- */
//       smokingAllowed: B(),
//       partiesAllowed: B(),
//       quietHoursEnabled: B(),
//       quietHoursFrom: S(),
//       quietHoursUntil: S(),
//       minimumCheckInAge: N(null),

//       /* ---- BOOKING POLICIES ---- */
//       cancellationPolicy: S(),
//       noShowPolicy: S(),
//       modificationPolicy: S(),
//       paymentPolicy: S(),
//       damageDepositRequired: B(),
//       damageDepositAmount: N(0),
//       damageDepositCurrency: S({ uppercase: true }),

//       /* ---- SAFETY ---- */
//       cctvAvailable: B(),
//       security24Hours: B(),
//       smokeDetector: B(),
//       fireExtinguisher: B(),
//       firstAidKit: B(),
//       emergencyExit: B(),
//       carbonMonoxideDetector: B(),
//       roomSafeAvailable: B(),

//       /* ---- LANGUAGES ---- */
//       staffLanguages: SA(),

//       /* ---- LICENSING ---- */
//       legallyRegistered: B(),
//       propertyRegistrationNumber: S(),
//       businessLicenseNumber: S(),
//       tourismLicenseNumber: S(),
//       fireSafetyCertificateNumber: S(),
//       foodLicenseNumber: S(),
//       propertyRegistrationDocument: S(),
//       businessLicenseDocument: S(),
//       tourismLicenseDocument: S(),
//       fireSafetyDocument: S(),
//       foodLicenseDocument: S(),
//       otherLicenseDetails: S(),

//       /* ---- MEDIA ---- */
//       logo: S(),
//       coverImage: S(),
//       propertyImages: SA(),
//       exteriorImages: SA(),
//       lobbyImages: SA(),
//       facilityImages: SA(),
//       restaurantImages: SA(),
//       poolImages: SA(),
//       videos: SA(),

//       /* ---- LANDMARKS ---- */
//       nearbyLandmarks: [landmarkSchema],
//       nearestAirportName: S(),
//       nearestAirportDistance: N(null),
//       nearestRailwayStationName: S(),
//       nearestRailwayStationDistance: N(null),

//       /* ---- CURRENCY ---- */
//       propertyCurrency: S({ uppercase: true }),
//       settlementCurrency: S({ uppercase: true }),

//       /* ---- BOOKING METHOD ---- */
//       instantBook: B(true),
//       requestToBook: B(),

//       /* ---- COMMERCIAL ---- */
//       commissionModel: {
//         type: String,
//         enum: ["", "percentage", "fixed", "hybrid"],
//         default: "",
//       },
//       commissionRate: N(0, { min: 0 }),

//       /* ---- SUSTAINABILITY ---- */
//       recyclingProgram: B(),
//       reducedSingleUsePlastic: B(),
//       renewableEnergy: B(),
//       waterSavingProgram: B(),
//       localSourcing: B(),
//       sustainabilityCertification: S(),

//       /* ---- MARKETPLACE STATUS ---- */
//       isPublished: B(),
//       isTemporarilyClosed: B(),
//       temporarilyClosedUntil: { type: Date, default: null },

//       /* ---- EXTERNAL CHANNEL IDS ---- */
//       externalPropertyIds: [externalPropertySchema],
//     },

//     /* =====================================================
//        CRUISE / TOURS / ACTIVITIES / EVENTS / DARSHAN

//        default: undefined => Stay / Bus / Cab vendors ke
//        document me faltu empty details nahi banengi.
//     ===================================================== */

//     cruiseDetails: { type: cruiseDetailsSchema, default: undefined },
//     packageDetails: { type: packageDetailsSchema, default: undefined },
//     activityDetails: { type: activityDetailsSchema, default: undefined },
//     eventDetails: { type: eventDetailsSchema, default: undefined },
//     darshanDetails: { type: darshanDetailsSchema, default: undefined },

//     /* =====================================================
//        NIGHTCLUB LEGACY
//     ===================================================== */

//     nightClubDetails: {
//       venueName: S({ trim: true }),
//       venueType: {
//         type: String,
//         enum: ["", "indoor", "outdoor", "rooftop", "beach", "banquet", "other"],
//         default: "",
//       },
//       totalCapacity: N(0),
//       operatingCities: SA(),
//       musicGenres: SA(),
//       ageLimit: N(18),
//       entryFeeType: {
//         type: String,
//         enum: ["", "free", "cover-charge", "ticketed", "couple-entry"],
//         default: "",
//       },
//       averageEntryFee: N(0),
//       dressCodeRequired: B(),
//       dressCodeDetails: S(),
//       operatingDays: SA(),
//       openingTime: S(),
//       closingTime: S(),
//       alcoholServed: B(),
//       alcoholLicenseNumber: S(),
//       alcoholLicenseDocument: S(),
//       excisePermitNumber: S(),
//       excisePermitDocument: S(),
//       fireSafetyCertificate: S(),
//       parkingAvailable: B(),
//       valetAvailable: B(),
//       vipSectionAvailable: B(),
//       privateBoothsAvailable: B(),
//       danceFloorAvailable: B(true),
//       liveDjAvailable: B(),
//       liveBandAvailable: B(),
//       smokingAreaAvailable: B(),
//       stagPolicy: {
//         type: String,
//         enum: ["", "allowed", "not-allowed", "with-conditions"],
//         default: "",
//       },
//       venueImages: SA(),
//     },

//     /* =====================================================
//        ONBOARDING
//     ===================================================== */

//     onboardingStatus: {
//       type: String,
//       enum: [
//         "not_started",
//         "in_progress",
//         "submitted",
//         "under_review",
//         "verification_required",
//         "approved",
//         "rejected",
//         "active",
//       ],
//       default: "not_started",
//       index: true,
//     },

//     onboardingComplete: { type: Boolean, default: false, index: true },
//     onboardingStep: N(1, { min: 1 }),
//     onboardingProgress: N(0, { min: 0, max: 100 }),
//     onboardingSubmittedAt: { type: Date, default: null },
//     onboardingApprovedAt: { type: Date, default: null },
//     onboardingRejectedAt: { type: Date, default: null },
//     onboardingRejectionReason: S(),
//     missingOnboardingFields: SA(),

//     /* =====================================================
//        VERIFICATION
//     ===================================================== */

//     isEmailVerified: B(),
//     isPhoneVerified: B(),

//     kycStatus: {
//       type: String,
//       enum: [
//         "not_started",
//         "pending",
//         "under_review",
//         "verified",
//         "rejected",
//         "additional_information_required",
//       ],
//       default: "not_started",
//     },

//     /* =====================================================
//        ADMIN APPROVAL
//     ===================================================== */

//     status: {
//       type: String,
//       enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
//       default: "PENDING",
//       index: true,
//     },

//     isApproved: B(),

//     approvedBy: {
//       type: Schema.Types.ObjectId,
//       ref: "Admin",
//       default: null,
//     },

//     approvedAt: { type: Date, default: null },
//     rejectionReason: S(),

//     /* =====================================================
//        ACCOUNT STATUS
//     ===================================================== */

//     accountStatus: {
//       type: String,
//       enum: ["active", "suspended", "blocked", "locked"],
//       default: "active",
//       index: true,
//     },

//     isActive: B(true),

//     /* =====================================================
//        SECURITY
//     ===================================================== */

//     mustChangePassword: B(),
//     loginAttempts: N(0, { min: 0 }),
//     lockedUntil: { type: Date, default: null },
//     lastLogin: { type: Date, default: null },
//     lastLoginIp: S(),
//     lastLoginUserAgent: S(),
//     loginHistory: [loginHistorySchema],
//     passwordChangedAt: { type: Date, default: null },
//     refreshToken: S({ select: false }),

//     /* =====================================================
//        AUDIT
//     ===================================================== */

//     createdBy: { type: Schema.Types.ObjectId, default: null },
//     updatedBy: { type: Schema.Types.ObjectId, default: null },
//   },
//   {
//     timestamps: true,
//     minimize: false,
//   }
// );

// /* =========================================================
//    INDEXES

//    email/phone field par unique:true nahi diya hai.
//    Index ek hi jagah define kar rahe hain,
//    duplicate index warning avoid karne ke liye.
// ========================================================= */

// vendorSchema.index({ email: 1 }, { unique: true, sparse: true });
// vendorSchema.index({ phone: 1 }, { unique: true, sparse: true });
// vendorSchema.index({ services: 1 });
// vendorSchema.index({ vertical: 1, staySubtype: 1 });
// vendorSchema.index({ ownerVendor: 1, role: 1 });
// vendorSchema.index({ onboardingStatus: 1, onboardingComplete: 1 });
// vendorSchema.index({ status: 1, isActive: 1 });
// vendorSchema.index({ "stayDetails.countryCode": 1, "stayDetails.city": 1 });
// vendorSchema.index({
//   "stayDetails.propertyName": "text",
//   businessName: "text",
//   companyName: "text",
//   city: "text",
// });

// /* =========================================================
//    PRE-VALIDATION: Stay subtype consistency
// ========================================================= */

// vendorSchema.pre("validate", function () {
//   if (this.vertical && this.vertical !== "stay") {
//     this.staySubtype = "";
//   }

//   if (
//     this.vertical === "stay" &&
//     !this.staySubtype &&
//     this.stayDetails?.propertyType
//   ) {
//     this.staySubtype = this.stayDetails.propertyType;
//   }

//   if (
//     this.vertical === "stay" &&
//     this.staySubtype &&
//     this.stayDetails &&
//     !this.stayDetails.propertyType
//   ) {
//     this.stayDetails.propertyType = this.staySubtype;
//   }
// });

// /* =========================================================
//    METHODS
// ========================================================= */

// vendorSchema.methods.hasPermission = function (permission) {
//   /*
//     Owner account ko apne vendor account ke andar
//     complete access milta hai.

//     Platform Admin is model se handle nahi karna.
//     Platform Admin ka separate Admin model/middleware
//     hona chahiye.
//   */
//   if (this.role === "owner" && this.isOwnerAccount) {
//     return true;
//   }

//   return Array.isArray(this.permissions) && this.permissions.includes(permission);
// };

// vendorSchema.methods.canAccessVertical = function (vertical) {
//   if (!vertical) {
//     return false;
//   }

//   if (this.vertical === vertical || this.selectedVertical === vertical) {
//     return true;
//   }

//   return (this.permissionScope?.verticals || []).includes(vertical);
// };

// vendorSchema.methods.canAccessStaySubtype = function (subtype) {
//   return this.vertical === "stay" && this.staySubtype === subtype;
// };

// /* =========================================================
//    EXPORT
// ========================================================= */

// module.exports = mongoose.model("Vendor", vendorSchema);

const mongoose = require("mongoose");

const { Schema } = mongoose;

/* =========================================================
   SHORT FIELD HELPERS
========================================================= */

const S = (o = {}) => ({ type: String, default: "", ...o });
const N = (def = 0, o = {}) => ({ type: Number, default: def, ...o });
const B = (def = false) => ({ type: Boolean, default: def });
const SA = () => [{ type: String }];
const A = () => ({ type: [String], default: [] });

/* Sub-document with all defaults filled */
const section = (fields) => ({
  type: new Schema(fields, { _id: false }),
  default: () => ({}),
});

/* Optional sub-document (default undefined => faltu empty docs nahi banenge) */
const osection = (fields) => ({
  type: new Schema(fields, { _id: false }),
  default: undefined,
});

/* =========================================================
   CONSTANTS
========================================================= */

const MAIN_VERTICALS = [
  "",
  "stay",
  "bus",
  "cab",
  "packages",
  "activities",
  "events",
  "darshan",
  "cruise",
];

const STAY_SUBTYPES = [
  "",
  "hotel",
  "resort",
  "homestay",
  "villa",
  "apartment",
  "guesthouse",
  "hostel",
  "motel",
  "vacation-home",
  "palace",
  "campsite",
  "camp",
  "farmhouse",
  "bnb",
  "lodge",
  "inn",
  "serviced-apartment",
  "holiday-park",
  "unique-stay",
  "other",
];

const VENDOR_ROLES = [
  "owner",
  "general_manager",
  "operations_manager",
  "booking_manager",
  "reservation_executive",
  "front_desk",
  "property_manager",
  "housekeeping",
  "finance_manager",
  "accountant",
  "sales_manager",
  "marketing_manager",
  "bus_operations_manager",
  "fleet_manager",
  "transport_coordinator",
  "tour_manager",
  "activity_manager",
  "event_manager",
  "cruise_operations_manager",
  "darshan_operations_manager",
  "customer_support",
  "read_only",
  "custom",
];

/* =========================================================
   PERMISSION SCOPE
========================================================= */

const permissionScopeSchema = new Schema(
  {
    scopeType: {
      type: String,
      enum: ["all", "vertical", "property", "branch", "assigned"],
      default: "all",
    },
    verticals: [{ type: String, enum: MAIN_VERTICALS }],
    properties: [{ type: Schema.Types.ObjectId }],
    branches: [{ type: Schema.Types.ObjectId }],
  },
  { _id: false }
);

/* =========================================================
   LOGIN SESSION HISTORY
========================================================= */

const loginHistorySchema = new Schema(
  {
    loginAt: { type: Date, default: Date.now },
    ip: S(),
    userAgent: S(),
    deviceId: S(),
    successful: B(true),
  },
  { _id: true }
);

/* =========================================================
   STAY CONTACT
========================================================= */

const stayContactSchema = new Schema(
  {
    contactType: {
      type: String,
      enum: [
        "primary",
        "reservation",
        "operations",
        "finance",
        "owner",
        "manager",
        "emergency",
        "other",
      ],
      default: "primary",
    },
    name: S({ trim: true }),
    designation: S({ trim: true }),
    email: S({ lowercase: true, trim: true }),
    countryCode: S({ trim: true }),
    phone: S({ trim: true }),
    whatsapp: S({ trim: true }),
    preferredLanguage: S({ default: "en" }),
  },
  { _id: true }
);

/* =========================================================
   NEARBY LANDMARK
========================================================= */

const landmarkSchema = new Schema(
  {
    name: S({ trim: true }),
    category: S({ trim: true }),
    distance: N(null),
    distanceUnit: { type: String, enum: ["m", "km", "mile"], default: "km" },
  },
  { _id: true }
);

/* =========================================================
   EXTERNAL PROPERTY ID
========================================================= */

const externalPropertySchema = new Schema(
  {
    provider: S({ trim: true }),
    propertyId: S({ trim: true }),
  },
  { _id: true }
);

/* =========================================================
   VERTICAL DETAILS: CRUISE / TOURS / ACTIVITIES / EVENTS /
   DARSHAN / BUS / CAB

   Enums intentionally NOT used so admin can add new options
   later without a backend deploy. Required-field rules live
   in the controller.
========================================================= */

const mediaFields = {
  propertyImages: A(),
  videos: A(),
  logo: S(),
  coverImage: S(),
};

/* media section used by bus / cab (brochureUrl included) */
const mediaSection = () =>
  osection({
    ...mediaFields,
    brochureUrl: S(),
  });

/* ---------------------- CRUISE ---------------------- */

const cruiseDetailsSchema = new Schema(
  {
    cruiseOperatorName: S({ trim: true }),
    cruiseLineName: S({ trim: true }),
    cruiseType: S({ trim: true }),
    cruiseOperatorType: S({ trim: true }),
    vesselType: S({ trim: true }),
    cruiseCategory: S({ trim: true }),
    cruiseExperience: S({ trim: true }),

    shipName: S({ trim: true }),
    imoNumber: S({ trim: true }),
    shipRegistrationNumber: S({ trim: true }),
    yearBuilt: N(null),
    passengerCapacity: N(0, { min: 0 }),
    crewCapacity: N(0, { min: 0 }),
    numberOfDecks: N(0, { min: 0 }),
    numberOfCabins: N(0, { min: 0 }),
    cabinTypes: S({ trim: true }),

    departurePort: S({ trim: true }),
    destinationPort: S({ trim: true }),
    cruiseDuration: S({ trim: true }),
    embarkationTime: S({ trim: true }),

    amenities: A(),

    policies: section({
      cancellation: S(),
      refund: S(),
      child: S(),
      infant: S(),
      passengerEligibility: S(),
      baggage: S(),
      passportVisa: S(),
      checkIn: S(),
      medical: S(),
      specialRequirements: S(),
    }),

    contact: section({
      contactPerson: S({ trim: true }),
      businessEmail: S({ lowercase: true, trim: true }),
      businessPhone: S({ trim: true }),
    }),

    media: section({
      logo: S(),
      coverImage: S(),
      images: A(),
      videos: A(),
    }),

    documents: section({
      maritimeLicenseNumber: S(),
      portAuthorityPermit: S(),
      safetyManagementCertificate: S(),
      insurancePolicyNumber: S(),
    }),
  },
  { _id: false }
);

/* ------------------ TOURS / PACKAGES ------------------ */

const packageDetailsSchema = new Schema(
  {
    basic: section({
      tagline: S(),
      yearsInBusiness: N(null),
      teamSize: N(null),
      languages: S(),
      supportPhone: S(),
      supportEmail: S({ lowercase: true, trim: true }),
      description: S(),
    }),

    classification: section({
      operatingRegion: S(),
      packageCategories: A(),
      tourStyles: A(),
      destinationsCovered: S(),
    }),

    inventory: section({
      activePackages: N(null),
      departureCities: S(),
      typicalDurations: S(),
      startingPrice: N(null),
      minGroupSize: N(null),
      maxGroupSize: N(null),
      hasOwnTransport: B(),
      guidesAvailable: B(),
    }),

    amenities: section({ services: A() }),

    policies: section({
      cancellationPolicy: S(),
      refundPolicy: S(),
      paymentPolicy: S(),
      childPolicy: S(),
      exclusions: S(),
      termsAndConditions: S(),
    }),

    media: section({ ...mediaFields, brochureUrl: S() }),

    documents: section({
      tourismLicenseNumber: S(),
      iataNumber: S(),
      insurancePolicyNumber: S(),
      registrationLicenseNumber: S(),
    }),
  },
  { _id: false }
);

/* -------------------- ACTIVITIES -------------------- */

const activityDetailsSchema = new Schema(
  {
    basic: section({
      tagline: S(),
      yearsInBusiness: N(null),
      languages: S(),
      supportPhone: S(),
      meetingPoint: S(),
      description: S(),
    }),

    classification: section({
      activityCategories: A(),
      difficultyLevel: S(),
      experienceType: S(),
      setting: S(),
    }),

    inventory: section({
      totalActivities: N(null),
      maxParticipantsPerSlot: N(null),
      slotsPerDay: N(null),
      durationMinutes: N(null),
      minAge: N(null),
      maxAge: N(null),
      startingPrice: N(null),
      operatingMonths: S(),
      openingTime: S(),
      closingTime: S(),
      pickupAvailable: B(),
      privateBookingAvailable: B(),
    }),

    amenities: section({ facilities: A() }),

    policies: section({
      cancellationPolicy: S(),
      refundPolicy: S(),
      safetyRules: S(),
      healthRestrictions: S(),
      weatherPolicy: S(),
      whatToBring: S(),
    }),

    media: section(mediaFields),

    documents: section({
      activityLicenseNumber: S(),
      safetyCertificateNumber: S(),
      insurancePolicyNumber: S(),
      instructorCertification: S(),
      forestPermitNumber: S(),
    }),
  },
  { _id: false }
);

/* ---------------------- EVENTS ---------------------- */

const eventDetailsSchema = new Schema(
  {
    basic: section({
      tagline: S(),
      yearsInBusiness: N(null),
      eventsHosted: N(null),
      supportPhone: S(),
      instagram: S(),
      description: S(),
    }),

    classification: section({
      eventCategories: A(),
      venueType: S(),
      ageRestriction: S(),
    }),

    inventory: section({
      venueName: S(),
      venueCapacity: N(null),
      seatingType: S(),
      eventsPerMonth: N(null),
      ticketPriceFrom: N(null),
      parkingCapacity: N(null),
      hasTicketTiers: B(),
      hasTableBooking: B(),
    }),

    amenities: section({ facilities: A() }),

    policies: section({
      cancellationPolicy: S(),
      refundPolicy: S(),
      entryPolicy: S(),
      reschedulePolicy: S(),
      dressCode: S(),
      prohibitedItems: S(),
    }),

    media: section(mediaFields),

    documents: section({
      eventPermitNumber: S(),
      venueLicenseNumber: S(),
      entertainmentLicenseNumber: S(),
      fireNocNumber: S(),
      liquorLicenseNumber: S(),
    }),
  },
  { _id: false }
);

/* ---------------------- DARSHAN ---------------------- */

const darshanDetailsSchema = new Schema(
  {
    basic: section({
      mainDeity: S(),
      tradition: S(),
      establishedYear: N(null),
      supportPhone: S(),
      description: S(),
    }),

    classification: section({
      placeType: S(),
      serviceCategories: A(),
      accessLevel: S(),
    }),

    inventory: section({
      openingTime: S(),
      closingTime: S(),
      closedDays: S(),
      dailyCapacity: N(null),
      slotDurationMinutes: N(null),
      startingPrice: N(null),
      freeDarshanAvailable: B(),
      vipDarshanAvailable: B(),
      seniorCitizenSlots: B(),
      wheelchairAssistance: B(),
    }),

    amenities: section({ facilities: A() }),

    policies: section({
      cancellationPolicy: S(),
      refundPolicy: S(),
      dressCode: S(),
      cameraPolicy: S(),
      idRequirement: S(),
      entryRules: S(),
      specialDaysNote: S(),
    }),

    media: section(mediaFields),

    documents: section({
      trustRegistrationNumber: S(),
      templeAuthorityPermission: S(),
      section80gNumber: S(),
      fcraNumber: S(),
    }),
  },
  { _id: false }
);

/* ---------------------- BUS (grouped, frontend payload) ---------------------- */

const busGrouped = {
  basic: osection({
    tagline: S(),
    yearsInBusiness: N(null),
    fleetSize: N(null),
    operatingRegions: S(),
    supportPhone: S(),
    description: S(),
  }),

  classification: osection({
    busTypes: A(),
    operationType: S(),
    permitType: S(),
  }),

  inventory: osection({
    totalBuses: N(null),
    avgSeatsPerBus: N(null),
    popularRoutes: S(),
    departureCities: S(),
    boardingPoints: S(),
    startingFare: N(null),
    ownDrivers: B(),
    gpsTracking: B(),
    womenSeats: B(),
    onlineBooking: B(),
  }),

  amenities: osection({ amenities: A() }),

  policies: osection({
    cancellationPolicy: S(),
    refundPolicy: S(),
    luggagePolicy: S(),
    boardingPolicy: S(),
    childPolicy: S(),
    delayPolicy: S(),
  }),

  media: mediaSection(),

  documents: osection({
    busPermitNumber: S(),
    rcNumber: S(),
    fitnessCertificateNumber: S(),
    insurancePolicyNumber: S(),
    pucNumber: S(),
    operatorLicenseNumber: S(),
  }),
};

/* ---------------------- CAB (grouped, frontend payload) ---------------------- */

const cabGrouped = {
  basic: osection({
    tagline: S(),
    yearsInBusiness: N(null),
    fleetSize: N(null),
    serviceCities: S(),
    supportPhone: S(),
    description: S(),
  }),

  classification: osection({
    vehicleCategories: A(),
    serviceTypes: A(),
    fuelTypes: A(),
  }),

  inventory: osection({
    totalVehicles: N(null),
    totalDrivers: N(null),
    serviceAreas: S(),
    baseFarePerKm: N(null),
    minimumFare: N(null),
    driverAllowancePerDay: N(null),
    freeWaitingMinutes: N(null),
    allAc: B(),
    available24x7: B(),
    carrierAvailable: B(),
    tollIncluded: B(),
  }),

  amenities: osection({ facilities: A() }),

  policies: osection({
    cancellationPolicy: S(),
    refundPolicy: S(),
    waitingChargePolicy: S(),
    nightChargePolicy: S(),
    tollParkingPolicy: S(),
    kmLimitPolicy: S(),
    safetyPolicy: S(),
  }),

  media: mediaSection(),
};

/* =========================================================
   MAIN VENDOR SCHEMA
========================================================= */

const vendorSchema = new Schema(
  {
    /* ===================== ACCOUNT ===================== */

    name: S({ trim: true }),
    email: S({ lowercase: true, trim: true }),
    phone: S({ trim: true }),
    password: S({ select: false }),
    profileImage: S(),

    /* ================= ROLE / STAFF / RBAC ================= */

    role: { type: String, enum: VENDOR_ROLES, default: "owner", index: true },

    isOwnerAccount: B(true),

    ownerVendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
      index: true,
    },

    permissions: [{ type: String, trim: true }],

    permissionScope: {
      type: permissionScopeSchema,
      default: () => ({
        scopeType: "all",
        verticals: [],
        properties: [],
        branches: [],
      }),
    },

    canViewFinancialData: B(),
    canManageStaff: B(),

    approvalLimits: {
      refundAmount: N(0, { min: 0 }),
      discountPercent: N(0, { min: 0, max: 100 }),
      payoutAmount: N(0, { min: 0 }),
    },

    /* ============ BMT CONNECT MAIN VERTICAL ============ */

    vertical: { type: String, enum: MAIN_VERTICALS, default: "", index: true },

    selectedVertical: {
      type: String,
      enum: MAIN_VERTICALS,
      default: "",
      index: true,
    },

    /* Stay parent vertical ke andar selected subtype. */
    staySubtype: {
      type: String,
      enum: STAY_SUBTYPES,
      default: "",
      index: true,
    },

    /* ========== LEGACY / MULTIPLE SERVICES ========== */

    services: [
      {
        type: String,
        enum: [
          // STAY
          "hotel",
          "homestay",
          "resort",
          "villa",
          "apartment",
          "guesthouse",
          "hostel",
          "camp",
          "campsite",
          "farmhouse",
          "vacation-home",
          "palace",
          "motel",
          "bnb",
          "lodge",
          "inn",
          "serviced-apartment",

          // TRANSPORT
          "cab",
          "car-rental",
          "bike-rental",
          "bus",

          // TOURS
          "holiday-package",
          "packages",

          // ACTIVITIES
          "activities",

          // EVENTS
          "events",
          "night-club",

          // RELIGIOUS
          "BMT Darshan",
          "darshan",

          // CRUISE
          "cruise",

          // OLD / LEGACY
          "visa",
          "travel-insurance",
          "other",
        ],
      },
    ],

    service: S({ trim: true }),

    /* ============ COMPANY / BUSINESS ============ */

    companyName: S({ trim: true }),
    businessName: S({ trim: true }),
    legalBusinessName: S({ trim: true }),

    businessType: {
      type: String,
      enum: [
        "",
        "individual",
        "individual-owner",
        "sole-proprietorship",
        "proprietorship",
        "partnership",
        "company",
        "corporation",
        "private-limited",
        "public-limited",
        "llp",
        "agency",
        "tour-operator",
        "dmc",
        "hotel-property-group",
        "transport-operator",
        "bus-operator",
        "fleet-owner",
        "activity-operator",
        "event-organizer",
        "cruise-operator",
        "religious-darshan-operator",
        "non-profit",
        "government",
        "other",
      ],
      default: "",
    },

    businessRegistrationNumber: S({ trim: true }),
    businessLicenseNumber: S({ trim: true }),
    businessDescription: S(),

    /* ============ BUSINESS CONTACT ============ */

    businessEmail: S({ lowercase: true, trim: true }),
    businessPhone: S({ trim: true }),
    alternatePhone: S({ trim: true }),
    whatsappNumber: S({ trim: true }),
    communicationNumber: S({ trim: true }),
    website: S({ trim: true }),
    preferredLanguage: S({ default: "en" }),
    preferredCurrency: S({ uppercase: true, trim: true }),
    timezone: S({ trim: true }),

    /* ================= OWNER ================= */

    ownerName: S({ trim: true }),
    ownerEmail: S({ lowercase: true, trim: true }),
    ownerPhone: S({ trim: true }),
    ownerDesignation: S({ trim: true }),
    ownerGovernmentIdType: S(),
    ownerGovernmentIdNumber: S(),

    /* ================= ADDRESS ================= */

    address: S(),
    addressLine1: S(),
    addressLine2: S(),
    landmark: S(),
    locality: S(),
    city: S(),
    district: S(),
    state: S(),
    province: S(),
    region: S(),
    country: S(),
    countryCode: S({ uppercase: true, trim: true }),
    pincode: S(),
    postalCode: S({ trim: true }),

    /* ============ TAX - GLOBAL READY ============ */

    taxType: {
      type: String,
      enum: ["", "gst", "vat", "sales-tax", "service-tax", "other", "not-registered"],
      default: "",
    },

    taxRegistrationNumber: S({ trim: true }),
    taxCertificate: S(),
    taxCountry: S(),
    taxName: S(),
    taxId: S(),
    vatNumber: S({ trim: true }),

    gstNumber: S({ uppercase: true, trim: true }),
    gstRegistrationNumber: S({ uppercase: true, trim: true }),
    gstCertificate: S(),

    panNumber: S({ uppercase: true, trim: true }),
    panCardNumber: S({ uppercase: true, trim: true }),
    panCard: S(),

    /* ====== GOVERNMENT ID / AADHAAR LEGACY ====== */

    governmentIdType: S(),
    governmentIdNumber: S(),
    governmentIdFront: S(),
    governmentIdBack: S(),

    aadharNumber: S({ trim: true }),
    aadharFront: S(),
    aadharBack: S(),

    /* ================= BANK / PAYOUT ================= */

    bankCountry: S(),
    bankCurrency: S({ uppercase: true }),
    settlementCurrency: S({ uppercase: true }),
    accountHolderName: S(),
    bankName: S(),
    branchName: S(),
    accountNumber: S(),
    confirmAccountNumber: S(),
    iban: S(),
    swiftCode: S({ uppercase: true }),
    routingNumber: S(),
    ifscCode: S({ uppercase: true, trim: true }),
    upiId: S(),
    cancelledCheque: S(),
    passbookImage: S(),

    // legacy aliases accepted by signup optionalFields
    bankAccountName: S(),
    bankAccountNumber: S(),
    bankSwiftCode: S(),
    bankIban: S(),
    bankIfscCode: S(),

    /* ====== GENERIC MEDIA / CONTRACT (signup) ====== */

    logo: S(),
    businessLogo: S(),
    documents: { type: Schema.Types.Mixed, default: undefined },
    media: { type: Schema.Types.Mixed, default: undefined },

    /*
      Onboarding me upload hui saari document files:
      { rcDoc: {name,type,size,url}, panCardDoc: {...}, govtIdFront: {...}, ... }
    */
    documentFiles: { type: Schema.Types.Mixed, default: {} },

    contractAccepted: B(),
    contractAcceptedAt: { type: Date, default: null },
    termsAccepted: B(),
    privacyAccepted: B(),
    applicationMeta: { type: Schema.Types.Mixed, default: {} },

    /* ================= CAB / CAR RENTAL ================= */

    carRentalDetails: {
      businessModel: S(),
      totalVehicles: N(0, { min: 0 }),
      vehicleTypes: SA(),
      serviceCities: SA(),
      airportPickupAvailable: B(),
      outstationAvailable: B(),
      localRentalAvailable: B(),
      driverProvided: B(),
      selfDriveAvailable: B(),
      transportLicenseNumber: S(),
      licenseDocument: S(),
    },

    cabDetails: {
      // 1. Owner Details
      profilePhoto: S(),
      panNumber: S({ uppercase: true, trim: true }),
      aadhaarNumber: S({ trim: true }),
      gstNumber: S({ uppercase: true, trim: true }),
      alternatePhone: S({ trim: true }),

      // 2. Cab Details
      vehicleNumber: S({ uppercase: true, trim: true }),
      vehicleType: S({ default: "Sedan" }),
      vehicleMake: S(),
      vehicleModel: S(),
      manufacturingYear: S(),
      fuelType: S({ default: "Petrol" }),
      seatingCapacity: N(4),
      acType: S({ default: "AC" }),
      vehicleColor: S(),
      rcNumber: S({ uppercase: true, trim: true }),
      rcDocument: S(),
      insurancePolicyNumber: S(),
      insuranceDocument: S(),
      insuranceExpiryDate: S(),
      permitNumber: S(),
      permitExpiryDate: S(),
      vehiclePhotos: SA(),

      // 3. Driver Details
      isOwnerDriver: B(),
      driverName: S(),
      driverPhone: S(),
      driverDob: S(),
      drivingLicenceNumber: S({ uppercase: true, trim: true }),
      licenceExpiryDate: S(),
      licenceDocument: S(),
      driverPhoto: S(),
      experienceYears: S(),
      policeVerificationDocument: S(),

      // 4. Service / Location Details
      operatingCity: S(),
      operatingState: S(),
      pickupLocation: S(),
      serviceAreas: S(),
      airportTransfer: B(),
      outstationService: B(true),
      localRentalService: B(true),

      // 5. Bank / Payment Details
      accountHolderName: S(),
      bankName: S(),
      accountNumber: S(),
      ifscCode: S({ uppercase: true, trim: true }),
      upiId: S(),
      cancelledCheque: S(),

      // 6. Documents (purane fields + onboarding ke number fields)
      documents: osection({
        ownerIdProof: S(),
        panCard: S(),
        rc: S(),
        insurance: S(),
        permit: S(),
        drivingLicence: S(),
        otherDocuments: SA(),

        rcNumber: S(),
        permitNumber: S(),
        insurancePolicyNumber: S(),
        fitnessCertificateNumber: S(),
        pucNumber: S(),
        driverLicenseNumber: S(),
      }),

      // 7. Onboarding grouped sections (basic / classification / inventory /
      //    amenities / policies / media)
      ...cabGrouped,
    },

    /* ======================= BUS ======================= */

    busDetails: {
      operatorName: S(),
      totalBuses: N(0, { min: 0 }),
      busTypes: SA(),
      operatingCities: SA(),
      routes: SA(),
      transportPermitNumber: S(),
      transportPermitDocument: S(),
      operatorLicenseNumber: S(),
      operatorLicenseDocument: S(),

      // Onboarding grouped sections
      ...busGrouped,
    },

    /* ============ COMPLETE STAY / PROPERTY REGISTRATION ============
       NOTE: Rooms, rate plans, date inventory & bookings
       separate collections/models me hi rahenge.
    ================================================================ */

    stayDetails: {
      /* ---- PROPERTY IDENTITY ---- */
      propertyName: S({ trim: true }),
      legalPropertyName: S({ trim: true }),
      displayName: S({ trim: true }),
      propertyType: { type: String, enum: STAY_SUBTYPES, default: "" },
      propertySubType: S(),
      totalProperties: N(1, { min: 0 }),
      propertyTypes: SA(),
      chainType: {
        type: String,
        enum: ["", "independent", "chain", "group"],
        default: "independent",
      },
      chainName: S(),
      brandName: S(),
      shortDescription: S(),
      description: S(),
      website: S(),

      /* ---- CONTACTS ---- */
      contacts: [stayContactSchema],

      /* ---- LOCATION ---- */
      addressLine1: S(),
      addressLine2: S(),
      locality: S(),
      landmark: S(),
      city: S(),
      district: S(),
      state: S(),
      province: S(),
      region: S(),
      postalCode: S(),
      country: S(),
      countryCode: S({ uppercase: true }),
      timezone: S(),
      latitude: N(null),
      longitude: N(null),
      mapPlaceId: S(),
      operatingCities: SA(),

      /* ---- CLASSIFICATION ---- */
      classification: {
        type: String,
        enum: [
          "",
          "unrated",
          "budget",
          "1-star",
          "2-star",
          "3-star",
          "4-star",
          "5-star",
          "luxury",
          "premium",
          "boutique",
        ],
        default: "",
      },
      starRating: N(0, { min: 0, max: 5 }),
      officialStarRating: N(null, { min: 0, max: 5 }),
      ratingAuthority: S(),
      classificationCertificate: S(),
      classificationCertificateNumber: S(),
      classificationCertificateExpiry: { type: Date, default: null },

      /* ---- PROPERTY SIZE ---- */
      totalRooms: N(0, { min: 0 }),
      totalUnits: N(0, { min: 0 }),
      totalBeds: N(0, { min: 0 }),
      totalFloors: N(0, { min: 0 }),
      totalBuildings: N(1, { min: 0 }),
      maximumGuests: N(0, { min: 0 }),
      yearBuilt: N(null),
      lastRenovatedYear: N(null),
      propertyArea: N(null),
      propertyAreaUnit: {
        type: String,
        enum: ["", "sq-ft", "sq-m", "acre", "hectare"],
        default: "",
      },

      /* ---- CHECK-IN / CHECK-OUT ---- */
      checkInFrom: S({ default: "14:00" }),
      checkInUntil: S(),
      checkOutFrom: S(),
      checkOutUntil: S({ default: "11:00" }),
      frontDesk24Hours: B(),
      selfCheckIn: B(),
      earlyCheckInAvailable: B(),
      lateCheckOutAvailable: B(),
      earlyCheckInFee: N(0, { min: 0 }),
      lateCheckOutFee: N(0, { min: 0 }),
      checkInInstructions: S(),
      arrivalInstructions: S(),

      /* ---- AMENITIES ---- */
      amenities: SA(),
      customAmenities: SA(),
      wifiAvailable: B(),
      freeWifi: B(),
      wifiAreas: SA(),
      parkingAvailable: B(),
      parkingType: {
        type: String,
        enum: ["", "private", "public", "street", "valet"],
        default: "",
      },
      parkingFree: B(),
      parkingReservationRequired: B(),
      parkingPrice: N(0),
      restaurantAvailable: B(),
      roomServiceAvailable: B(),
      swimmingPoolAvailable: B(),
      gymAvailable: B(),
      spaAvailable: B(),
      airportTransferAvailable: B(),
      shuttleAvailable: B(),
      elevatorAvailable: B(),
      wheelchairAccessible: B(),
      accessibleParking: B(),
      accessibleRooms: B(),

      /* ---- MEALS ---- */
      breakfastAvailable: B(),
      breakfastIncluded: B(),
      breakfastTypes: SA(),
      breakfastPriceAdult: N(0),
      breakfastPriceChild: N(0),
      lunchAvailable: B(),
      dinnerAvailable: B(),
      mealPlans: [
        {
          type: String,
          enum: ["room-only", "breakfast", "half-board", "full-board", "all-inclusive"],
        },
      ],

      /* ---- CHILDREN / BEDS ---- */
      childrenAllowed: B(true),
      childrenStayFree: B(),
      freeChildStayMaxAge: N(null),
      childMaxAge: N(17),
      cribAvailable: B(),
      cribPrice: N(0),
      extraBedAvailable: B(),
      extraBedAdultPrice: N(0),
      extraBedChildPrice: N(0),

      /* ---- PET ---- */
      petsAllowed: B(),
      petsOnRequest: B(),
      petFeeType: {
        type: String,
        enum: ["", "free", "per-pet", "per-night", "per-stay"],
        default: "",
      },
      petFee: N(0),
      petPolicy: S(),

      /* ---- HOUSE RULES ---- */
      smokingAllowed: B(),
      partiesAllowed: B(),
      quietHoursEnabled: B(),
      quietHoursFrom: S(),
      quietHoursUntil: S(),
      minimumCheckInAge: N(null),

      /* ---- BOOKING POLICIES ---- */
      cancellationPolicy: S(),
      noShowPolicy: S(),
      modificationPolicy: S(),
      paymentPolicy: S(),
      damageDepositRequired: B(),
      damageDepositAmount: N(0),
      damageDepositCurrency: S({ uppercase: true }),

      /* ---- SAFETY ---- */
      cctvAvailable: B(),
      security24Hours: B(),
      smokeDetector: B(),
      fireExtinguisher: B(),
      firstAidKit: B(),
      emergencyExit: B(),
      carbonMonoxideDetector: B(),
      roomSafeAvailable: B(),

      /* ---- LANGUAGES ---- */
      staffLanguages: SA(),

      /* ---- LICENSING ---- */
      legallyRegistered: B(),
      propertyRegistrationNumber: S(),
      businessLicenseNumber: S(),
      tourismLicenseNumber: S(),
      fireSafetyCertificateNumber: S(),
      foodLicenseNumber: S(),
      propertyRegistrationDocument: S(),
      businessLicenseDocument: S(),
      tourismLicenseDocument: S(),
      fireSafetyDocument: S(),
      foodLicenseDocument: S(),
      otherLicenseDetails: S(),

      /* ---- MEDIA ---- */
      logo: S(),
      coverImage: S(),
      propertyImages: SA(),
      exteriorImages: SA(),
      lobbyImages: SA(),
      facilityImages: SA(),
      restaurantImages: SA(),
      poolImages: SA(),
      videos: SA(),

      /* ---- LANDMARKS ---- */
      nearbyLandmarks: [landmarkSchema],
      nearestAirportName: S(),
      nearestAirportDistance: N(null),
      nearestRailwayStationName: S(),
      nearestRailwayStationDistance: N(null),

      /* ---- CURRENCY ---- */
      propertyCurrency: S({ uppercase: true }),
      settlementCurrency: S({ uppercase: true }),

      /* ---- BOOKING METHOD ---- */
      instantBook: B(true),
      requestToBook: B(),

      /* ---- COMMERCIAL ---- */
      commissionModel: {
        type: String,
        enum: ["", "percentage", "fixed", "hybrid"],
        default: "",
      },
      commissionRate: N(0, { min: 0 }),

      /* ---- SUSTAINABILITY ---- */
      recyclingProgram: B(),
      reducedSingleUsePlastic: B(),
      renewableEnergy: B(),
      waterSavingProgram: B(),
      localSourcing: B(),
      sustainabilityCertification: S(),

      /* ---- MARKETPLACE STATUS ---- */
      isPublished: B(),
      isTemporarilyClosed: B(),
      temporarilyClosedUntil: { type: Date, default: null },

      /* ---- EXTERNAL CHANNEL IDS ---- */
      externalPropertyIds: [externalPropertySchema],
    },

    /* ===== CRUISE / TOURS / ACTIVITIES / EVENTS / DARSHAN =====
       default: undefined => Stay / Bus / Cab vendors ke document me
       faltu empty details nahi banengi.
    =========================================================== */

    cruiseDetails: { type: cruiseDetailsSchema, default: undefined },
    packageDetails: { type: packageDetailsSchema, default: undefined },
    activityDetails: { type: activityDetailsSchema, default: undefined },
    eventDetails: { type: eventDetailsSchema, default: undefined },
    darshanDetails: { type: darshanDetailsSchema, default: undefined },

    /* ================= NIGHTCLUB LEGACY ================= */

    nightClubDetails: {
      venueName: S({ trim: true }),
      venueType: {
        type: String,
        enum: ["", "indoor", "outdoor", "rooftop", "beach", "banquet", "other"],
        default: "",
      },
      totalCapacity: N(0),
      operatingCities: SA(),
      musicGenres: SA(),
      ageLimit: N(18),
      entryFeeType: {
        type: String,
        enum: ["", "free", "cover-charge", "ticketed", "couple-entry"],
        default: "",
      },
      averageEntryFee: N(0),
      dressCodeRequired: B(),
      dressCodeDetails: S(),
      operatingDays: SA(),
      openingTime: S(),
      closingTime: S(),
      alcoholServed: B(),
      alcoholLicenseNumber: S(),
      alcoholLicenseDocument: S(),
      excisePermitNumber: S(),
      excisePermitDocument: S(),
      fireSafetyCertificate: S(),
      parkingAvailable: B(),
      valetAvailable: B(),
      vipSectionAvailable: B(),
      privateBoothsAvailable: B(),
      danceFloorAvailable: B(true),
      liveDjAvailable: B(),
      liveBandAvailable: B(),
      smokingAreaAvailable: B(),
      stagPolicy: {
        type: String,
        enum: ["", "allowed", "not-allowed", "with-conditions"],
        default: "",
      },
      venueImages: SA(),
    },

    /* ================= ONBOARDING ================= */

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
      index: true,
    },

    onboardingComplete: { type: Boolean, default: false, index: true },
    onboardingStep: N(1, { min: 1 }),
    onboardingProgress: N(0, { min: 0, max: 100 }),
    onboardingSubmittedAt: { type: Date, default: null },
    onboardingApprovedAt: { type: Date, default: null },
    onboardingRejectedAt: { type: Date, default: null },
    onboardingRejectionReason: S(),
    missingOnboardingFields: SA(),

    /* ================= VERIFICATION ================= */

    isEmailVerified: B(),
    isPhoneVerified: B(),

    kycStatus: {
      type: String,
      enum: [
        "not_started",
        "pending",
        "under_review",
        "verified",
        "rejected",
        "additional_information_required",
      ],
      default: "not_started",
    },

    /* ================= ADMIN APPROVAL ================= */

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
      index: true,
    },

    isApproved: B(),

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    approvedAt: { type: Date, default: null },
    rejectionReason: S(),

    /* ================= ACCOUNT STATUS ================= */

    accountStatus: {
      type: String,
      enum: ["active", "suspended", "blocked", "locked"],
      default: "active",
      index: true,
    },

    isActive: B(true),

    /* ================= SECURITY ================= */

    mustChangePassword: B(),
    loginAttempts: N(0, { min: 0 }),
    lockedUntil: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
    lastLoginIp: S(),
    lastLoginUserAgent: S(),
    loginHistory: [loginHistorySchema],
    passwordChangedAt: { type: Date, default: null },
    refreshToken: S({ select: false }),

    /* ================= AUDIT ================= */

    createdBy: { type: Schema.Types.ObjectId, default: null },
    updatedBy: { type: Schema.Types.ObjectId, default: null },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

/* =========================================================
   INDEXES
   email/phone par unique:true field me nahi diya,
   index ek hi jagah define (duplicate index warning se bachne ke liye).
========================================================= */

vendorSchema.index({ email: 1 }, { unique: true, sparse: true });
vendorSchema.index({ phone: 1 }, { unique: true, sparse: true });
vendorSchema.index({ services: 1 });
vendorSchema.index({ vertical: 1, staySubtype: 1 });
vendorSchema.index({ ownerVendor: 1, role: 1 });
vendorSchema.index({ onboardingStatus: 1, onboardingComplete: 1 });
vendorSchema.index({ status: 1, isActive: 1 });
vendorSchema.index({ "stayDetails.countryCode": 1, "stayDetails.city": 1 });
vendorSchema.index({
  "stayDetails.propertyName": "text",
  businessName: "text",
  companyName: "text",
  city: "text",
});

/* =========================================================
   PRE-VALIDATION: Stay subtype consistency
========================================================= */

vendorSchema.pre("validate", function () {
  if (this.vertical && this.vertical !== "stay") {
    this.staySubtype = "";
  }

  if (
    this.vertical === "stay" &&
    !this.staySubtype &&
    this.stayDetails?.propertyType
  ) {
    this.staySubtype = this.stayDetails.propertyType;
  }

  if (
    this.vertical === "stay" &&
    this.staySubtype &&
    this.stayDetails &&
    !this.stayDetails.propertyType
  ) {
    this.stayDetails.propertyType = this.staySubtype;
  }
});

/* =========================================================
   METHODS
========================================================= */

vendorSchema.methods.hasPermission = function (permission) {
  /* Owner account ko apne vendor account me complete access.
     Platform Admin alag Admin model/middleware se handle hoga. */
  if (this.role === "owner" && this.isOwnerAccount) {
    return true;
  }

  return Array.isArray(this.permissions) && this.permissions.includes(permission);
};

vendorSchema.methods.canAccessVertical = function (vertical) {
  if (!vertical) {
    return false;
  }

  if (this.vertical === vertical || this.selectedVertical === vertical) {
    return true;
  }

  return (this.permissionScope?.verticals || []).includes(vertical);
};

vendorSchema.methods.canAccessStaySubtype = function (subtype) {
  return this.vertical === "stay" && this.staySubtype === subtype;
};

/* =========================================================
   EXPORT
========================================================= */

module.exports = mongoose.model("Vendor", vendorSchema);