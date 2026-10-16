
require("dotenv").config();
 
const mongoose = require("mongoose");
const Vendor = require("../models/Vendor.model");
 
const uri =
  process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
 
const findDuplicates = async (field) =>
  Vendor.aggregate([
    { $match: { [field]: { $type: "string", $gt: "" } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 }, ids: { $push: "$_id" } } },
    { $match: { count: { $gt: 1 } } },
  ]);
 
(async () => {
  if (!uri) {
    console.error(
      "No Mongo connection string found. Set MONGO_URI (or MONGODB_URI / DATABASE_URL) in .env"
    );
    process.exit(1);
  }
 
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
 
    const before = await Vendor.collection.indexes();
    console.log("\nIndexes BEFORE:");
    before.forEach((i) =>
      console.log(
        ` - ${i.name}  key=${JSON.stringify(i.key)}  unique=${!!i.unique}${
          i.sparse ? "  sparse" : ""
        }${i.partialFilterExpression ? "  partial" : ""}`
      )
    );
 
    for (const field of ["email", "phone"]) {
      const dups = await findDuplicates(field);
      if (dups.length) {
        console.log(`\nDuplicate "${field}" values found (fix these first):`);
        dups.forEach((d) =>
          console.log(` - ${d._id}  x${d.count}  ids=${d.ids.join(", ")}`)
        );
      }
    }
 
    const dropped = await Vendor.syncIndexes();
    console.log("\nDropped / replaced indexes:", dropped);
 
    const after = await Vendor.collection.indexes();
    console.log("\nIndexes AFTER:");
    after.forEach((i) =>
      console.log(
        ` - ${i.name}  key=${JSON.stringify(i.key)}  unique=${!!i.unique}${
          i.partialFilterExpression ? "  partial" : ""
        }`
      )
    );
 
    console.log("\nDone.");
  } catch (error) {
    console.error("\nFailed:", error.message);
    console.error(
      "If this is a duplicate-key error, delete/merge the duplicate vendors listed above and run again."
    );
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
 