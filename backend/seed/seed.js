import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";

dotenv.config();

const CATEGORIES = [
  { name: "Men's Clothing", image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600" },
  { name: "Women's Clothing", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600" },
  { name: "Shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600" },
  { name: "Accessories", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600" },
  { name: "Electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600" },
  { name: "Watches", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600" },
  { name: "Beauty", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600" },
  { name: "Home & Lifestyle", image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600" },
];

const BRANDS = ["Nexora Essentials", "Urban Stride", "Velour", "Apex Gear", "Lumen", "Solstice", "Cascade", "Nordic Form", "Bravo Co", "Aether"];

const ADJECTIVES = ["Classic", "Premium", "Modern", "Signature", "Everyday", "Sport", "Deluxe", "Essential", "Heritage", "Studio"];
const PRODUCT_NOUNS = {
  "Men's Clothing": ["Crew T-Shirt", "Slim Fit Jeans", "Oxford Shirt", "Bomber Jacket", "Chino Trousers", "Hooded Sweatshirt", "Polo Shirt", "Cargo Pants"],
  "Women's Clothing": ["Wrap Dress", "High-Rise Jeans", "Silk Blouse", "Trench Coat", "Pleated Skirt", "Knit Sweater", "Linen Jumpsuit", "Cropped Blazer"],
  "Shoes": ["Running Sneakers", "Leather Loafers", "Ankle Boots", "Canvas Trainers", "Court Sneakers", "Chelsea Boots", "Sport Sandals", "Suede Derbies"],
  "Accessories": ["Leather Belt", "Canvas Tote Bag", "Aviator Sunglasses", "Silk Scarf", "Leather Wallet", "Baseball Cap", "Crossbody Bag", "Wool Beanie"],
  "Electronics": ["Wireless Earbuds", "Smart Speaker", "Noise Cancelling Headphones", "Fitness Tracker", "Portable Charger", "Bluetooth Speaker", "Smart Home Hub", "Wireless Mouse"],
  "Watches": ["Chronograph Watch", "Minimalist Watch", "Automatic Watch", "Digital Sport Watch", "Leather Strap Watch", "Steel Bracelet Watch"],
  "Beauty": ["Hydrating Serum", "Matte Lipstick", "Vitamin C Cream", "Perfume Eau de Parfum", "Facial Cleanser", "Body Lotion", "Sunscreen SPF50", "Eyeshadow Palette"],
  "Home & Lifestyle": ["Ceramic Vase", "Scented Candle Set", "Cotton Throw Blanket", "Stoneware Mug Set", "Table Lamp", "Woven Storage Basket", "Wall Art Print", "Bamboo Cutting Board"],
};

const IMAGE_POOL = {
  "Men's Clothing": ["photo-1516257984-b1b4d707412e", "photo-1521572163474-6864f9cf17ab", "photo-1594938298603-c8148c4dae35"],
  "Women's Clothing": ["photo-1490481651871-ab68de25d43d", "photo-1544022613-e87ca75a784a", "photo-1487222477894-8943e31ef7b2"],
  "Shoes": ["photo-1542291026-7eec264c27ff", "photo-1549298916-b41d501d3772", "photo-1608231387042-66d1773070a5"],
  "Accessories": ["photo-1524592094714-0f0654e20314", "photo-1591561954557-26941169b49e", "photo-1553062407-98eeb64c6a62"],
  "Electronics": ["photo-1498049794561-7780e7231661", "photo-1505740420928-5e560c06d30e", "photo-1546435770-a3e426bf472b"],
  "Watches": ["photo-1524805444758-089113d48a6d", "photo-1523170335258-f5ed11844a49", "photo-1434493789847-2f02dc6ca35d"],
  "Beauty": ["photo-1522335789203-aabd1fc54bc9", "photo-1512496015851-a90fb38ba796", "photo-1571781926291-c477ebfd024b"],
  "Home & Lifestyle": ["photo-1484101403633-562f891dc89a", "photo-1513694203232-719a280e022f", "photo-1524758631624-e2822e304c36"],
};

const COLORS = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Beige", hex: "#d9c7a3" },
  { name: "Olive", hex: "#5f6b3a" },
  { name: "Burgundy", hex: "#6b1f2a" },
];
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["6", "7", "8", "9", "10", "11"];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sample = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

const buildVariants = (categoryName) => {
  const hasSizes = ["Men's Clothing", "Women's Clothing", "Shoes"].includes(categoryName);
  if (!hasSizes) return { variants: [], sizes: [], colors: sample(COLORS, randInt(1, 3)) };

  const sizePool = categoryName === "Shoes" ? SHOE_SIZES : CLOTHING_SIZES;
  const colors = sample(COLORS, randInt(1, 3));
  const sizes = sample(sizePool, randInt(3, sizePool.length));
  const variants = [];
  colors.forEach((color) => {
    sizes.forEach((size) => {
      variants.push({
        size,
        color: color.name,
        colorHex: color.hex,
        stock: randInt(0, 40),
        sku: `${size}-${color.name.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      });
    });
  });
  return { variants, sizes, colors };
};

const seedProducts = async (categories, brands) => {
  const products = [];
  let skuCounter = 1000;

  for (const category of categories) {
    const nouns = PRODUCT_NOUNS[category.name];
    const images = IMAGE_POOL[category.name];

    for (let i = 0; i < 14; i++) {
      const noun = rand(nouns);
      const adjective = rand(ADJECTIVES);
      const brand = rand(brands);
      const basePrice = randInt(499, 12999);
      const discountPercent = rand([0, 0, 10, 15, 20, 25, 30, 40]);
      const { variants, sizes, colors } = buildVariants(category.name);
      const totalStock = variants.length > 0 ? variants.reduce((s, v) => s + v.stock, 0) : randInt(0, 100);

      products.push({
        name: `${adjective} ${noun}`,
        sku: `NEX-${skuCounter++}`,
        brand: brand._id,
        category: category._id,
        description: `The ${adjective} ${noun} from ${brand.name} combines everyday comfort with a refined finish. Thoughtfully constructed using premium materials, designed to perform beautifully wear after wear.`,
        shortDescription: `${adjective} ${noun} by ${brand.name}`,
        price: basePrice,
        discountPercent,
        images: images.map((id, idx) => ({ url: `https://images.unsplash.com/${id}?w=900&auto=format`, publicId: `${id}-${idx}` })),
        colors,
        sizes,
        variants,
        stock: variants.length > 0 ? 0 : totalStock,
        specifications: [
          { key: "Material", value: rand(["Cotton Blend", "Genuine Leather", "Recycled Polyester", "Stainless Steel", "Aluminum"]) },
          { key: "Origin", value: rand(["Imported", "Made in India", "Made in Italy"]) },
          { key: "Care", value: rand(["Machine wash cold", "Wipe clean", "Dry clean only"]) },
        ],
        tags: [category.name.toLowerCase(), brand.name.toLowerCase(), adjective.toLowerCase()],
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        numReviews: randInt(0, 240),
        isFeatured: Math.random() < 0.15,
        isBestseller: Math.random() < 0.15,
        isNewArrival: Math.random() < 0.2,
        isFlashSale: discountPercent >= 30,
        flashSaleEndsAt: discountPercent >= 30 ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : undefined,
        status: "active",
        lowStockThreshold: 5,
      });
    }
  }
  return Product.insertMany(products);
};

const run = async () => {
  await connectDB();

  const destroy = process.argv.includes("-d");

  if (destroy) {
    await Promise.all([
      User.deleteMany({ role: "customer" }),
      Category.deleteMany(),
      Brand.deleteMany(),
      Product.deleteMany(),
      Coupon.deleteMany(),
    ]);
    console.log("Data destroyed.");
    process.exit(0);
  }

  console.log("Seeding NEXORA database...");

  const force = process.argv.includes("-f") || process.argv.includes("--force");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@nexora.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: process.env.ADMIN_NAME || "Nexora Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "ChangeThisPassword123!",
      role: "admin",
    });
    console.log(`Admin account created: ${adminEmail}`);
  } else {
    console.log("Admin account already exists, skipping.");
  }

  // Safety: without --force, never wipe existing catalog data. This script used to
  // unconditionally delete categories/brands/products/coupons on every run, which
  // silently destroyed anything an admin had added through the dashboard. Now it
  // only does a destructive reseed when explicitly asked with -f / --force, and
  // otherwise just tops up missing demo data without touching what already exists.
  const existingProductCount = await Product.countDocuments();
  if (existingProductCount > 0 && !force) {
    console.log(
      `Found ${existingProductCount} existing products — skipping catalog reseed to avoid wiping admin data.`
    );
    console.log('Run "npm run seed -- --force" if you really want to wipe and reseed the catalog.');
    console.log("Seeding complete.");
    process.exit(0);
  }

  if (force) {
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    console.log("--force passed: wiped existing categories, brands, products, coupons.");
  }

  const categories = await Category.insertMany(
    CATEGORIES.map((c, idx) => ({ ...c, displayOrder: idx }))
  );
  const brands = await Brand.insertMany(BRANDS.map((name) => ({ name })));

  const products = await seedProducts(categories, brands);
  console.log(`Inserted ${categories.length} categories, ${brands.length} brands, ${products.length} products.`);

  await Coupon.insertMany([
    {
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      minOrderAmount: 999,
      maxDiscountAmount: 500,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      usageLimit: null,
      perUserLimit: 1,
      isActive: true,
    },
    {
      code: "FLAT200",
      type: "fixed",
      value: 200,
      minOrderAmount: 1500,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      perUserLimit: 2,
      isActive: true,
    },
  ]);
  console.log("Sample coupons created: WELCOME10, FLAT200");

  console.log("Seeding complete.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
