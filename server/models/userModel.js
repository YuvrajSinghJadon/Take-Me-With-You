import mongoose, { Schema } from "mongoose";

// User schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is Required!"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is Required!"],
    },
    email: {
      type: String,
      required: [true, "Email is Required!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is Required!"],
      minlength: [6, "Password length should be greater than 6 characters"],
      select: true,
    },
    userType: {
      type: String,
      enum: ["Traveller", "Native"],
      required: [true, "User Type is Required!"],
    },
    location: { type: String },
    profileUrl: { type: String },
    profession: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    views: [{ type: String }],
    verified: { type: Boolean, default: false },
    whatsappNumber: { type: String, required: true },
    groups: [{ type: Schema.Types.ObjectId, ref: "Groups" }],
    joinRequests: [
      {
        postId: { type: Schema.Types.ObjectId, ref: "Posts" }, // Reference to the post
        status: {
          type: String,
          enum: ["Pending", "Accepted", "Rejected"], // Status of the join request
          default: "Pending",
        },
      },
    ],
    expoPushToken: {
      type: String,
      default: null, // Stores the Expo Push Token for notifications
    },
    ratings: {
      averageRating: { type: Number, default: 0 },
      numberOfRatings: { type: Number, default: 0 },
    },
    reviews: [
      {
        reviewer: { type: Schema.Types.ObjectId, ref: "Users" },
        rating: { type: Number, required: true },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Users = mongoose.model("Users", userSchema);

export default Users;
