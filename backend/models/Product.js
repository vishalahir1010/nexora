import mongoose from "mongoose";
import slugify from "slugify";

const variantSchema = new mongoose.Schema(
  {
    size: String,
    color: String,
    colorHex: String,
    stock: { type: Number, default: 0, min: 0 },
    sku: String,
    priceOverride: Number,
  },
  { _id: true }
);

const specSchema = new mongoose.Schema(
  { key: String, value: String },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    sku: { type: String, unique: true, required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    description: { type: String, required: true },
    shortDescription: String,
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    images: [{ url: String, publicId: String }],
    colors: [{ name: String, hex: String }],
    sizes: [String],
    variants: [variantSchema],
    stock: { type: Number, default: 0, min: 0 },
    specifications: [specSchema],
    tags: [String],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    ratingBreakdown: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 },
    },
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSaleEndsAt: Date,
    status: { type: String, enum: ["active", "draft", "archived"], default: "active" },
    lowStockThreshold: { type: Number, default: 5 },
  },
  { timestamps: true }
);

productSchema.pre("validate", function (next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + "-" + Math.random().toString(36).slice(2, 7);
  }
  next();
});

productSchema.virtual("finalPrice").get(function () {
  return Math.round(this.price * (1 - this.discountPercent / 100));
});

productSchema.virtual("totalStock").get(function () {
  if (this.variants && this.variants.length > 0) {
    return this.variants.reduce((sum, v) => sum + v.stock, 0);
  }
  return this.stock;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1, isBestseller: 1, isNewArrival: 1, isFlashSale: 1 });

export default mongoose.model("Product", productSchema);
