require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

async function seedClients() {
  const clients = [
    {
      username: "SCode",
      email: "kimbon226@gmail.com",
      password: "SCode1",
      role: "admin",
      siteCode: "SCode01",
    },
    {
      username: "Client2",
      email: "client2@example.com",
      password: "TempPass234",
      role: "client",
      siteCode: "scode203",
    },
    {
      username: "Client3",
      email: "client3@example.com",
      password: "TempPass345",
      role: "client",
      siteCode: "scode204",
    },
    {
      username: "Client4",
      email: "client4@example.com",
      password: "TempPass456",
      role: "client",
      siteCode: "scode205",
    },
  ];

  for (let c of clients) {
    const exists = await User.findOne({ email: c.email });
    if (!exists) {
      const user = new User(c);
      await user.save();
      console.log(`✅ Created ${c.username} (${c.email})`);
    } else {
      console.log(`⚠️ ${c.email} already exists, skipping`);
    }
  }
}

async function main() {
  await connectDB();
  await seedClients();
  await mongoose.disconnect();
  console.log("🎉 Seeding complete!");
}

main();
