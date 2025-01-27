const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    organisation_uid: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roll_no: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "absent",
    },
    qr_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QRCode",
    },
    marked_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    marked_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
attendanceSchema.index({ organisation_uid: 1, user_id: 1, date: 1 });
attendanceSchema.index({ organisation_uid: 1, date: 1 });
attendanceSchema.index({ user_id: 1, date: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
