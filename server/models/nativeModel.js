import mongoose, { Schema } from "mongoose";

// Native schema for local service providers
const nativeSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    city: { type: String },
    services: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          default: new mongoose.Types.ObjectId(),
        }, // Explicit _id field for each service
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        availability: { type: Boolean, default: true },
      },
    ],
    ratings: {
      averageRating: { type: Number, default: 0 },
      numberOfRatings: { type: Number, default: 0 },
    },
    bio: { type: String, maxlength: 500 },
    languages: [{ type: String }],
    reviews: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          default: new mongoose.Types.ObjectId(),
        }, // Explicit _id field for each review
        traveller: { type: Schema.Types.ObjectId, ref: "Users" },
        rating: { type: Number, required: true },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    earnings: {
      totalEarnings: { type: Number, default: 0 }, // Track total earnings
      upcomingPayments: { type: Number, default: 0 }, // Payments from confirmed but not completed bookings
    },
  },
  { timestamps: true }
);

const Natives = mongoose.model("Natives", nativeSchema);
export default Natives;
