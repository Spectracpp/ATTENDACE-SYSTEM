const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    organisation_uid: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    qr_data: {
      type: String,
      required: true,
    },
    expiry: {
      type: Date,
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scanned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    scan_time: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Create indexes for performance
qrCodeSchema.index({ organisation_uid: 1, user_id: 1 });
qrCodeSchema.index({ qr_data: 1 });
qrCodeSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired documents

const QRCode = mongoose.model("QRCode", qrCodeSchema);

module.exports = QRCode;
