const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    organisation_uid: {
      type: String,
      required: true,
      ref: "Organization",
      field: "uid",
    },
    roll_no: {
      type: String,
      required: true,
    },
    attendance_date: {
      type: Date,
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    present: {
      type: Boolean,
      default: false,
    },
    scanned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    scanned_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound unique index on organisation_uid, roll_no, and attendance_date
qrCodeSchema.index(
  { organisation_uid: 1, roll_no: 1, attendance_date: 1 },
  { unique: true }
);

module.exports = mongoose.model("QRCode", qrCodeSchema);
