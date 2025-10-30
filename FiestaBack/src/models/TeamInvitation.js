import mongoose from "mongoose";
import crypto from "crypto";

const teamInvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "cancelled"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    acceptedAt: { type: Date },
    message: {
      type: String,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Generate token before save
teamInvitationSchema.pre("save", function (next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString("hex");
  }
  next();
});

teamInvitationSchema.index({ token: 1 });
teamInvitationSchema.index({ email: 1, venueId: 1, status: 1 });

export default mongoose.model("TeamInvitation", teamInvitationSchema);