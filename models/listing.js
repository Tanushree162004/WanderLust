// creating database schema


const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,

  // after adding review schema

  reviews: [{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: "Review" ,
    }],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      default: "Point"
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

listingSchema.post ("findOneAndDelete", async (listing) => {
if (listing) {
await Review.deleteMany({ _id: { $in: listing.reviews } }) ;
}
}); 

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;