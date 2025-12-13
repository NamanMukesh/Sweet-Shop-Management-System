import mongoose from "mongoose";

const sweetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sweet name is required"],
      trim: true,
      minlength: [2, "Sweet name must be at least 2 characters"],
      maxlength: [100, "Sweet name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: [
        "Chocolates",
        "Candies",
        "Cookies",
        "Cakes",
        "Ice Cream",
        "Desserts",
        "Traditional",
        "Other",
      ],
      default: "Other",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Price must be a positive number",
      },
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for search functionality
sweetSchema.index({ name: "text", category: "text" });
sweetSchema.index({ category: 1 });
sweetSchema.index({ price: 1 });

// Virtual for checking if sweet is in stock
sweetSchema.virtual("inStock").get(function () {
  return this.quantity > 0;
});

// Method to decrease quantity (for purchase)
sweetSchema.methods.decreaseQuantity = function (amount = 1) {
  if (this.quantity >= amount) {
    this.quantity -= amount;
    return true;
  }
  return false;
};

// Method to increase quantity (for restock)
sweetSchema.methods.increaseQuantity = function (amount = 1) {
  this.quantity += amount;
  return true;
};

// Ensure virtuals are included in JSON output
sweetSchema.set("toJSON", { virtuals: true });
sweetSchema.set("toObject", { virtuals: true });

const Sweet = mongoose.model("Sweet", sweetSchema);

export default Sweet;

