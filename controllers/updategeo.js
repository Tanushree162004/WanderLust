// const mongoose = require("mongoose");
// const { geocoding, config } = require("@maptiler/client");
// const Listing = require("../models/listing"); // Adjust path to your model

// config.apiKey = "AhxYCGa8xuMiifarnDle";

// async function updateListingsWithGeometry() {
//   try {
//     await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust"); // Replace with your DB

//     const listings = await Listing.find({
//       $or: [
//         { geometry: { $exists: false } },
//         { "geometry.coordinates": { $size: 0 } }
//       ]
//     });

//     console.log(`Found ${listings.length} listings to update.`);

//     for (let listing of listings) {
//       if (!listing.location) {
//         console.log(`Skipping listing without location: ${listing._id}`);
//         continue;
//       }

//       const geoRes = await geocoding.forward(listing.location, { limit: 1 });
//       const geo = geoRes.geometry;

//       if (geo) {
//         listing.geometry = geo;
//         await listing.save();
//         console.log(`Updated ${listing._id} (${listing.title}) with coordinates:`, geo.coordinates);
//       } else {
//         console.warn(`No geocoding result for: ${listing.location}`);
//       }
//     }

//     mongoose.connection.close();
//     console.log("✅ Done updating listings.");
//   } catch (err) {
//     console.error("❌ Error updating listings:", err);
//   }
// }

// updateListingsWithGeometry();

// update-geo.js

const mongoose = require("mongoose");
const { geocoding, config } = require("@maptiler/client");
const Listing = require("../models/listing"); // ✅ adjust path if needed

config.apiKey = "AhxYCGa8xuMiifarnDle";

const fallbackCoordinates = {
  "malibu": [-118.7798, 34.0259],
  "new york city": [-74.0060, 40.7128],
  "goa": [74.1240, 15.2993]
};

async function updateListingsWithGeometry() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

    const listings = await Listing.find({
      $or: [
        { geometry: { $exists: false } },
        { "geometry.coordinates": { $size: 0 } }
      ]
    });

    console.log(`Found ${listings.length} listings to update.`);

    for (let listing of listings) {
      const location = listing.location?.trim();

      if (!location) {
        console.log(`Skipping listing without location: ${listing._id}`);
        continue;
      }

      // Attempt geocoding
      const geoRes = await geocoding.forward(location, { limit: 1 });
      const geo = geoRes.geometry;

      if (geo) {
        listing.geometry = geo;
        console.log(`✅ Geocoded ${listing.title} → ${geo.coordinates}`);
      } else {
        const fallback = fallbackCoordinates[location.toLowerCase()];
        if (fallback) {
          listing.geometry = {
            type: "Point",
            coordinates: fallback
          };
          console.warn(`⚠️ Used fallback for ${listing.title}: ${fallback}`);
        } else {
          console.warn(`❌ No result for: ${location}`);
          continue;
        }
      }

      await listing.save();
    }

    mongoose.connection.close();
    console.log("✅ Done updating listings.");
  } catch (err) {
    console.error("❌ Error updating listings:", err);
  }
}

updateListingsWithGeometry();
