import mongoose from "mongoose";

const { Schema } = mongoose;

const bookingServiceSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true, // Index for faster queries
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: 10000000, // 10 triệu VND
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    bookingCount: {
      type: Number,
      default: 0,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    allowOnlineBooking: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Add indexes for better performance
    indexes: [
      { doctorId: 1, isActive: 1 },
      { category: 1, isActive: 1 },
      { price: 1 },
      { bookingCount: -1 }, // Most booked first
    ],
  }
);

// Virtual for formatted price
bookingServiceSchema.virtual("formattedPrice").get(function () {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(this.price);
});

// Virtual for formatted duration
bookingServiceSchema.virtual("formattedDuration").get(function () {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
});

// Static methods
bookingServiceSchema.statics.findByDoctor = function (
  doctorId,
  activeOnly = true
) {
  const query = { doctorId };
  if (activeOnly) query.isActive = true;
  return this.find(query).sort({ isPopular: -1, bookingCount: -1 });
};

bookingServiceSchema.statics.findByCategory = function (
  category,
  activeOnly = true
) {
  const query = { category };
  if (activeOnly) query.isActive = true;
  return this.find(query).populate("doctorId", "name specialty infoClinic");
};

bookingServiceSchema.statics.getPopularServices = function (limit = 10) {
  return this.find({ isActive: true, isPopular: true })
    .populate("doctorId", "name specialty rate infoClinic")
    .sort({ bookingCount: -1 })
    .limit(limit);
};

bookingServiceSchema.statics.searchServices = function (
  searchTerm,
  filters = {}
) {
  const { category, minPrice, maxPrice, doctorId, tags } = filters;

  let query = {
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { tags: { $in: [new RegExp(searchTerm, "i")] } },
    ],
  };

  if (category) query.category = category;
  if (doctorId) query.doctorId = doctorId;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  return this.find(query)
    .populate("doctorId", "name specialty rate infoClinic")
    .sort({ bookingCount: -1, isPopular: -1 });
};

// Instance methods
bookingServiceSchema.methods.incrementBooking = function () {
  this.bookingCount += 1;
  return this.save();
};

bookingServiceSchema.methods.toggleActive = function () {
  this.isActive = !this.isActive;
  return this.save();
};

bookingServiceSchema.methods.updatePopularity = function () {
  // Auto-set popular based on booking count and other factors
  this.isPopular = this.bookingCount >= 50;
  return this.save();
};

// Pre-save middleware
bookingServiceSchema.pre("save", function (next) {
  // Auto-set popular if booking count is high
  if (this.bookingCount >= 50) {
    this.isPopular = true;
  }
  next();
});

// Pre-remove middleware
bookingServiceSchema.pre("remove", function (next) {
  // You might want to check if there are any pending bookings
  // before allowing service deletion
  next();
});

const BookingService = mongoose.model("BookingService", bookingServiceSchema);
export default BookingService;
