require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const MONGO_URI = process.env.MONGO_URI;
const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SITE_CODE } = process.env;

async function connectDB() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI must be set");
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

async function seedAdmin() {
  if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_SITE_CODE) {
    throw new Error(
      "ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SITE_CODE must be set"
    );
  }

  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters");
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const exists = await User.findOne({ email });
  if (exists) {
    throw new Error(`An account with ${email} already exists`);
  }

  const admin = new User({
    username: ADMIN_USERNAME.trim(),
    email,
    password: ADMIN_PASSWORD,
    role: "admin",
    siteCode: ADMIN_SITE_CODE.trim()
  });
  await admin.save();
  console.log(`✅ Created administrator account for ${email}`);
}

async function main() {
  await connectDB();
  try {
    await seedAdmin();
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(err => {
  console.error("❌ Administrator setup failed:", err.message);
  process.exitCode = 1;
});
